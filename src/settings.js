import * as Sound from './sound.js';

const KEYS = {
  sfx: 'cca_sfx',
  music: 'cca_music',
  reduced: 'cca_reduced_motion'
};

function readBool(key, fallback){
  try{ const v = localStorage.getItem(key); if(v===null) return fallback; return v==='1' || v==='true'; }catch(e){ return fallback; }
}

function writeBool(key, val){ try{ localStorage.setItem(key, val? '1':'0'); }catch(e){} }

export default {
  init(){
    // initial values
    const sfxEnabled = readBool(KEYS.sfx, true);
    const musicEnabled = readBool(KEYS.music, true);
    const reduced = readBool(KEYS.reduced, false);

    // apply to Sound module
    try{ Sound.setSFXEnabled(sfxEnabled); }catch(e){}
    try{ Sound.setMusicEnabled(musicEnabled); }catch(e){}

    // reduced motion global hook (also used by particle helper)
    window.CCA_reduced_motion = !!reduced;
    if(window.CCA_reduced_motion) document.body.classList.add('cca-reduced-motion'); else document.body.classList.remove('cca-reduced-motion');

    // wire UI controls if present
    const sfxToggle = document.getElementById('sfx-toggle');
    const musicToggle = document.getElementById('music-toggle');
    const reducedToggle = document.getElementById('reduced-motion-toggle');

    if(sfxToggle){ sfxToggle.checked = !!sfxEnabled; sfxToggle.addEventListener('change', (e)=>{ const v = !!e.target.checked; try{ Sound.setSFXEnabled(v); writeBool(KEYS.sfx, v); }catch(err){} }); }
    if(musicToggle){ musicToggle.checked = !!musicEnabled; musicToggle.addEventListener('change', (e)=>{ const v = !!e.target.checked; try{ Sound.setMusicEnabled(v); writeBool(KEYS.music, v); }catch(err){} }); }
    if(reducedToggle){ reducedToggle.checked = !!reduced; reducedToggle.addEventListener('change', (e)=>{ const v = !!e.target.checked; window.CCA_reduced_motion = v; if(v) document.body.classList.add('cca-reduced-motion'); else document.body.classList.remove('cca-reduced-motion'); writeBool(KEYS.reduced, v); }); }

    // Dispatch events on changes so other modules (UI) can react
    if(sfxToggle){ sfxToggle.addEventListener('change', (e)=>{ try{ document.dispatchEvent(new CustomEvent('cca:setting',{detail:{key:'sfx', value: !!e.target.checked}})); }catch(_){} }); }
    if(musicToggle){ musicToggle.addEventListener('change', (e)=>{ try{ document.dispatchEvent(new CustomEvent('cca:setting',{detail:{key:'music', value: !!e.target.checked}})); }catch(_){} }); }
    if(reducedToggle){ reducedToggle.addEventListener('change', (e)=>{ try{ document.dispatchEvent(new CustomEvent('cca:setting',{detail:{key:'reduced', value: !!e.target.checked}})); }catch(_){} }); }

    // expose a small global API for debugging/testing
    window.__CCA_settings = { isSFX: ()=>Sound.isSFXEnabled && Sound.isSFXEnabled(), isMusic: ()=>Sound.isMusicEnabled && Sound.isMusicEnabled(), reduced: ()=>window.CCA_reduced_motion };
  }
};
