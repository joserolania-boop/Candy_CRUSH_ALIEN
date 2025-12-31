// Lightweight particle burst helper with pooling and adaptive sizing
const POOL_SIZE = 64;
const pool = [];
let poolIndex = 0;
let parentEl = null;

function _createParticle(){
  const el = document.createElement('div');
  el.className = 'particle';
  el.style.transition = '';
  el.style.opacity = '0';
  el.style.display = 'block';
  el._inUse = false;
  return el;
}

function ensurePool(){
  while(pool.length < POOL_SIZE){ pool.push(_createParticle()); }
}

function _deviceFactor(){
  try{
    if(window.matchMedia && window.matchMedia('(pointer:coarse)').matches) return 0.45; // likely mobile/touch
    if(window.innerWidth && window.innerWidth < 700) return 0.55;
    if(navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4) return 0.75;
  }catch(e){}
  return 1;
}

export default {
  init(rootSelector = '#space-bg'){
    parentEl = document.querySelector(rootSelector) || document.body;
    ensurePool();
  },
  // spawnBurst: parentElement OR selector, x,y in px relative to parent bounding rect
  spawnBurst(parent, x, y, opts={}){
    try{
      if(window.CCA_reduced_motion) return; // respect global reduced motion flag
      const pEl = (typeof parent === 'string') ? (document.querySelector(parent) || document.body) : parent || parentEl || document.body;
      ensurePool();
      const base = (opts.count && Number(opts.count)) ? Number(opts.count) : 12;
      const factor = _deviceFactor();
      const count = Math.max(3, Math.min(28, Math.round(base * factor)));
      const colors = opts.colors || ['#ffd166','#ff6bcb','#9ad8ff','#c77dff','#6ee7c5','#fff1d6','#bfe9ff'];
      for(let i=0;i<count;i++){
        const node = pool[poolIndex]; poolIndex = (poolIndex+1) % pool.length;
        if(!node.parentNode) pEl.appendChild(node);
        node._inUse = true;
        // size variance
        const sz = (opts.size === 'tiny') ? (4 + Math.round(Math.random()*2)) : (opts.size === 'small' ? 5 + Math.round(Math.random()*3) : 6 + Math.round(Math.random()*6));
        node.style.width = sz + 'px'; node.style.height = sz + 'px';
        node.className = 'particle ' + (opts.size === 'tiny' ? 'tiny' : (opts.size === 'small' ? 'small' : ''));
        const angle = Math.random()*Math.PI*2;
        const spread = (opts.spread && Number(opts.spread)) ? Number(opts.spread) : 28;
        const speed = (spread * 0.6) + Math.random()*(spread * 1.1);
        const dx = Math.cos(angle)*speed; const dy = Math.sin(angle)*speed;
        node.style.left = (x - (sz/2)) + 'px'; node.style.top = (y - (sz/2)) + 'px';
        node.style.background = colors[Math.floor(Math.random()*colors.length)];
        node.style.boxShadow = '0 2px 8px rgba(0,0,0,0.45), 0 0 8px rgba(255,255,255,0.04) inset';
        node.style.opacity = '1'; node.style.transform = 'translate(0px,0px) scale(1)'; node.style.filter = 'blur(0px)';
        const dur = Math.max(220, Math.round(320 + Math.random()*360));
        // force reflow
        void node.offsetWidth;
        node.style.transition = `transform ${dur}ms cubic-bezier(.2,.8,.2,1), opacity ${dur}ms linear, filter ${dur}ms linear`;
        requestAnimationFrame(()=>{
          node.style.transform = `translate(${dx}px, ${dy}px) scale(${0.35 + Math.random()*0.9}) rotate(${Math.round(Math.random()*360)}deg)`;
          node.style.opacity = '0';
          node.style.filter = 'blur(1px)';
        });
        setTimeout(()=>{ try{ node._inUse=false; /* keep in DOM for reuse but hide */ node.style.transition=''; node.style.opacity='0'; /* leave size for reuse */ }catch(e){} }, dur + 60);
      }
    }catch(e){ console.warn('spawnBurst failed', e); }
  }
};
