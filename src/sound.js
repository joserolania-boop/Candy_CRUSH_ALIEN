// Lightweight WebAudio-based ambient background + effects
let audioCtx = null;
let masterGain = null;
let ambientAudio = null;
let swapAudio = null;
let matchAudio = null;
let synthRefs = null; // store synth intervals/oscillators for cleanup
let _muted = false;
let _volume = 0.6;  // Increased default volume
let _sfxEnabled = true;
let _musicEnabled = true;
let backgroundPlaying = false;
// SFX buffer registry
const sfxBuffers = new Map();
let sfxManifest = null; // loaded from assets/audio/manifest.json if present
window.CCA_audio_debug = window.CCA_audio_debug || false;

export async function initAudio(){
  if(audioCtx) return Promise.resolve();
  try {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    masterGain = audioCtx.createGain(); 
    masterGain.gain.value = _volume; 
    masterGain.connect(audioCtx.destination);

    // create Audio elements (they may 404 later when played)
    try{ ambientAudio = new Audio('/assets/audio/ambient.wav'); ambientAudio.loop = true; ambientAudio.volume = 0.0; }catch(e){ ambientAudio = null; }
    try{ swapAudio = new Audio('/assets/audio/swap.wav'); }catch(e){ swapAudio = null; }
    try{ matchAudio = new Audio('/assets/audio/match.wav'); }catch(e){ matchAudio = null; }

    // resume on user gesture if needed
    try{ audioCtx.resume(); }catch(e){}
    if(audioCtx.state === 'suspended'){
      const resume = ()=>{ audioCtx.resume().catch(()=>{}); document.removeEventListener('click', resume); document.removeEventListener('touchstart', resume); };
      document.addEventListener('click', resume);
      document.addEventListener('touchstart', resume);
    }

    // load persisted audio + preference settings
    if(typeof loadSettingsEnhanced === 'function') loadSettingsEnhanced(); else loadSettings();
    // attempt to load SFX manifest (non-blocking)
    loadSFXManifest().catch(()=>{});
    if(window.CCA_audio_debug) setupSFXDebugShortcuts();
    
    console.log('[initAudio] Audio context initialized successfully');
    return Promise.resolve();
  } catch(e) {
    console.error('[initAudio] Error initializing audio:', e);
    return Promise.reject(e);
  }
}

// load a small manifest mapping semantic names to file paths
export async function loadSFXManifest(){
  try{
    const resp = await fetch('/assets/audio/manifest.json', {cache: 'no-cache'});
    if(!resp.ok) throw new Error('no manifest');
    sfxManifest = await resp.json();
    if(window.CCA_audio_debug) console.debug('SFX manifest loaded', sfxManifest);
    // optionally preload a small set of core SFX
    const core = ['swap','match','hint','bomb','power','colorbomb'];
    core.forEach(n=> preloadSFX(n).catch(()=>{}));
  }catch(e){ if(window.CCA_audio_debug) console.debug('No SFX manifest found', e); }
}

// preload an SFX into AudioBuffer (returns AudioBuffer or rejects)
export async function preloadSFX(name){
  if(!sfxManifest || !audioCtx) return Promise.reject(new Error('no manifest or audioCtx'));
  if(sfxBuffers.has(name)) return sfxBuffers.get(name);
  const file = sfxManifest[name];
  if(!file) return Promise.reject(new Error('no file for '+name));
  const url = '/assets/audio/' + file;
  const resp = await fetch(url, {cache:'no-cache'});
  if(!resp.ok) throw new Error('failed fetch '+url);
  const ab = await resp.arrayBuffer();
  const buf = await audioCtx.decodeAudioData(ab);
  sfxBuffers.set(name, buf);
  if(window.CCA_audio_debug) console.debug('preloaded sfx', name, url);
  return buf;
}

