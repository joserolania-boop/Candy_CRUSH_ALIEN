import * as Engine from './engine.js';
import * as Sound from './sound.js';
import Particles from './particles_helper.js';
import {cloneBoard} from './board.js';

function getPowerIcon(p){
  if(p === 'hammer') return '🔨';
  if(p === 'bomb') return '💣';
  if(p === 'wrapped') return '🎁';
  if(p === 'colorbomb') return '🌈';
  if(p === 'striped') return '⚡';
  return '?';
}

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
        if(tile.p){
          el.textContent = getPowerIcon(tile.p);
          el.classList.add('power-'+tile.p);
        } else {
          el.textContent = tile.v;
        }
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
    // initialize particle helper (will respect reduced-motion flag)
    try{ Particles.init('#space-bg'); }catch(e){}

    // combo counter
    this._combo = 0;
    this._comboEl = null; // will be created on first combo

    // small helpers for audio mapping
    this._mapColToPan = (c)=>{
      try{ if(typeof c!=='number' || !this.cols || this.cols<=1) return 0; const t = (c/(this.cols-1)); return Math.max(-0.9, Math.min(0.9, (t*1.2)-0.6)); }catch(e){ return 0; }
    };

    // notification helper
    this.showNotification = (text) => {
      const notif = document.getElementById('notification');
      if(notif){
        notif.textContent = text;
        notif.style.display = 'block';
        setTimeout(() => { notif.style.display = 'none'; }, 2000);
      }
    };
    this._playSFX = (name, opts={})=>{
      try{
        if(Sound && typeof Sound.playSFX === 'function'){
          Sound.playSFX(name, opts);
        } else {
          // fallback to older API
          if(name==='swap' && typeof Sound.playSwap==='function') Sound.playSwap();
          else if(name==='match' && typeof Sound.playMatch==='function') Sound.playMatch();
          else if(name==='hint' && typeof Sound.playHint==='function') Sound.playHint();
          else if(typeof Sound.playMatch==='function') Sound.playMatch();
        }
      }catch(e){ try{ if(typeof Sound.playMatch==='function') Sound.playMatch(); }catch(err){} }
    };

    // spawn a short particle burst centered on a cell element
    this._spawnMatchParticlesAtCell = (cellEl)=>{
      try{
        if(!cellEl) return;
        const rect = cellEl.getBoundingClientRect();
        const parent = document.querySelector('#space-bg') || document.body;
        const parentRect = parent.getBoundingClientRect();
        const x = rect.left - parentRect.left + rect.width/2;
        const y = rect.top - parentRect.top + rect.height/2;
        Particles.spawnBurst('#space-bg', x, y, {count: 10, spread: 36});
      }catch(e){/* ignore */}
    };

    // Debug helpers removed: no globals attached to `window` to keep namespace clean.
  }

  render(){
    renderBoard(this.board, this.root, this.cols, this.rows);
    this.attachCellHandlers();
    if(this.hint && this.hint.a && this.hint.b){
      const aEl = this.root.querySelector(`.cell[data-r="${this.hint.a.r}"][data-c="${this.hint.a.c}"]`);
      const bEl = this.root.querySelector(`.cell[data-r="${this.hint.b.r}"][data-c="${this.hint.b.c}"]`);
      if(aEl) aEl.classList.add('hint'); if(bEl) bEl.classList.add('hint');
    }
  }

  attachCellHandlers(){
    const cells = this.root.querySelectorAll('.cell');
    cells.forEach(el=>{
      el.ontouchstart=(e)=>{ e.preventDefault(); this._touchStart={x:e.touches[0].clientX,y:e.touches[0].clientY,el}; };
      el.ontouchend=(e)=>{ e.preventDefault(); const t=e.changedTouches[0]; this._handleTouchEnd(t, el); };
      el.onclick=()=>{ this._handleClick(el); this.resetHintTimer(); };
    });
  }

  _handleClick(el){
    const r=Number(el.dataset.r), c=Number(el.dataset.c); const pos={r,c};
    if(!this.selected){ this.selected=pos; el.classList.add('selected'); }
    else { const prev=this.selected; if(prev.r===pos.r && prev.c===pos.c){ this.selected=null; el.classList.remove('selected'); return; }
      if(Math.abs(prev.r-pos.r)+Math.abs(prev.c-pos.c)===1){ this._attemptSwap(prev,pos); }
      else { this._clearSelection(); this.selected=pos; el.classList.add('selected'); }
    }
  }

  _handleTouchEnd(touch, el){
    const start=this._touchStart; if(!start) return;
    const dx=touch.clientX-start.x, dy=touch.clientY-start.y; const absx=Math.abs(dx), absy=Math.abs(dy);
    const r=Number(el.dataset.r), c=Number(el.dataset.c);
    if(Math.max(absx,absy)<18){ this._handleClick(el); this.resetHintTimer(); return; }
    let target;
    if(absx>absy) target={r, c: c + (dx>0?1:-1)}; else target={r: r + (dy>0?1:-1), c};
    if(target.r<0||target.r>=this.rows||target.c<0||target.c>=this.cols) return;
    this._attemptSwap({r,c}, target); this.resetHintTimer();
  }

  _clearSelection(){ const prev=this.root.querySelector('.cell.selected'); if(prev) prev.classList.remove('selected'); this.selected=null; }

  _attemptSwap(a,b){
    this._clearSelection(); this.clearHint();
    const elA=this.root.querySelector(`.cell[data-r="${a.r}"][data-c="${a.c}"]`);
    const elB=this.root.querySelector(`.cell[data-r="${b.r}"][data-c="${b.c}"]`);
    try{
      const isValid = Engine.isValidSwap(this.board,a,b);
      if(elA && elB){
        const ra=elA.getBoundingClientRect(), rb=elB.getBoundingClientRect();
        const dx=rb.left-ra.left, dy=rb.top-ra.top;
        elA.style.transform=`translate(${dx}px, ${dy}px)`; elB.style.transform=`translate(${-dx}px, ${-dy}px)`;
        elA.classList.add('anim-swap'); elB.classList.add('anim-swap');
        const onFirstEnd = ()=>{
          elA.removeEventListener('transitionend', onFirstEnd);
          if(isValid){ try{ Engine.swapTiles(this.board,a,b); }catch(e){ console.error('swapTiles failed', e); }
            this.render(); this._applyEngineSwapAndResolve(a,b,{skipSwap:true});
            setTimeout(()=>{ const nA=this.root.querySelector(`.cell[data-r="${a.r}"][data-c="${a.c}"]`); const nB=this.root.querySelector(`.cell[data-r="${b.r}"][data-c="${b.c}"]`); if(nA){ nA.style.transform=''; nA.classList.remove('anim-swap'); } if(nB){ nB.style.transform=''; nB.classList.remove('anim-swap'); } },50);
          } else {
            requestAnimationFrame(()=>{ elA.style.transform=''; elB.style.transform=''; });
            const onRevertEnd = ()=>{ elA.removeEventListener('transitionend', onRevertEnd); elA.classList.remove('anim-swap'); elB.classList.remove('anim-swap'); elA.style.transform=''; elB.style.transform=''; };
            elA.addEventListener('transitionend', onRevertEnd);
            setTimeout(()=>{ if(elA) elA.dispatchEvent(new Event('transitionend')); },320);
          }
        };
        elA.addEventListener('transitionend', onFirstEnd);
        setTimeout(()=>{ if(elA) elA.dispatchEvent(new Event('transitionend')); },320);
      } else { Engine.swapTiles(this.board,a,b); this._applyEngineSwapAndResolve(a,b,{skipSwap:true}); }
    }catch(err){
      console.warn('Engine swap failed, applying fallback swap', err);
      try{ Engine.swapTiles(this.board,a,b); this.render(); this.onChange && this.onChange({type:'swap', a, b, removed:0}); }catch(e){ console.error('Fallback swap also failed', e); }
    }
  }

  _applyEngineSwapAndResolve(a,b, opts={}){
    try{
      const result = Engine.handleSwapAndResolve(this.board,a,b,opts);
      if(result && result.phases){ for(const p of result.phases) this.previewQueue.push(p); }
      console.debug('Engine produced phases:', result.phases && result.phases.length, result.phases && result.phases.map(p=>p.type));

      // Count power-ups created in all phases
      let powerUpsCreated = 0;
      if(result && result.phases){
        for(const phase of result.phases){
          if(phase.powerCreations && phase.powerCreations.length > 0){
            powerUpsCreated += phase.powerCreations.length;
          }
        }
      }

      if(result && result.phases){ result.phases.forEach((p,i)=>{ if(p.board){ let nulls=0; for(const row of p.board) for(const cell of row) if(!cell) nulls++; console.debug(`phase[${i}]=${p.type} nulls=${nulls}`); } }); }
      this.render(); this.onChange && this.onChange({type:'swap', a,b, removed: result.removedCount, score: result.score, powerUps: powerUpsCreated});
      if(this.previewQueue.length>0) this.playPreview(260);
      this.resetHintTimer();
    }catch(err){ console.error('Error resolving swap in engine', err); }
  }

  async stepPreview(){
    if(this._animating || this._processingPreview) return;
    if(this.previewQueue.length===0) return;
    // start processing a chain — reset combo counter for this resolution sequence
    this._combo = 0; if(this._comboEl) this._comboEl.classList.remove('show');
    this._processingPreview=true;
    while(this.previewQueue.length>0){
      const next=this.previewQueue.shift(); if(!next) break;

      // Bomb explosions
      if(next.type==='bomb-explode'){
        this._animating=true;
        const origin = next.origin || {r: next.r, c: next.c};
        try{ this._playSFX('bomb', { volume:0.72, pan: this._mapColToPan(origin.c) }); }catch(e){}
        const mappedRemovals = (next.removals||[]).map(k=>{ if(typeof k==='string'){ const [r,c]=k.split(',').map(Number); return {r,c}; } return k; });
        if(origin){ const oel=this.root.querySelector(`.cell[data-r="${origin.r}"][data-c="${origin.c}"]`); if(oel) oel.classList.add('bomb-primed'); }
        await new Promise(res=> setTimeout(res,50));
        for(const p of mappedRemovals){ const el=this.root.querySelector(`.cell[data-r="${p.r}"][data-c="${p.c}"]`); if(el) el.classList.add('anim-remove'); }
        await new Promise(res=> setTimeout(res,60));
        for(const p of mappedRemovals){ const el=this.root.querySelector(`.cell[data-r="${p.r}"][data-c="${p.c}"]`); if(el) el.classList.remove('anim-remove'); }
        if(origin){ const oel=this.root.querySelector(`.cell[data-r="${origin.r}"][data-c="${origin.c}"]`); if(oel) oel.classList.remove('bomb-primed'); }
        this._animating=false; continue;
      }

      // Hammer destroy
      if(next.type==='hammer-destroy'){
        this._animating=true;
        const origin = next.origin || {r: next.r, c: next.c};
        try{ this._playSFX('power', { volume:0.8, pan: this._mapColToPan(origin.c) }); }catch(e){}
        const mappedRemovals = (next.removals||[]).map(k=>{ if(typeof k==='string'){ const [r,c]=k.split(',').map(Number); return {r,c}; } return k; });
        if(origin){ const oel=this.root.querySelector(`.cell[data-r="${origin.r}"][data-c="${origin.c}"]`); if(oel) oel.classList.add('hammer-activated'); }
        await new Promise(res=> setTimeout(res,30));
        for(const p of mappedRemovals){ const el=this.root.querySelector(`.cell[data-r="${p.r}"][data-c="${p.c}"]`); if(el) el.classList.add('anim-remove'); }
        await new Promise(res=> setTimeout(res,60));
        for(const p of mappedRemovals){ const el=this.root.querySelector(`.cell[data-r="${p.r}"][data-c="${p.c}"]`); if(el) el.classList.remove('anim-remove'); }
        if(origin){ const oel=this.root.querySelector(`.cell[data-r="${origin.r}"][data-c="${origin.c}"]`); if(oel) oel.classList.remove('hammer-activated'); }
        this._animating=false; continue;
      }

      this.resetHintTimer();

      // match-found animations y power-up creation feedback
      if(next.type==='match-found' && next.groups && next.groups.length>0){
        this._animating=true;
        // play staggered match SFX per group, pitch up slightly per combo
        try{
          const baseRate = 1;
          next.groups.forEach((g, gi)=>{
            const firstCell = (g.cells && g.cells[0]) || null;
            const pan = firstCell ? this._mapColToPan(firstCell.c) : 0;
            this._playSFX('match', { volume:0.36, playbackRate: baseRate, pan, delay: gi*0.03 });
          });
        }catch(e){}
        const cellsToAnimate=[]; for(const g of next.groups) for(const p of g.cells) cellsToAnimate.push(p);
        for(const p of cellsToAnimate){
          const el=this.root.querySelector(`.cell[data-r="${p.r}"][data-c="${p.c}"]`);
          if(el){ el.classList.add('anim-remove'); try{ this._spawnMatchParticlesAtCell(el); }catch(e){} }
        }
        // Feedback visual para creación de power-ups
        if(next.powerCreations && next.powerCreations.length>0){
          for(const pc of next.powerCreations){
            const el=this.root.querySelector(`.cell[data-r="${pc.r}"][data-c="${pc.c}"]`);
            if(el){
              el.classList.add('powerup-created');
              setTimeout(()=>{ el.classList.remove('powerup-created'); }, 400);
            }
          }
        }
        await new Promise(res=> setTimeout(res,45));
        for(const p of cellsToAnimate){ const el=this.root.querySelector(`.cell[data-r="${p.r}"][data-c="${p.c}"]`); if(el) el.classList.remove('anim-remove'); }
        this._animating=false; continue;
      }

      // power activated (e.g., bomb, wrapped, colorbomb)
      if(next.type==='power-activated'){
        if(next.power==='bomb'){
          this._animating=true; try{ this._playSFX('bomb', { volume:0.72, pan: (next.origin? this._mapColToPan(next.origin.c) : 0) }); }catch(e){}
          const origin = next.origin || null;
          const mapped = (next.removals||[]).map(k=>{ if(typeof k==='string'){ const [r,c]=k.split(',').map(Number); return {r,c}; } return k; });
          if(origin){ const oel=this.root.querySelector(`.cell[data-r="${origin.r}"][data-c="${origin.c}"]`); if(oel){ oel.classList.add('bomb-primed'); try{ this._spawnMatchParticlesAtCell(oel); }catch(e){} } }
          await new Promise(res=> setTimeout(res,80));
          for(const p of mapped){ const el=this.root.querySelector(`.cell[data-r="${p.r}"][data-c="${p.c}"]`); if(el){ el.classList.add('anim-remove'); try{ this._spawnMatchParticlesAtCell(el); }catch(e){} } }
          await new Promise(res=> setTimeout(res,100));
          for(const p of mapped){ const el=this.root.querySelector(`.cell[data-r="${p.r}"][data-c="${p.c}"]`); if(el) el.classList.remove('anim-remove'); }
          if(origin){ const oel=this.root.querySelector(`.cell[data-r="${origin.r}"][data-c="${origin.c}"]`); if(oel) oel.classList.remove('bomb-primed'); }
          if(next.board){ this._applySnapshot(next.board); }
          this._animating=false; continue;
        }
        if(next.power==='wrapped'){
          this._animating=true; try{ this._playSFX('power', { volume:0.8, pan: (next.origin? this._mapColToPan(next.origin.c) : 0) }); }catch(e){}
          const origin = next.origin || null;
          const mapped = (next.removals||[]).map(k=>{ if(typeof k==='string'){ const [r,c]=k.split(',').map(Number); return {r,c}; } return k; });
          if(origin){ const oel=this.root.querySelector(`.cell[data-r="${origin.r}"][data-c="${origin.c}"]`); if(oel){ oel.classList.add('power-activated'); try{ this._spawnMatchParticlesAtCell(oel); }catch(e){} } }
          await new Promise(res=> setTimeout(res,30));
          for(const p of mapped){ const el=this.root.querySelector(`.cell[data-r="${p.r}"][data-c="${p.c}"]`); if(el){ el.classList.add('anim-remove'); try{ this._spawnMatchParticlesAtCell(el); }catch(e){} } }
          await new Promise(res=> setTimeout(res,60));
          for(const p of mapped){ const el=this.root.querySelector(`.cell[data-r="${p.r}"][data-c="${p.c}"]`); if(el) el.classList.remove('anim-remove'); }
          if(origin){ const oel=this.root.querySelector(`.cell[data-r="${origin.r}"][data-c="${origin.c}"]`); if(oel) oel.classList.remove('power-activated'); }
          if(next.board){ this._applySnapshot(next.board); }
          this._animating=false; continue;
        }
        if(next.power==='colorbomb'){
          this._animating=true; try{ this._playSFX('colorbomb', { volume:0.9, pan: (next.origin? this._mapColToPan(next.origin.c) : 0) }); }catch(e){}
          const origin = next.origin || null;
          const mapped = (next.removals||[]).map(k=>{ if(typeof k==='string'){ const [r,c]=k.split(',').map(Number); return {r,c}; } return k; });
          if(origin){ const oel=this.root.querySelector(`.cell[data-r="${origin.r}"][data-c="${origin.c}"]`); if(oel){ oel.classList.add('colorbomb-activated'); try{ this._spawnMatchParticlesAtCell(oel); }catch(e){} } }
          await new Promise(res=> setTimeout(res,50));
          for(const p of mapped){ const el=this.root.querySelector(`.cell[data-r="${p.r}"][data-c="${p.c}"]`); if(el){ el.classList.add('anim-remove'); try{ this._spawnMatchParticlesAtCell(el); }catch(e){} } }
          await new Promise(res=> setTimeout(res,75));
          for(const p of mapped){ const el=this.root.querySelector(`.cell[data-r="${p.r}"][data-c="${p.c}"]`); if(el) el.classList.remove('anim-remove'); }
          if(origin){ const oel=this.root.querySelector(`.cell[data-r="${origin.r}"][data-c="${origin.c}"]`); if(oel) oel.classList.remove('colorbomb-activated'); }
          if(next.board){ this._applySnapshot(next.board); }
          this._animating=false; continue;
        }
        if(next.power==='mega-bomb'){
          this.showNotification('💣 MEGA BOMB! 💣');
          this._animating=true; try{ this._playSFX('bomb', { volume:1.0, pan: (next.origin? this._mapColToPan(next.origin.c) : 0) }); }catch(e){}
          const origin = next.origin || null;
          const mapped = (next.removals||[]).map(k=>{ if(typeof k==='string'){ const [r,c]=k.split(',').map(Number); return {r,c}; } return k; });
          if(origin){ const oel=this.root.querySelector(`.cell[data-r="${origin.r}"][data-c="${origin.c}"]`); if(oel){ oel.classList.add('bomb-primed'); try{ this._spawnMatchParticlesAtCell(oel); }catch(e){} } }
          await new Promise(res=> setTimeout(res,80));
          for(const p of mapped){ const el=this.root.querySelector(`.cell[data-r="${p.r}"][data-c="${p.c}"]`); if(el){ el.classList.add('anim-remove'); try{ this._spawnMatchParticlesAtCell(el); }catch(e){} } }
          await new Promise(res=> setTimeout(res,100));
          for(const p of mapped){ const el=this.root.querySelector(`.cell[data-r="${p.r}"][data-c="${p.c}"]`); if(el) el.classList.remove('anim-remove'); }
          if(origin){ const oel=this.root.querySelector(`.cell[data-r="${origin.r}"][data-c="${origin.c}"]`); if(oel) oel.classList.remove('bomb-primed'); }
          if(next.board){ this._applySnapshot(next.board); }
          this._animating=false; continue;
        }
        if(next.power==='mega-wrapped'){
          this.showNotification('🎁 MEGA WRAPPED! 🎁');
          this._animating=true; try{ this._playSFX('power', { volume:1.0, pan: (next.origin? this._mapColToPan(next.origin.c) : 0) }); }catch(e){}
          const origin = next.origin || null;
          const mapped = (next.removals||[]).map(k=>{ if(typeof k==='string'){ const [r,c]=k.split(',').map(Number); return {r,c}; } return k; });
          if(origin){ const oel=this.root.querySelector(`.cell[data-r="${origin.r}"][data-c="${origin.c}"]`); if(oel){ oel.classList.add('power-activated'); try{ this._spawnMatchParticlesAtCell(oel); }catch(e){} } }
          await new Promise(res=> setTimeout(res,60));
          for(const p of mapped){ const el=this.root.querySelector(`.cell[data-r="${p.r}"][data-c="${p.c}"]`); if(el){ el.classList.add('anim-remove'); try{ this._spawnMatchParticlesAtCell(el); }catch(e){} } }
          await new Promise(res=> setTimeout(res,120));
          for(const p of mapped){ const el=this.root.querySelector(`.cell[data-r="${p.r}"][data-c="${p.c}"]`); if(el) el.classList.remove('anim-remove'); }
          if(origin){ const oel=this.root.querySelector(`.cell[data-r="${origin.r}"][data-c="${origin.c}"]`); if(oel) oel.classList.remove('power-activated'); }
          if(next.board){ this._applySnapshot(next.board); }
          this._animating=false; continue;
        }
        if(next.power==='rainbow-bomb'){
          this.showNotification('🌈 RAINBOW BOMB! 🌈');
          this._animating=true; try{ this._playSFX('colorbomb', { volume:1.0, pan: (next.origin? this._mapColToPan(next.origin.c) : 0) }); }catch(e){}
          const origin = next.origin || null;
          const mapped = (next.removals||[]).map(k=>{ if(typeof k==='string'){ const [r,c]=k.split(',').map(Number); return {r,c}; } return k; });
          if(origin){ const oel=this.root.querySelector(`.cell[data-r="${origin.r}"][data-c="${origin.c}"]`); if(oel){ oel.classList.add('colorbomb-activated'); try{ this._spawnMatchParticlesAtCell(oel); }catch(e){} } }
          await new Promise(res=> setTimeout(res,100));
          for(const p of mapped){ const el=this.root.querySelector(`.cell[data-r="${p.r}"][data-c="${p.c}"]`); if(el){ el.classList.add('anim-remove'); try{ this._spawnMatchParticlesAtCell(el); }catch(e){} } }
          await new Promise(res=> setTimeout(res,150));
          for(const p of mapped){ const el=this.root.querySelector(`.cell[data-r="${p.r}"][data-c="${p.c}"]`); if(el) el.classList.remove('anim-remove'); }
          if(origin){ const oel=this.root.querySelector(`.cell[data-r="${origin.r}"][data-c="${origin.c}"]`); if(oel) oel.classList.remove('colorbomb-activated'); }
          if(next.board){ this._applySnapshot(next.board); }
          this._animating=false; continue;
        }
        if(next.power==='hammer'){
          this._animating=true; try{ this._playSFX('power', { volume:0.8, pan: (next.origin? this._mapColToPan(next.origin.c) : 0) }); }catch(e){}
          const origin = next.origin || null;
          const mapped = (next.removals||[]).map(k=>{ if(typeof k==='string'){ const [r,c]=k.split(',').map(Number); return {r,c}; } return k; });
          if(origin){ const oel=this.root.querySelector(`.cell[data-r="${origin.r}"][data-c="${origin.c}"]`); if(oel){ oel.classList.add('hammer-activated'); try{ this._spawnMatchParticlesAtCell(oel); }catch(e){} } }
          await new Promise(res=> setTimeout(res,30));
          for(const p of mapped){ const el=this.root.querySelector(`.cell[data-r="${p.r}"][data-c="${p.c}"]`); if(el){ el.classList.add('anim-remove'); try{ this._spawnMatchParticlesAtCell(el); }catch(e){} } }
          await new Promise(res=> setTimeout(res,60));
          for(const p of mapped){ const el=this.root.querySelector(`.cell[data-r="${p.r}"][data-c="${p.c}"]`); if(el) el.classList.remove('anim-remove'); }
          if(origin){ const oel=this.root.querySelector(`.cell[data-r="${origin.r}"][data-c="${origin.c}"]`); if(oel) oel.classList.remove('hammer-activated'); }
          if(next.board){ this._applySnapshot(next.board); }
          this._animating=false; continue;
        }
        if(next.power==='mega-striped'){
          this.showNotification('⚡ MEGA STRIPED! ⚡');
          this._animating=true; try{ this._playSFX('power', { volume:1.0, pan: (next.origin? this._mapColToPan(next.origin.c) : 0) }); }catch(e){}
          const origin = next.origin || null;
          const mapped = (next.removals||[]).map(k=>{ if(typeof k==='string'){ const [r,c]=k.split(',').map(Number); return {r,c}; } return k; });
          if(origin){ const oel=this.root.querySelector(`.cell[data-r="${origin.r}"][data-c="${origin.c}"]`); if(oel){ oel.classList.add('power-activated'); try{ this._spawnMatchParticlesAtCell(oel); }catch(e){} } }
          await new Promise(res=> setTimeout(res,30));
          for(const p of mapped){ const el=this.root.querySelector(`.cell[data-r="${p.r}"][data-c="${p.c}"]`); if(el){ el.classList.add('anim-remove'); try{ this._spawnMatchParticlesAtCell(el); }catch(e){} } }
          await new Promise(res=> setTimeout(res,60));
          for(const p of mapped){ const el=this.root.querySelector(`.cell[data-r="${p.r}"][data-c="${p.c}"]`); if(el) el.classList.remove('anim-remove'); }
          if(origin){ const oel=this.root.querySelector(`.cell[data-r="${origin.r}"][data-c="${origin.c}"]`); if(oel) oel.classList.remove('power-activated'); }
          if(next.board){ this._applySnapshot(next.board); }
          this._animating=false; continue;
        }
      }

      // Render phases that update board state
      if(next.type==='after-remove' || next.type==='after-gravity'){
        if(next.board){ this._applySnapshot(next.board); }
        continue;
      }

      // Generic snapshot application
      if(next.board){
        let nulls=0; for(const row of next.board) for(const cell of row) if(!cell) nulls++;
        console.debug('Applying phase', next.type, 'nulls in snapshot:', nulls);
        this._applySnapshot(next.board);
      }

      if(next.type && next.type==='after-swap'){ try{ const midC = Math.round((a.c + b.c)/2); this._playSFX('swap', { volume:0.28, pan: this._mapColToPan(midC) }); }catch(e){} }
      await new Promise(res=> setTimeout(res,60));
    }
    this._processingPreview=false;
  }

  _applySnapshot(boardSnapshot){
    this.board = boardSnapshot.map(r=> r.map(c=>{
      if(!c) return null;
      if(typeof c === 'string') return {v: c, p: null};
      if(typeof c.v !== 'undefined') return {v: c.v, p: c.p || null};
      try{ return {v: c, p: null}; }catch(e){ console.warn('unexpected cell shape in snapshot', c); return null; }
    }));
    this.render();
  }

  playPreview(speed=350){ if(this.previewTimer) return; this.previewTimer = setInterval(()=>{ if(this.previewQueue.length===0){ this.stopPreview(); return; } this.stepPreview(); }, speed); }

  stopPreview(){ if(this.previewTimer){ clearInterval(this.previewTimer); this.previewTimer=null; } this.previewQueue=[]; }

  // Hint helpers
  resetHintTimer(){ try{ if(this.hintTimer) clearTimeout(this.hintTimer); }catch(e){} this.hintTimer = setTimeout(()=> this.showHint(), this.hintDelay); this.clearHint(); }
  clearHint(){ this.hint=null; const prev=this.root.querySelectorAll('.cell.hint'); for(const el of prev) el.classList.remove('hint'); }
  showHint(){
    const move = this.findHintMove();
    if(!move){ this.hintTimer = setTimeout(()=> this.showHint(), 6000); return null; }
    this.hint = {a: move.a, b: move.b};
    // Do NOT re-render or modify `this.board` — only add hint classes to existing DOM nodes
    const aEl = this.root.querySelector(`.cell[data-r="${move.a.r}"][data-c="${move.a.c}"]`);
    const bEl = this.root.querySelector(`.cell[data-r="${move.b.r}"][data-c="${move.b.c}"]`);
    if(aEl) aEl.classList.add('hint');
    if(bEl) bEl.classList.add('hint');
    try{ const pan = this.hint && this.hint.a ? this._mapColToPan(this.hint.a.c) : 0; this._playSFX('hint', { volume:0.26, pan }); }catch(e){}
    setTimeout(()=>{ this.clearHint(); this.resetHintTimer(); }, 6000);
    return move;
  }
  findHintMove(){ for(let r=0;r<this.rows;r++){ for(let c=0;c<this.cols;c++){ const a={r,c}; const neighbors=[{r:r,c:c+1},{r:r+1,c:c}]; for(const b of neighbors){ if(b.r<0||b.r>=this.rows||b.c<0||b.c>=this.cols) continue; const copy = cloneBoard(this.board); try{ Engine.swapTiles(copy,a,b); }catch(e){ continue; } const groups = Engine.findMatches(copy); if(groups && groups.length>0){ const best = groups.reduce((acc,g)=> Math.max(acc,g.len||0),0); return {a,b,bestLen:best,groups}; } } } } return null; }

  // --- DEBUG: Forzar power-ups en celda seleccionada ---
  forcePower(type) {
    if (!this.selected) { alert('Selecciona una celda primero'); return; }
    const {r, c} = this.selected;
    if (!this.board[r] || !this.board[r][c]) return;

    // Ensure cell is an object with v and p properties
    if (typeof this.board[r][c] === 'string') {
      this.board[r][c] = {v: this.board[r][c], p: null};
    }
    this.board[r][c].p = type;
    console.log(`[forcePower] Applied ${type} to cell [${r},${c}]`, this.board[r][c]);
    this.render();
  }

  toggleDebugPanel() {
    const panel = document.getElementById('debug-panel');
    if(panel) panel.style.display = (panel.style.display==='none'||!panel.style.display)?'flex':'none';
  }
}

// Exponer helpers debug globalmente
window.CCA_ui = window.CCA_ui || {};
window.CCA_ui.forcePower = (type) => { if(window.ui && typeof window.ui.forcePower==='function') window.ui.forcePower(type); };
window.CCA_ui.toggleDebugPanel = () => { if(window.ui && typeof window.ui.toggleDebugPanel==='function') window.ui.toggleDebugPanel(); };
