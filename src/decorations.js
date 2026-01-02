// Procedural decorations: spawn ships and asteroids for background movement
let _running = false;
let _spawnTimer = null;
let container = null;

function rand(min, max){ return min + Math.random()*(max-min); }

export function startDecorations(rootSelector = '#space-bg', density = 0.7){
  if(_running) return;
  container = document.querySelector(rootSelector);
  if(!container) return;
  _running = true;
  // spawn at intervals depending on density
  const base = 2200; // ms
  _spawnTimer = setInterval(()=>{
    if(!_running) return;
    // decide ship or asteroid
    const r = Math.random();
    if(r < 0.45){ spawnShip(container); }
    else if(r < 0.7) { spawnUFO(container); }
    else if(r < 0.85) { spawnAsteroid(container); }
    else if(r < 0.93) { spawnAlien(container); }
    else { spawnAstronaut(container); }
  }, Math.max(600, base / Math.max(0.2, density)));
}

export function stopDecorations(){
  _running = false;
  if(_spawnTimer) clearInterval(_spawnTimer); _spawnTimer=null;
}

function spawnShip(root){
  const el = document.createElement('div'); el.className = 'ship dynamic';
  // randomize size and direction
  const size = Math.floor(rand(36,92)); el.style.width = size+'px'; el.style.height = Math.floor(size*0.36)+'px';
  const top = Math.floor(rand(6,88)); el.style.top = top+'%';
  const dir = Math.random()>0.5 ? 'ltr' : 'rtl';
  if(dir==='rtl'){ el.classList.add('rev'); el.style.left='110%'; }
  else { el.style.left='-20%'; }
  // slight color tint
  if(Math.random()>0.7) el.style.background = 'linear-gradient(90deg, rgba(255,255,255,0.9) 0%, rgba(200,240,255,0.85) 40%, rgba(160,120,255,0.7) 100%)';
  root.appendChild(el);
  // animate via CSS transform using random duration
  const dur = rand(12, 28);
  el.style.transition = `transform ${dur}s linear, opacity ${dur}s linear`;
  requestAnimationFrame(()=>{
    if(dir==='rtl') el.style.transform = 'translateX(-260vw) rotate(-6deg)';
    else el.style.transform = 'translateX(260vw) rotate(6deg)';
    el.style.opacity = '0.95';
  });
  // cleanup after animation
  setTimeout(()=>{ try{ el.remove(); }catch(e){} }, (dur*1000)+500);
}

function spawnAsteroid(root){
  const el = document.createElement('div'); el.className = 'asteroid';
  const meteorId = Math.random() > 0.5 ? '1' : '2';
  const size = Math.floor(rand(20,60)); el.style.width = size+'px'; el.style.height = size+'px';
  el.style.backgroundImage = `url('assets/images/meteor_${meteorId}.png')`;
  el.style.backgroundSize = 'contain';
  el.style.backgroundRepeat = 'no-repeat';
  const left = Math.floor(rand(2,92)); el.style.left = left+'%'; el.style.top = '-8%';
  root.appendChild(el);
  const dur = rand(6,18);
  el.style.transition = `transform ${dur}s linear, opacity ${dur}s linear`;
  requestAnimationFrame(()=>{
    el.style.transform = `translateY(120vh) rotate(${Math.floor(rand(-360,360))}deg)`;
    el.style.opacity = '0.9';
  });
  setTimeout(()=>{ try{ el.remove(); }catch(e){} }, (dur*1000)+400);
}

function spawnUFO(root){
  const el = document.createElement('div'); el.className = 'ufo dynamic';
  const colors = ['blue', 'green', 'pink', 'yellow'];
  const color = colors[Math.floor(Math.random() * colors.length)];
  const size = Math.floor(rand(48,120)); el.style.width = size+'px'; el.style.height = size+'px';
  el.style.backgroundImage = `url('assets/images/ufo_${color}.png')`;
  el.style.backgroundSize = 'contain';
  el.style.backgroundRepeat = 'no-repeat';
  el.style.top = Math.floor(rand(6,80))+'%'; el.style.left = '-30%';
  root.appendChild(el);
  const dur = rand(10,24);
  el.style.transition = `transform ${dur}s linear, opacity ${dur}s linear`;
  requestAnimationFrame(()=>{ el.style.transform = `translateX(160vw) translateY(${rand(-6,6)}vh) rotate(${rand(-8,8)}deg)`; el.style.opacity='1'; });
  setTimeout(()=>{ try{ el.remove(); }catch(e){} }, (dur*1000)+600);
}