// play an SFX using AudioBufferSourceNode with simple pan/volume/rate
export function playSFX(name, opts = {}){
  if(_muted) return;
  if(!_sfxEnabled) return;
  if(window.CCA_audio_debug){ console.debug('playSFX', name, opts); if(window.CCA_audio_debug===true && !opts._forcePlay) return; }
  if(!audioCtx) return; // silent if audio not initialized
  const buf = sfxBuffers.get(name);
  const outcome = (buffer)=>{
    try{
      const src = audioCtx.createBufferSource(); src.buffer = buffer; src.playbackRate.value = opts.playbackRate || 1.0;
      const g = audioCtx.createGain(); g.gain.value = (typeof opts.volume === 'number' ? opts.volume : 0.36) * (_volume || 1);
      const p = audioCtx.createStereoPanner ? audioCtx.createStereoPanner() : null;
      if(p && typeof opts.pan === 'number') p.pan.value = opts.pan;
      // connect chain
      if(p){ src.connect(p); p.connect(g); } else { src.connect(g); }
      g.connect(masterGain);
      const when = audioCtx.currentTime + (opts.delay || 0);
      src.start(when);
      // clean up when done
      src.onended = ()=>{ try{ src.disconnect(); g.disconnect(); if(p) p.disconnect(); }catch(e){} };
    }catch(e){ if(window.CCA_audio_debug) console.warn('playSFX failed', e); }
  };
  if(buf) return outcome(buf);
  // try to preload then play
  preloadSFX(name).then(outcome).catch((e)=>{ if(window.CCA_audio_debug) console.warn('playSFX preload failed', e); });
}

function startSynth(){
  if(!audioCtx || synthRefs) return;
  if(_muted || !_musicEnabled) return;
  const bgGain = audioCtx.createGain(); bgGain.gain.value = 0.7; bgGain.connect(masterGain);
  backgroundPlaying = true;

  // pad
  const pad1 = audioCtx.createOscillator(); const pad2 = audioCtx.createOscillator();
  const padGain = audioCtx.createGain(); padGain.gain.value = 0.0; padGain.connect(bgGain);
  const padFilter = audioCtx.createBiquadFilter(); padFilter.type = 'lowpass'; padFilter.frequency.value = 1200;
  pad1.type = 'sine'; pad2.type = 'sine'; pad1.frequency.value = 55; pad2.frequency.value = 61.74;
  pad1.connect(padFilter); pad2.connect(padFilter); padFilter.connect(padGain);
  pad1.start(); pad2.start();
  padGain.gain.linearRampToValueAtTime(0.06, audioCtx.currentTime + 0.9);

  // simple arp interval
  const patterns = [[220,277.18,329.63,369.99],[196,246.94,293.66,329.63]];
  const arp = patterns[Math.floor(Math.random()*patterns.length)];
  let idx = 0;
  const arpInterval = setInterval(()=>{
    const o = audioCtx.createOscillator(); const g = audioCtx.createGain();
    o.type = 'triangle'; o.frequency.value = arp[idx % arp.length] * (Math.random()>0.8?2:1);
    g.gain.value = 0.01 + Math.random()*0.01; o.connect(g); g.connect(bgGain);
    o.start(); o.stop(audioCtx.currentTime + 0.22 + Math.random()*0.28);
    idx++;
  }, 420 + Math.random()*200);

  synthRefs = { pad1, pad2, padGain, padFilter, arpInterval, bgGain };
}

function stopSynth(){
  backgroundPlaying = false;
  if(!synthRefs) return;
  try{ if(synthRefs.pad1) synthRefs.pad1.stop(); }catch(e){}
  try{ if(synthRefs.pad2) synthRefs.pad2.stop(); }catch(e){}
  try{ if(synthRefs.arpInterval) clearInterval(synthRefs.arpInterval); }catch(e){}
  synthRefs = null;
}

export function playBackground(){
  if(_muted || !_musicEnabled){
    stopBackground();
    return;
  }
  initAudio().catch(()=>{});
  stopBackground();
  // try to play ambient file if it exists (HEAD check)
  try{
    // Ensure audio context is running before attempting to play
    if(audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume().catch(e => console.warn('AudioContext resume failed:', e));
    }
    
    fetch('/assets/audio/ambient.wav', { method: 'HEAD' })
      .then(resp => {
        if(resp.ok && ambientAudio){
          ambientAudio.volume = 0.0; 
          ambientAudio.currentTime = 0;
          ambientAudio.play().then(() => {
            backgroundPlaying = true;
            // fade in
            const fadeTo = _volume; 
            let v = 0; 
            const step = 0.06; 
            const iv = setInterval(()=>{ 
              v += step; 
              ambientAudio.volume = Math.min(fadeTo, v); 
              if(ambientAudio.volume>=fadeTo) clearInterval(iv); 
            }, 60);
            console.log('[playBackground] ✓ Ambient audio playing with fade-in');
          }).catch(e => {
            console.warn('[playBackground] ambient.play() failed:', e);
            startSynth();
          });
        } else {
          startSynth();
        }
      })
      .catch(e => { 
        console.warn('[playBackground] fetch failed:', e); 
        startSynth();
      });
  } catch(e){ 
    console.warn('[playBackground] error:', e); 
    startSynth();
  }
}

