import * as Engine from './engine.js';
import * as Sound from './sound.js';
import {cloneBoard} from './board.js';

export function renderBoard(board, root, cols, rows){
  root.innerHTML = '';
  const container = document.createElement('div');
  container.className = 'grid';
  container.style.gridTemplateColumns = `repeat(${cols}, auto)`;
  for(let r=0;r<rows;r++){
    for(let c=0;c<cols;c++){
      const tile = board[r][c];
      const el = document.createElement('div');
      el.className = 'cell basic';
      el.dataset.r = String(r);
      el.dataset.c = String(c);
      if(tile){
        el.textContent = tile.v;
        if(tile.p) el.classList.add('power-'+tile.p);
      } else {
        el.classList.add('empty');
      }
      container.appendChild(el);
    }
  }
  root.appendChild(container);
}

export class UIManager{
  constructor(opts){
    this.root = opts.root; this.board = opts.board; this.cols = opts.cols; this.rows = opts.rows;
    this.onChange = opts.onChange || (()=>{});
    this.selected = null;
    this.previewQueue = []; this.previewTimer = null; this._animating=false; this._processingPreview=false;

    // hint
    this.hint = null; this.hintTimer = null; this.hintDelay = (opts && opts.hintDelay) || 10000;
    this.resetHintTimer();
  }

  render(){ renderBoard(this.board, this.root, this.cols, this.rows); this.attachCellHandlers();
    if(this.hint && this.hint.a && this.hint.b){ const aEl = this.root.querySelector(`.cell[data-r="${this.hint.a.r}"][data-c="${this.hint.a.c}"]`); const bEl = this.root.querySelector(`.cell[data-r="${this.hint.b.r}"][data-c="${this.hint.b.c}"]`); if(aEl) aEl.classList.add('hint'); if(bEl) bEl.classList.add('hint'); }
  }

  attachCellHandlers(){ const cells = this.root.querySelectorAll('.cell'); cells.forEach(el=>{ el.ontouchstart=(e)=>{ e.preventDefault(); this._touchStart={x:e.touches[0].clientX,y:e.touches[0].clientY,el}; }; el.ontouchend=(e)=>{ e.preventDefault(); const t=e.changedTouches[0]; this._handleTouchEnd(t, el); }; el.onclick=()=>{ this._handleClick(el); this.resetHintTimer(); }; }); }

  _handleClick(el){ const r=Number(el.dataset.r), c=Number(el.dataset.c); const pos={r,c}; if(!this.selected){ this.selected=pos; el.classList.add('selected'); } else { const prev=this.selected; if(prev.r===pos.r && prev.c===pos.c){ this.selected=null; el.classList.remove('selected'); return; } if(Math.abs(prev.r-pos.r)+Math.abs(prev.c-pos.c)===1){ this._attemptSwap(prev,pos); } else { this._clearSelection(); this.selected=pos; el.classList.add('selected'); } } }

  _handleTouchEnd(touch, el){ const start=this._touchStart; if(!start) return; const dx=touch.clientX-start.x, dy=touch.clientY-start.y; const absx=Math.abs(dx), absy=Math.abs(dy); const r=Number(el.dataset.r), c=Number(el.dataset.c); if(Math.max(absx,absy)<18){ this._handleClick(el); this.resetHintTimer(); return; } let target; if(absx>absy) target={r, c: c + (dx>0?1:-1)}; else target={r: r + (dy>0?1:-1), c}; if(target.r<0||target.r>=this.rows||target.c<0||target.c>=this.cols) return; this._attemptSwap({r,c}, target); this.resetHintTimer(); }

  _clearSelection(){ const prev=this.root.querySelector('.cell.selected'); if(prev) prev.classList.remove('selected'); this.selected=null; }

