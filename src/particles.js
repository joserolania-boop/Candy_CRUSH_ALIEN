// particles.js — spawn subtle shooting stars and small twinkles
export default {
  start(rootSelector = 'body', density = 0.008){
    const root = document.querySelector(rootSelector) || document.body;
    this._running = true;
    this._interval = setInterval(()=>{
      if(!this._running) return;
      // random chance to spawn a shooting star
      if(Math.random() < 0.28){ this._spawnShooting(root); }
      // occasional tiny twinkle
      if(Math.random() < 0.6){ this._spawnTwinkle(root); }
    }, 700 + Math.random()*600);
  },
  stop(){ this._running = false; if(this._interval) clearInterval(this._interval); },
  _spawnShooting(root){
    const el = document.createElement('div'); el.className = 'shooting-star';
    const startY = Math.random()*40 + 6; // percent
    const size = 2 + Math.random()*2;
    el.style.top = startY + 'vh';
    el.style.left = '-6%';
    el.style.width = (size*12) + 'px'; el.style.height = (size*2)+'px';
    el.style.opacity = String(0.8 + Math.random()*0.2);
    document.getElementById('space-bg')?.appendChild(el);
    const dur = 900 + Math.round(Math.random()*900);
    el.style.transition = `transform ${dur}ms cubic-bezier(.2,.9,.1,1), opacity ${dur/2}ms linear`;
    requestAnimationFrame(()=>{ el.style.transform = `translateX(140vw) rotate(18deg)`; el.style.opacity = '0'; });
    setTimeout(()=>{ try{ el.remove(); }catch(e){} }, dur+300);
  },
  _spawnTwinkle(root){
    const el = document.createElement('div'); el.className = 'twinkle';
    const x = Math.random()*92 + 4; const y = Math.random()*82 + 6;
    const sz = 1 + Math.random()*2.6;
    el.style.left = x + '%'; el.style.top = y + '%'; el.style.width = sz + 'px'; el.style.height = sz + 'px';
    document.getElementById('space-bg')?.appendChild(el);
    const life = 400 + Math.random()*900;
    el.style.animation = `twinkle ${life}ms ease-in-out forwards`;
    setTimeout(()=>{ try{ el.remove(); }catch(e){} }, life+200);
  }
}