export function stopBackground(){
  backgroundPlaying = false;
  try{ if(ambientAudio && !ambientAudio.paused){ ambientAudio.pause(); ambientAudio.currentTime = 0; } }catch(e){}
  stopSynth();
}

function playTone(freq, time=0.08, type='sine', vol=0.12){
  if(!audioCtx) return;
  const o = audioCtx.createOscillator(); const g = audioCtx.createGain();
  o.type = type; o.frequency.value = freq; g.gain.value = vol * (_volume || 1);
  o.connect(g); g.connect(masterGain);
  o.start(); o.stop(audioCtx.currentTime + time);
}

// Helper to play a note given frequency and duration
function playNote(freq, duration = 0.1, gain = 0.3, waveform = 'sine'){
  if(_muted) return;
  try {
    // Ensure audioCtx exists and is running
    if(!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      masterGain = audioCtx.createGain();
      masterGain.gain.value = _volume;
      masterGain.connect(audioCtx.destination);
    }
    
    // CRITICAL: Resume audioCtx if suspended (required by browser policy)
    if(audioCtx.state === 'suspended') {
      audioCtx.resume().catch(e => console.warn('Could not resume audioCtx:', e));
    }
    
    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const amp = audioCtx.createGain();
    
    osc.type = waveform;
    osc.frequency.value = freq;
    
    // Apply gain with volume multiplier
    const finalGain = gain * _volume;
    amp.gain.setValueAtTime(finalGain, now);
    amp.gain.exponentialRampToValueAtTime(0.001, now + duration);
    
    osc.connect(amp);
    amp.connect(masterGain);
    
    osc.start(now);
    osc.stop(now + duration);
    
    console.log('[playNote]', freq, 'Hz x', duration.toFixed(3), 's');
  } catch(e) { console.error('playNote error:', e); }
}

// Swap sound: single beep - higher volume
export function playSwap(){ 
  if(_muted) return; 
  playNote(880, 0.08, 0.35, 'sine');
}

// Match sound: rising arpeggio (3 notes) - celebratory
export function playMatch(){ 
  if(_muted) return; 
  if(!audioCtx) { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); masterGain = audioCtx.createGain(); masterGain.gain.value = _volume; masterGain.connect(audioCtx.destination); }
  playNote(523, 0.12, 0.3, 'triangle');  // C5
  setTimeout(() => playNote(659, 0.12, 0.3, 'triangle'), 80);   // E5
  setTimeout(() => playNote(784, 0.18, 0.35, 'triangle'), 160); // G5
}

// Hint sound: higher pitch chirp - more audible
export function playHint(){ 
  if(_muted) return;
  if(!audioCtx) { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); masterGain = audioCtx.createGain(); masterGain.gain.value = _volume; masterGain.connect(audioCtx.destination); }
  playNote(1047, 0.1, 0.25, 'sine');  // C6
  setTimeout(() => playNote(1319, 0.1, 0.2, 'sine'), 110); // E6
}

// debug: keyboard shortcuts to audition SFX when window.CCA_audio_debug === true
function setupSFXDebugShortcuts(){
  if(window.__cca_sfx_debug_setup) return; window.__cca_sfx_debug_setup = true;
  window.addEventListener('keydown', (ev)=>{
    if(!window.CCA_audio_debug) return;
    // require Ctrl+Alt pressed to avoid accidental triggers
    if(!(ev.ctrlKey && ev.altKey)) return;
    const map = { 'Digit1':'swap', 'Digit2':'match', 'Digit3':'power', 'Digit4':'bomb', 'Digit5':'hint' };
    const name = map[ev.code];
    if(name){ ev.preventDefault(); try{ initAudio().then(()=>playSFX(name, {_forcePlay:true, volume:0.4})).catch(()=>{}); }catch(e){} }
  });
}