  _attemptSwap(a,b){ this._clearSelection(); this.clearHint(); const elA=this.root.querySelector(`.cell[data-r="${a.r}"][data-c="${a.c}"]`); const elB=this.root.querySelector(`.cell[data-r="${b.r}"][data-c="${b.c}"]`); try{ const isValid = Engine.isValidSwap(this.board,a,b); if(elA && elB){ const ra=elA.getBoundingClientRect(), rb=elB.getBoundingClientRect(); const dx=rb.left-ra.left, dy=rb.top-ra.top; elA.style.transform=`translate(${dx}px, ${dy}px)`; elB.style.transform=`translate(${-dx}px, ${-dy}px)`; elA.classList.add('anim-swap'); elB.classList.add('anim-swap'); const onFirstEnd = ()=>{ elA.removeEventListener('transitionend', onFirstEnd); if(isValid){ try{ Engine.swapTiles(this.board,a,b); }catch(e){ console.error('swapTiles failed', e); } this.render(); this._applyEngineSwapAndResolve(a,b,{skipSwap:true}); setTimeout(()=>{ const nA=this.root.querySelector(`.cell[data-r="${a.r}"][data-c="${a.c}"]`); const nB=this.root.querySelector(`.cell[data-r="${b.r}"][data-c="${b.c}"]`); if(nA){ nA.style.transform=''; nA.classList.remove('anim-swap'); } if(nB){ nB.style.transform=''; nB.classList.remove('anim-swap'); } },50); } else { requestAnimationFrame(()=>{ elA.style.transform=''; elB.style.transform=''; }); const onRevertEnd = ()=>{ elA.removeEventListener('transitionend', onRevertEnd); elA.classList.remove('anim-swap'); elB.classList.remove('anim-swap'); elA.style.transform=''; elB.style.transform=''; }; elA.addEventListener('transitionend', onRevertEnd); setTimeout(()=>{ if(elA) elA.dispatchEvent(new Event('transitionend')); },320); } }; elA.addEventListener('transitionend', onFirstEnd); setTimeout(()=>{ if(elA) elA.dispatchEvent(new Event('transitionend')); },320); } else { Engine.swapTiles(this.board,a,b); this._applyEngineSwapAndResolve(a,b,{skipSwap:true}); } }catch(err){ console.warn('Engine swap failed, applying fallback swap', err); try{ Engine.swapTiles(this.board,a,b); this.render(); this.onChange && this.onChange({type:'swap', a, b, removed:0}); }catch(e){ console.error('Fallback swap also failed', e); } } }

  _applyEngineSwapAndResolve(a,b, opts={}){ try{ const result = Engine.handleSwapAndResolve(this.board,a,b,opts); for(const p of result.phases) this.previewQueue.push(p); console.debug('Engine produced phases:', result.phases && result.phases.length, result.phases.map(p=>p.type)); result.phases.forEach((p,i)=>{ if(p.board){ let nulls=0; for(const row of p.board) for(const cell of row) if(!cell) nulls++; console.debug(`phase[${i}]=${p.type} nulls=${nulls}`); } }); this.render(); this.onChange && this.onChange({type:'swap', a,b, removed: result.removedCount, score: result.score}); if(this.previewQueue.length>0) this.playPreview(260); this.resetHintTimer(); }catch(err){ console.error('Error resolving swap in engine', err); } }

  async stepPreview(){ if(this._animating || this._processingPreview) return; if(this.previewQueue.length===0) return; this._processingPreview=true; while(this.previewQueue.length>0){ const next=this.previewQueue.shift(); if(!next) break; if(next.type==='bomb-explode'){ this._animating=true; try{ Sound.playMatch(); }catch(e){} const origin = next.origin || {r: next.r, c: next.c}; const mappedRemovals = (next.removals||[]).map(k=>{ if(typeof k==='string'){ const [r,c]=k.split(',').map(Number); return {r,c}; } return k; }); if(origin){ const oel=this.root.querySelector(`.cell[data-r="${origin.r}"][data-c="${origin.c}"]`); if(oel) oel.classList.add('bomb-primed'); } await new Promise(res=> setTimeout(res,200)); for(const p of mappedRemovals){ const el=this.root.querySelector(`.cell[data-r="${p.r}"][data-c="${p.c}"]`); if(el) el.classList.add('anim-remove'); } await new Promise(res=> setTimeout(res,300)); for(const p of mappedRemovals){ const el=this.root.querySelector(`.cell[data-r="${p.r}"][data-c="${p.c}"]`); if(el) el.classList.remove('anim-remove'); } if(origin){ const oel=this.root.querySelector(`.cell[data-r="${origin.r}"][data-c="${origin.c}"]`); if(oel) oel.classList.remove('bomb-primed'); } this._animating=false; continue; }

      this.resetHintTimer();

      if(next.type==='match-found' && next.groups && next.groups.length>0){ this._animating=true; try{ Sound.playMatch(); }catch(e){} const cellsToAnimate=[]; for(const g of next.groups) for(const p of g.cells) cellsToAnimate.push(p); for(const p of cellsToAnimate){ const el=this.root.querySelector(`.cell[data-r="${p.r}"][data-c="${p.c}"]`); if(el) el.classList.add('anim-remove'); } await new Promise(res=> setTimeout(res,260)); for(const p of cellsToAnimate){ const el=this.root.querySelector(`.cell[data-r="${p.r}"][data-c="${p.c}"]`); if(el) el.classList.remove('anim-remove'); } this._animating=false; continue; }

      if(next.type==='power-activated'){ if(next.power==='bomb'){ this._animating=true; try{ Sound.playMatch(); }catch(e){} const origin = next.origin || null; const mapped = (next.removals||[]).map(k=>{ if(typeof k==='string'){ const [r,c]=k.split(',').map(Number); return {r,c}; } return k; }); if(origin){ const oel=this.root.querySelector(`.cell[data-r="${origin.r}"][data-c="${origin.c}"]`); if(oel) oel.classList.add('bomb-primed'); } await new Promise(res=> setTimeout(res,220)); for(const p of mapped){ const el=this.root.querySelector(`.cell[data-r="${p.r}"][data-c="${p.c}"]`); if(el) el.classList.add('anim-remove'); } await new Promise(res=> setTimeout(res,280)); for(const p of mapped){ const el=this.root.querySelector(`.cell[data-r="${p.r}"][data-c="${p.c}"]`); if(el) el.classList.remove('anim-remove'); } if(origin){ const oel=this.root.querySelector(`.cell[data-r="${origin.r}"][data-c="${origin.c}"]`); if(oel) oel.classList.remove('bomb-primed'); } if(next.board){ this.board = next.board.map(r=> r.map(c=>{ if(!c) return null; if(typeof c==='string') return {v:c,p:null}; if(typeof c.v!=='undefined') return {v:c.v,p:c.p||null}; try{ return {v:c,p:null}; }catch(e){ console.warn('unexpected cell shape in snapshot', c); return null; } })); this.render(); } this._animating=false; continue; } }

      if(next.board){ let nulls=0; for(const row of next.board) for(const cell of row) if(!cell) nulls++; console.debug('Applying phase', next.type, 'nulls in snapshot:', nulls); this.board = next.board.map(r=> r.map(c=>{ if(!c) return null; if(typeof c==='string') return {v:c,p:null}; if(typeof c.v!=='undefined') return {v:c.v,p:c.p||null}; try{ return {v:c,p:null}; }catch(e){ console.warn('unexpected cell shape in snapshot', c); return null; } })); this.render(); }

      if(next.type && next.type==='after-swap'){ try{ Sound.playSwap(); }catch(e){} }
      await new Promise(res=> setTimeout(res,180));
    }
    this._processingPreview=false;
  }