function spawnAlien(root){
  const el = document.createElement('div'); el.className = 'alien dynamic';
  const size = Math.floor(rand(24,56)); el.style.width = size+'px'; el.style.height = size+'px';
  el.style.backgroundImage = `url('assets/images/ufo_pink.png')`; // Fallback to pink ufo for alien
  el.style.backgroundSize = 'contain';
  el.style.backgroundRepeat = 'no-repeat';
  el.style.left = Math.floor(rand(6,90))+'%'; el.style.top = '-10%';
  root.appendChild(el);
  const dur = rand(8,16);
  el.style.transition = `transform ${dur}s linear, opacity ${dur}s linear`;
  requestAnimationFrame(()=>{ el.style.transform = `translateY(120vh) rotate(${rand(-360,360)}deg)`; el.style.opacity='1'; });
  setTimeout(()=>{ try{ el.remove(); }catch(e){} }, (dur*1000)+500);
}

function spawnAstronaut(root){
  const el = document.createElement('div'); el.className = 'astronaut dynamic';
  const size = Math.floor(rand(40,80)); el.style.width = size+'px'; el.style.height = size+'px';
  el.style.backgroundImage = `url('assets/images/astronaut_kenney.png')`;
  el.style.backgroundSize = 'contain';
  el.style.backgroundRepeat = 'no-repeat';
  el.style.left = Math.floor(rand(6,90))+'%'; el.style.top = '-8%';
  root.appendChild(el);
  const dur = rand(10,20);
  el.style.transition = `transform ${dur}s linear, opacity ${dur}s linear`;
  requestAnimationFrame(()=>{ el.style.transform = `translateY(120vh) rotate(${rand(-30,30)}deg)`; el.style.opacity='1'; });
  setTimeout(()=>{ try{ el.remove(); }catch(e){} }, (dur*1000)+500);
}

export function setDensity(d){
  if(_spawnTimer) clearInterval(_spawnTimer);
  _spawnTimer = setInterval(()=>{ if(!_running) return; if(Math.random()<0.6) spawnShip(container); else spawnAsteroid(container); }, Math.max(400, 2200 / Math.max(0.1, d)));
}

// Debug helper: force-show any current decorations (useful to verify visibility)
export function debugShowAll(){
  try{
    if(!container) container = document.querySelector('#space-bg');
    if(!container) return 0;
    const nodes = container.querySelectorAll('.astronaut, .ufo, .ship, .alien, .moving-astronaut, .moving-ship');
    nodes.forEach(n => {
      n.style.opacity = '1';
      n.style.zIndex = '9999';
      n.style.transition = 'none';
      // place them clearly inside the viewport
      if(n.classList.contains('astronaut') || n.classList.contains('moving-astronaut')) {
        n.style.top = (10 + Math.random()*70) + '%';
        n.style.left = (10 + Math.random()*70) + '%';
        n.style.transform = 'translateY(0) scale(1)';
      }
    });

    // If there were no decoration nodes, spawn a guaranteed astronaut for visibility
    if(nodes.length === 0){
      try{ spawnAstronaut(container); console.log('[Decorations] debugShowAll spawned an astronaut'); }catch(e){ console.warn('[Decorations] failed to spawn astronaut', e); }
    }

    const total = container.querySelectorAll('.astronaut, .ufo, .ship, .alien, .moving-astronaut, .moving-ship').length;
    console.log('[Decorations] debugShowAll applied ->', total, 'elements present');
    return total;
  }catch(e){ console.warn('debugShowAll error', e); return 0; }
}

export default { startDecorations, stopDecorations, setDensity, debugShowAll };