export async function testTone(){
  try{
    await initAudio();
    if(audioCtx && audioCtx.state === 'suspended') {
      await audioCtx.resume().catch(e => console.warn('[testTone] resume failed', e));
    }
    if(_muted) { console.debug('[testTone] muted, skipping tone'); return; }
    playTone(660,0.18,'sine',0.08);
    console.debug('[testTone] played');
  }catch(e){ console.warn('testTone failed', e); }
}

export function setVolume(v){ _volume = Math.max(0,Math.min(1,v)); if(masterGain) masterGain.gain.value = _volume; try{ if(ambientAudio) ambientAudio.volume = _volume; }catch(e){} try{ localStorage.setItem('cca_volume', String(_volume)); }catch(e){} }
export function getVolume(){ return _volume; }
export function toggleMute(){ _muted = !_muted; if(_muted){ try{ if(ambientAudio) ambientAudio.pause(); }catch(e){} if(masterGain) masterGain.gain.value = 0; } else { if(masterGain) masterGain.gain.value = _volume; try{ if(ambientAudio) ambientAudio.play().catch(()=>{}); }catch(e){} } try{ localStorage.setItem('cca_muted', _muted? '1':'0'); }catch(e){} return _muted; }
export function isMuted(){ return _muted; }

export function setSFXEnabled(flag){ _sfxEnabled = !!flag; try{ localStorage.setItem('cca_sfx', _sfxEnabled ? '1' : '0'); }catch(e){} }
export function isSFXEnabled(){ return _sfxEnabled; }

export function setMusicEnabled(flag){ _musicEnabled = !!flag; try{ localStorage.setItem('cca_music', _musicEnabled ? '1' : '0'); }catch(e){} if(!_musicEnabled){ try{ stopBackground(); }catch(e){} } else { try{ playBackground(); }catch(e){} } }
export function isMusicEnabled(){ return _musicEnabled; }

export function loadSettings(){ try{ const v = localStorage.getItem('cca_volume'); if(v!==null){ _volume = Number(v); if(masterGain) masterGain.gain.value = _volume; } const m = localStorage.getItem('cca_muted'); if(m!==null){ _muted = m==='1' || m==='true'; if(_muted && masterGain) masterGain.gain.value = 0; } }catch(e){} }

// Enhanced load: also load SFX/music/reduced-motion flags
export function loadSettingsEnhanced(){
  try{
    loadSettings();
    const s = localStorage.getItem('cca_sfx'); if(s!==null) _sfxEnabled = s==='1' || s==='true';
    const mu = localStorage.getItem('cca_music'); if(mu!==null) _musicEnabled = mu==='1' || mu==='true';
    const red = localStorage.getItem('cca_reduced_motion'); if(red!==null){ window.CCA_reduced_motion = (red==='1' || red==='true'); if(window.CCA_reduced_motion) document.body.classList.add('cca-reduced-motion'); else document.body.classList.remove('cca-reduced-motion'); }
  }catch(e){}
}

export function setMuted(val){ _muted = !!val; try{ localStorage.setItem('cca_muted', _muted? '1':'0'); }catch(e){} if(_muted){ if(masterGain) masterGain.gain.value = 0; try{ if(ambientAudio) ambientAudio.pause(); }catch(e){} } else { if(masterGain) masterGain.gain.value = _volume; try{ if(ambientAudio) ambientAudio.play().catch(()=>{}); }catch(e){} } }

export function playLevelUp(){ try{ if(!audioCtx) initAudio(); const now = audioCtx.currentTime; const g = audioCtx.createGain(); g.gain.value = 0.001; g.connect(masterGain); const o = audioCtx.createOscillator(); o.type = 'sawtooth'; o.connect(g); const freqs = [523.25,659.25,783.99,1046.5]; let t = now + 0.02; for(let i=0;i<freqs.length;i++){ o.frequency.setValueAtTime(freqs[i], t); g.gain.setValueAtTime(0.001 + 0.5*(1 - i/freqs.length), t); t += 0.12; } g.gain.setValueAtTime(0.0001, t+0.18); o.start(now+0.01); o.stop(t+0.2); }catch(e){ console.warn('playLevelUp failed', e); } }