  playPreview(speed=350){ if(this.previewTimer) return; this.previewTimer = setInterval(()=>{ if(this.previewQueue.length===0){ this.stopPreview(); return; } this.stepPreview(); }, speed); }

  stopPreview(){ if(this.previewTimer){ clearInterval(this.previewTimer); this.previewTimer=null; } this.previewQueue=[]; }

  // Hint helpers
  resetHintTimer(){ try{ if(this.hintTimer) clearTimeout(this.hintTimer); }catch(e){} this.hintTimer = setTimeout(()=> this.showHint(), this.hintDelay); this.clearHint(); }
  clearHint(){ this.hint=null; const prev=this.root.querySelectorAll('.cell.hint'); for(const el of prev) el.classList.remove('hint'); }
  showHint(){ const move=this.findHintMove(); if(!move){ this.hintTimer = setTimeout(()=> this.showHint(), 6000); return null; } this.hint={a:move.a,b:move.b}; this.render(); try{ Sound.playHint(); }catch(e){} setTimeout(()=>{ this.clearHint(); this.resetHintTimer(); }, 6000); return move; }
  findHintMove(){ for(let r=0;r<this.rows;r++){ for(let c=0;c<this.cols;c++){ const a={r,c}; const neighbors=[{r:r,c:c+1},{r:r+1,c:c}]; for(const b of neighbors){ if(b.r<0||b.r>=this.rows||b.c<0||b.c>=this.cols) continue; const copy = cloneBoard(this.board); try{ Engine.swapTiles(copy,a,b); }catch(e){ continue; } const groups = Engine.findMatches(copy); if(groups && groups.length>0){ const best = groups.reduce((acc,g)=> Math.max(acc,g.len||0),0); return {a,b,bestLen:best,groups}; } } } } return null; }
}
              if(next.type==='match-found' && next.groups && next.groups.length>0){
                this._animating = true;
                try{ Sound.playMatch(); }catch(e){}
                const cellsToAnimate = [];
                for(const g of next.groups){ for(const p of g.cells) cellsToAnimate.push(p); }
                for(const p of cellsToAnimate){ const el = this.root.querySelector(`.cell[data-r="${p.r}"][data-c="${p.c}"]`); if(el) el.classList.add('anim-remove'); }
                await new Promise(res=> setTimeout(res, 260));
                for(const p of cellsToAnimate){ const el = this.root.querySelector(`.cell[data-r="${p.r}"][data-c="${p.c}"]`); if(el) el.classList.remove('anim-remove'); }
                this._animating = false;
                continue;
              }
              if(next.type==='power-activated'){
                if(next.power=== 'bomb'){
                  this._animating = true;
                  try{ Sound.playMatch(); }catch(e){}
                  const origin = next.origin || null;
                  const removals = (next.removals || []).map(k=>{ if(typeof k==='string'){ const [r,c]=k.split(',').map(Number); return {r,c}; } return k; });
                  if(origin){ const oel = this.root.querySelector(`.cell[data-r="${origin.r}"][data-c="${origin.c}"]`); if(oel) oel.classList.add('bomb-primed'); }
                  await new Promise(res=> setTimeout(res, 220));
                  for(const p of removals){ const el = this.root.querySelector(`.cell[data-r="${p.r}"][data-c="${p.c}"]`); if(el) el.classList.add('anim-remove'); }
                  await new Promise(res=> setTimeout(res, 280));
                  for(const p of removals){ const el = this.root.querySelector(`.cell[data-r="${p.r}"][data-c="${p.c}"]`); if(el) el.classList.remove('anim-remove'); }
                  if(origin){ const oel = this.root.querySelector(`.cell[data-r="${origin.r}"][data-c="${origin.c}"]`); if(oel) oel.classList.remove('bomb-primed'); }
                  if(next.board){ this.board = next.board.map(r=>r.map(c=> c? {v:c.v, p:c.p} : null)); this.render(); }
                    if(next.board){
                      this.board = next.board.map(r=> r.map(c=>{
                        if(!c) return null;
                        if(typeof c === 'string') return {v: c, p: null};
                        if(typeof c.v !== 'undefined') return {v: c.v, p: c.p || null};
                        // fallback: try common shapes
                        try{ return {v: c, p: null}; }catch(e){ console.warn('unexpected cell shape in snapshot', c); return null; }
                      }));
                      this.render();
                    }
                    if(next.board){
                      this.board = next.board.map(r=> r.map(c=>{
                        if(!c) return null;
                        if(typeof c === 'string') return {v: c, p: null};
                        if(typeof c.v !== 'undefined') return {v: c.v, p: c.p || null};
                        try{ return {v: c, p: null}; }catch(e){ console.warn('unexpected cell shape in snapshot', c); return null; }
                      }));
                      this.render();
                    }
                  this._animating = false;
                  continue;
                }
              }
              if(next.board){
                let nulls = 0; for(const row of next.board) for(const cell of row) if(!cell) nulls++;
                console.debug('Applying phase', next.type, 'nulls in snapshot:', nulls);
                  this.board = next.board.map(r=>r.map(c=>{
                    if(!c) return null;
                    if(typeof c === 'string') return {v: c, p: null};
                    if(typeof c.v !== 'undefined') return {v: c.v, p: c.p || null};
                    try{ return {v: c, p: null}; }catch(e){ console.warn('unexpected cell shape in snapshot', c); return null; }
                  }));
                  this.render();
                }
                this.render();
              }
              if(next.type && next.type==='after-swap'){ try{ Sound.playSwap(); }catch(e){} }
              await new Promise(res=> setTimeout(res, 180));
            }
            this._processingPreview = false;
          }

          playPreview(speed=350){
            if(this.previewTimer) return;
            this.previewTimer = setInterval(()=>{
              if(this.previewQueue.length===0){ this.stopPreview(); return; }
              this.stepPreview();
            }, speed);
          }

          stopPreview(){ if(this.previewTimer){ clearInterval(this.previewTimer); this.previewTimer=null; } this.previewQueue = []; }

          // Hint logic
          resetHintTimer(){
            try{ if(this.hintTimer) clearTimeout(this.hintTimer); }catch(e){}
            this.hintTimer = setTimeout(()=> this.showHint(), this.hintDelay);
            this.clearHint();
          }

          clearHint(){
            this.hint = null;
            const prev = this.root.querySelectorAll('.cell.hint'); for(const el of prev) el.classList.remove('hint');
          }

          showHint(){
            const move = this.findHintMove();
            if(!move){ this.hintTimer = setTimeout(()=> this.showHint(), 6000); return null; }
            this.hint = {a: move.a, b: move.b};
            this.render();
            try{ Sound.playHint(); }catch(e){}
            setTimeout(()=>{ this.clearHint(); this.resetHintTimer(); }, 6000);
            return move;
          }

          findHintMove(){
            for(let r=0;r<this.rows;r++){
              for(let c=0;c<this.cols;c++){
                const a = {r,c};
                const neighbors = [ {r:r, c:c+1}, {r:r+1, c:c} ];
                for(const b of neighbors){
                  if(b.r<0||b.r>=this.rows||b.c<0||b.c>=this.cols) continue;
                  const copy = cloneBoard(this.board);
                  try{ Engine.swapTiles(copy, a, b); }catch(e){ continue; }
                  const groups = Engine.findMatches(copy);
                  if(groups && groups.length>0){ const best = groups.reduce((acc,g)=> Math.max(acc, g.len||0), 0); return {a,b, bestLen: best, groups}; }
                }
              }
            }
            return null;
          }
        }
