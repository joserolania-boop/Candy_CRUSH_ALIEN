import { createBoardState, DEFAULT_COLS, DEFAULT_ROWS } from './board.js';
import { UIManager } from './ui.js';
import * as Sound from './sound.js';
import Decorations from './decorations.js';
import Particles from './particles.js';
import Settings from './settings.js';
import * as Backgrounds from './backgrounds.js';
import Story from './story.js';

const THEME_KEY = 'candy_bg_theme';
const DEFAULT_THEME = 'deep_nebula';
const BOARD_HIDE_CLASS = 'story-cutscene-hidden';

const createLevel = (name, theme, moves, objective, storyCheckpoint) => ({
  name,
  theme,
  moves,
  cols: DEFAULT_COLS,
  rows: DEFAULT_ROWS,
  objective,
  story_checkpoint: storyCheckpoint
});

const LEVELS = [
  createLevel('First Contact', 'deep_nebula', 30, { type: 'score', target: 300 }, 'intro'),
  createLevel('City Defense', 'alien_green', 30, { type: 'pieces', target: 15 }),
  createLevel('Building Power', 'cosmic_blue', 30, { type: 'score', target: 500 }),
  createLevel('Combo Training', 'void_dark', 32, { type: 'power_ups', target: 3 }),
  createLevel('Final Prep', 'inferno', 32, { type: 'score', target: 800 }),
  createLevel('Wave One', 'station_orbit', 32, { type: 'score', target: 1000 }, 'act1'),
  createLevel('Coastal Raid', 'aurora', 34, { type: 'pieces', target: 20 }),
  createLevel('Arsenal Build', 'galaxy_core', 34, { type: 'power_ups', target: 5 }),
  createLevel('Mid-Battle', 'binary_sunset', 34, { type: 'score', target: 1200 }),
  createLevel('Sector Clear', 'quantum_realm', 34, { type: 'pieces', target: 25 }),
  createLevel('Base Assault', 'deep_nebula', 36, { type: 'score', target: 1500 }, 'act2'),
  createLevel('Fortified Base', 'alien_green', 36, { type: 'pieces', target: 25 }),
  createLevel('Maximum Firepower', 'cosmic_blue', 36, { type: 'power_ups', target: 7 }),
  createLevel('Strategic Victory', 'void_dark', 36, { type: 'score', target: 1800 }),
  createLevel('Precision Bombing', 'inferno', 36, { type: 'combo', target: 3 }),
  createLevel('Archaeological Dig', 'station_orbit', 38, { type: 'score', target: 2000 }, 'act3'),
  createLevel('Deep Excavation', 'aurora', 38, { type: 'pieces', target: 30 }),
  createLevel('Full Potential', 'galaxy_core', 38, { type: 'power_ups', target: 10 }),
  createLevel('Ancient Knowledge', 'binary_sunset', 38, { type: 'score', target: 2200 }),
  createLevel('Master the Ruins', 'quantum_realm', 38, { type: 'power_ups', target: 12 }),
  createLevel('Peace Offering', 'deep_nebula', 40, { type: 'score', target: 2500 }, 'act4'),
  createLevel('Shared Sacrifice', 'alien_green', 40, { type: 'pieces', target: 40 }),
  createLevel('Combined Might', 'cosmic_blue', 40, { type: 'power_ups', target: 15 }),
  createLevel('United Strength', 'void_dark', 40, { type: 'score', target: 3000 }),
  createLevel('Final Battle', 'inferno', 42, { type: 'score', target: 3500 })
];

function resolveSavedLevel() {
  try {
    const saved = parseInt(localStorage.getItem('candy_current_level'), 10);
    if (Number.isFinite(saved) && saved >= 1) {
      return Math.min(saved, LEVELS.length);
    }
  } catch (e) {}
  return 1;
}

let level = resolveSavedLevel();
let boardState = null;
let ui = null;
let score = 0;
let movesLeft = 0;
let boardRoot = null;
let volumeEl = null;
let currentObjective = null;
let objectiveProgress = 0;
let levelInProgress = false;
let cutsceneActive = false;

function applyTheme(themeKey = DEFAULT_THEME) {
  const theme = Backgrounds.applyTheme(themeKey, { crossfade: true }) || Backgrounds.getTheme(DEFAULT_THEME);
  const root = document.documentElement;
  root.dataset.theme = theme.key;
  if (theme.accentColor) {
    root.style.setProperty('--accent', theme.accentColor);
  }
  if (theme.panelColor) {
    root.style.setProperty('--panel', theme.panelColor);
  }
  try {
    localStorage.setItem(THEME_KEY, theme.key);
  } catch (e) {
    console.warn('[applyTheme] Unable to persist theme', e);
  }
  return theme;
}

function showStoryScene(checkpointId) {
  if (!checkpointId || cutsceneActive) return Promise.resolve();
  cutsceneActive = true;
  return Story.showScene(checkpointId)
    .catch((err) => {
      console.error('[showStoryScene] error', err);
    })
    .finally(() => {
      cutsceneActive = false;
    });
}

function startGame(resetScore = true){
  console.log('[startGame] Iniciando... resetScore=', resetScore);
  levelInProgress = false;
  if(resetScore) score = 0;

  let currentTheme = localStorage.getItem(THEME_KEY) || LEVELS[0].theme;
  applyTheme(currentTheme);

  const levelDef = LEVELS[level - 1] || LEVELS[0];
  currentObjective = levelDef.objective || {type: 'score', target: 500};
  objectiveProgress = 0;
  movesLeft = levelDef.moves;
  updateUI();

  const launchBoard = () => {
    boardState = createBoardState();
    console.log('[startGame] boardState creado:', !!boardState);
    if(boardRoot) {
      boardRoot.innerHTML = '';
      console.log('[startGame] board-root limpiado');
    }

    try {
      ui = new UIManager({
        root: boardRoot,
        board: boardState,
        cols: DEFAULT_COLS,
        rows: DEFAULT_ROWS,
        onChange: (ev) => {
          console.log('[UIManager.onChange]', ev.type, 'removed:', ev.removed);
          if(ev.type === 'swap') {
            if(ev.removed > 0) {
              try { Sound.playMatch(); } catch(e) { console.warn('Sound error:', e); }
              score += ev.score || 0;
              
              if(currentObjective) {
                if(currentObjective.type === 'score') {
                  objectiveProgress = score;
                } else if(currentObjective.type === 'pieces') {
                  objectiveProgress += ev.removed || 0;
                } else if(currentObjective.type === 'power_ups') {
                  objectiveProgress += (ev.powerUps || 0);
                }
              }
              
              updateUI();
              
              if(currentObjective && objectiveProgress >= currentObjective.target) {
                console.log('[UIManager.onChange] ✅ OBJETIVO COMPLETADO!', objectiveProgress, 'vs', currentObjective.target);
                levelWon();
                return;
              }
              
              movesLeft--;
              if(movesLeft <= 0) {
                console.log('[UIManager.onChange] ❌ SIN MOVIMIENTOS!');
                checkLevelComplete();
              }
            } else {
              try { Sound.playSwap(); } catch(e) { console.warn('Sound error:', e); }
            }
          }
        }
      });
      console.log('[startGame] UIManager creado');
      ui.render();
      console.log('[startGame] Tablero renderizado');
    } catch(e) {
      console.error('[startGame] Error creando UIManager:', e);
      return;
    }

    updateUI();
    try { Sound.playBackground().catch(() => {}); } catch(e) { console.warn('Background music error:', e); }
    try{ ui.playPreview(); }catch(e){ console.warn('Preview failed:', e); }
    console.log('[startGame] ✓ Completado');
  };

  const startScene = () => {
    if(!levelDef.story_checkpoint) {
      if(boardRoot) boardRoot.classList.remove(BOARD_HIDE_CLASS);
      launchBoard();
      return;
    }
    if(boardRoot) boardRoot.classList.add(BOARD_HIDE_CLASS);
    showStoryScene(levelDef.story_checkpoint)
      .then(() => {
        if(boardRoot) boardRoot.classList.remove(BOARD_HIDE_CLASS);
        launchBoard();
      })
      .catch((err) => {
        console.warn('[startGame] Story scene rejected', err);
        if(boardRoot) boardRoot.classList.remove(BOARD_HIDE_CLASS);
        launchBoard();
      });
  };

  startScene();
}

function resetGame(){
  level = 1;
  score = 0;
  objectiveProgress = 0;
  currentObjective = null;
  startGame();
}

function checkLevelComplete(){
  if(!currentObjective) return;
  
  const isObjectiveMet = objectiveProgress >= currentObjective.target;
  
  if(isObjectiveMet) {
    levelWon();
  } else {
    levelFailed();
  }
}

function levelWon(){
  // Prevent multiple level win triggers
  if(levelInProgress) return;
  levelInProgress = true;
  
  console.log('[levelWon] Level', level, 'completed! Objective:', currentObjective);
  showMessage(`✅ LEVEL ${level} COMPLETE!`, 2000);
  setTimeout(() => {
    if(level < LEVELS.length) {
      levelUp();
    } else {
      gameEnded('victory');
    }
  }, 2000);
}

function levelFailed(){
  console.log('[levelFailed] Level', level, 'failed. Out of moves.');
  showMessage(`❌ Out of Moves! Needed ${currentObjective.target}, got ${objectiveProgress}`, 2000);
  setTimeout(() => {
    startGame(false); // Restart same level, keep score
  }, 2000);
}

function shuffleGame(){
  if(boardState && ui) {
    boardState = createBoardState();
    ui.render();
    onGameChange();
  }
}

function onGameChange(){
  const { engine } = window.CCA || {};
  if(!engine) return;
  
  movesLeft--;
  updateUI();
  
  if(movesLeft <= 0) {
    setTimeout(() => { alert('Game Over! Score: ' + score); resetGame(); }, 500);
  }
}

async function levelUp(){
  levelInProgress = false; // Reset flag for next level
  level++;
  
  // Check if we've reached the end
  if(level > LEVELS.length) {
    gameEnded('victory');
    return;
  }
  
  showLevelOverlay();
  
  // Apply new level settings
  const levelDef = LEVELS[level - 1];
  currentObjective = levelDef.objective || {type: 'score', target: 500};
  objectiveProgress = 0;
  movesLeft = levelDef.moves;
  
  let newTheme = levelDef.theme || LEVELS[0].theme;
  applyTheme(newTheme);
  localStorage.setItem(THEME_KEY, newTheme);
  
  // Save progress
  localStorage.setItem('candy_current_level', level);
  
  // Reset board
  boardState = createBoardState();
  ui?.refresh(boardState);
  updateUI();
  
  // Show story checkpoint if applicable - wait for overlay to finish
  if(levelDef.story_checkpoint) {
    setTimeout(() => {
      console.log('[levelUp] Triggering story checkpoint:', levelDef.story_checkpoint);
      if(boardRoot) {
        boardRoot.classList.add(BOARD_HIDE_CLASS);
      }
      showStoryScene(levelDef.story_checkpoint)
        .finally(() => {
          if(boardRoot) {
            boardRoot.classList.remove(BOARD_HIDE_CLASS);
          }
        });
    }, 3000);
  }
}

function showLevelOverlay(){
  const levelDef = LEVELS[level - 1];
  const actNumber = Math.floor((level - 1) / 5) + 1;
  const levelInAct = ((level - 1) % 5) + 1;
  
  const overlay = document.createElement('div');
  overlay.style.cssText = 'position:fixed; inset:0; background:linear-gradient(135deg, rgba(20,10,40,0.95), rgba(60,20,80,0.95)); display:flex; flex-direction:column; align-items:center; justify-content:center; z-index:999; gap:20px; backdrop-filter: blur(4px);';
  
  // Level title
  const title = document.createElement('div');
  title.textContent = `🎉 LEVEL ${level}`;
  title.style.cssText = 'font-size:3.5em; color:#fff; text-shadow:0 0 20px rgba(100,200,255,0.6); font-weight:bold; animation: pop-in 0.5s ease-out;';
  
  // Level name
  const name = document.createElement('div');
  name.textContent = `"${levelDef.name}"`;
  name.style.cssText = 'font-size:1.5em; color:#dfe9ff; text-shadow:0 0 10px rgba(50,100,200,0.4);';
  
  // Act info
  const actInfo = document.createElement('div');
  actInfo.textContent = `Act ${actNumber} - Mission ${levelInAct}/5`;
  actInfo.style.cssText = 'font-size:1.2em; color:#aabbdd; opacity:0.8;';
  
  // Objective
  const objective = document.createElement('div');
  const objType = levelDef.objective.type.toUpperCase();
  const objTarget = levelDef.objective.target;
  objective.textContent = `Objective: ${objType} ${objTarget}`;
  objective.style.cssText = 'font-size:1.1em; color:#ffdd88; margin-top:10px; background:rgba(255,200,50,0.1); padding:10px 20px; border-radius:8px; border-left: 4px solid #ffdd88;';
  
  overlay.appendChild(title);
  overlay.appendChild(name);
  overlay.appendChild(actInfo);
  overlay.appendChild(objective);
  document.body.appendChild(overlay);
  
  // Add CSS animation
  if(!document.querySelector('style[data-animations]')) {
    const style = document.createElement('style');
    style.setAttribute('data-animations', '1');
    style.textContent = `
      @keyframes pop-in {
        0% { transform: scale(0.5); opacity: 0; }
        50% { transform: scale(1.1); }
        100% { transform: scale(1); opacity: 1; }
      }
    `;
    document.head.appendChild(style);
  }
  
  setTimeout(() => {
    overlay.style.transition = 'opacity 0.5s ease-out';
    overlay.style.opacity = '0';
    setTimeout(() => overlay.remove(), 500);
  }, 2500);
}

function gameEnded(result){
  console.log('[gameEnded]', result);
  if(result === 'victory') {
    if(boardRoot) {
      boardRoot.classList.add(BOARD_HIDE_CLASS);
    }
    showStoryScene('victory')
      .finally(() => {
        if(boardRoot) {
          boardRoot.classList.remove(BOARD_HIDE_CLASS);
        }
      });
    showMessage(`🏆 CAMPAIGN COMPLETE! Final Score: ${score}`, 4000);
    setTimeout(() => resetGame(), 4000);
  }
}

// Generic transient message overlay (small toast)
function showMessage(msgText, duration = 1400){
  try{
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed; left:50%; transform:translateX(-50%); bottom:18px; background:rgba(20,24,40,0.92); color:#dfe9ff; padding:12px 18px; border-radius:8px; box-shadow: 0 8px 24px rgba(0,0,0,0.5); z-index:1100; font-weight:600;';
    overlay.textContent = msgText;
    document.body.appendChild(overlay);
    setTimeout(()=>overlay.remove(), duration);
  }catch(e){ console.warn('showMessage failed', e); }
}

function updateUI(){
  const scoreEl = document.getElementById('score');
  const movesEl = document.getElementById('moves');
  const levelEl = document.getElementById('level');
  if(scoreEl) scoreEl.textContent = score;
  if(movesEl) movesEl.textContent = movesLeft;
  if(levelEl) levelEl.textContent = level;
  
  // Update objective progress display
  if(currentObjective) {
    let objDisplay = `${currentObjective.target}`;
    switch(currentObjective.type) {
      case 'score': objDisplay = `Score: ${objectiveProgress}/${currentObjective.target}`; break;
      case 'pieces': objDisplay = `Pieces: ${objectiveProgress}/${currentObjective.target}`; break;
      case 'power_ups': objDisplay = `Power-ups: ${objectiveProgress}/${currentObjective.target}`; break;
      case 'combo': objDisplay = `Combos: ${objectiveProgress}/${currentObjective.target}`; break;
    }
    
    const objEl = document.getElementById('objective-display');
    if(objEl) {
      objEl.textContent = objDisplay;
      objEl.style.display = 'block'; // Show when updating
      // Color progress bar based on progress percentage
      const progress = Math.min(100, (objectiveProgress / currentObjective.target) * 100);
      objEl.style.background = `linear-gradient(90deg, rgba(100,200,255,0.4) ${progress}%, transparent ${progress}%)`;
    }
  }
}

function gameCanPlay(){
  return movesLeft > 0;
}

function setupGameUI(){
  console.log('[setupGameUI] Inicializando audio...');
  // Initialize audio FIRST - critical for sound playback
  Sound.initAudio().then(() => { 
    console.log('[setupGameUI] ✓ Audio context ready'); 
  }).catch(e => { 
    console.warn('[setupGameUI] Audio warning:', e); 
  });
  
  volumeEl = document.getElementById('volume');
  if(volumeEl) {
    volumeEl.addEventListener('change', (e) => {
      const v = parseFloat(e.target.value);
      try{ Sound.setVolume(v); localStorage.setItem('candy_volume', v); }catch(e){}
    });
    try{ volumeEl.value = localStorage.getItem('candy_volume') || 1; }catch(e){}
  }
  
  const themeSelector = document.getElementById('bg-theme-select');
  if(themeSelector) {
    console.log('[setupGameUI] Theme selector encontrado');
    themeSelector.addEventListener('change', (e) => {
      const t = e.target.value;
      console.log('[setupGameUI] Cambiando tema a:', t);
      applyTheme(t);
      localStorage.setItem(THEME_KEY, t);
    });
    const saved = localStorage.getItem(THEME_KEY);
    if(saved) themeSelector.value = saved;
  }
  
  const btnReset = document.getElementById('btn-reset');
  if(btnReset) btnReset.addEventListener('click', () => resetGame());
  
  const btnShuffle = document.getElementById('btn-shuffle');
  if(btnShuffle) btnShuffle.addEventListener('click', () => shuffleGame());
  
  const btnDecorations = document.getElementById('btn-decorations');
  if(btnDecorations) {
    btnDecorations.addEventListener('click', () => {
      try{ Decorations.cycleDecoration(); }catch(e){ console.warn('Decorations error:', e); }
    });
  }
  
  const btnParticles = document.getElementById('btn-particles');
  if(btnParticles) {
    btnParticles.addEventListener('click', () => {
      try{ Particles.playExplosion(Math.random() * window.innerWidth, Math.random() * window.innerHeight); }catch(e){}
    });
  }
  
  // Conectar botones de audio
  const btnPlayMusic = document.getElementById('btn-play-music');
  if(btnPlayMusic) {
    btnPlayMusic.addEventListener('click', async () => {
      try {
        await Sound.initAudio();
        Sound.playBackground();
        showMessage('🎵 Música en marcha...', 1200);
      } catch(e) {
        console.warn('Play music failed:', e);
        showMessage('Error al reproducir música', 1400);
      }
    });
  }
  
  const btnTestTone = document.getElementById('btn-test-tone');
  if(btnTestTone) {
    btnTestTone.addEventListener('click', async () => {
      try {
        await Sound.initAudio();
        Sound.testTone();
        showMessage('🔊 Tono de prueba', 1000);
      } catch(e) {
        console.warn('Test tone failed:', e);
        showMessage('Error al reproducir tono', 1400);
      }
    });
  }
  
  const btnMute = document.getElementById('btn-mute');
  if(btnMute) {
    btnMute.addEventListener('click', async () => {
      try {
        await Sound.initAudio();
        const isMuted = Sound.toggleMute();
        showMessage(isMuted ? '🔇 Silenciado' : '🔊 Sonido activado', 1000);
        btnMute.textContent = isMuted ? 'Unmute' : 'Mute';
      } catch(e) {
        console.warn('Mute toggle failed:', e);
      }
    });
  }
  
  // Conectar checkboxes de SFX y Music
  const sfxToggle = document.getElementById('sfx-toggle');
  if(sfxToggle) {
    sfxToggle.addEventListener('change', async (e) => {
      try {
        await Sound.initAudio();
        Sound.setSFXEnabled(e.target.checked);
        showMessage(e.target.checked ? '✓ SFX activado' : '✗ SFX desactivado', 1000);
      } catch(er) {
        console.warn('SFX toggle failed:', er);
      }
    });
    try {
      sfxToggle.checked = Sound.isSFXEnabled();
    } catch(e) {}
  }
  
  const musicToggle = document.getElementById('music-toggle');
  if(musicToggle) {
    musicToggle.addEventListener('change', async (e) => {
      try {
        await Sound.initAudio();
        Sound.setMusicEnabled(e.target.checked);
        showMessage(e.target.checked ? '✓ Música activada' : '✗ Música desactivada', 1000);
      } catch(er) {
        console.warn('Music toggle failed:', er);
      }
    });
    try {
      musicToggle.checked = Sound.isMusicEnabled();
    } catch(e) {}
  }
  
  const reducedMotionToggle = document.getElementById('reduced-motion-toggle');
  if(reducedMotionToggle) {
    reducedMotionToggle.addEventListener('change', (e) => {
      window.CCA_reduced_motion = e.target.checked;
      if(e.target.checked) {
        document.body.classList.add('cca-reduced-motion');
      } else {
        document.body.classList.remove('cca-reduced-motion');
      }
      try { localStorage.setItem('cca_reduced_motion', e.target.checked ? '1' : '0'); } catch(er) {}
      showMessage(e.target.checked ? 'Movimiento reducido' : 'Movimiento normal', 1000);
    });
    try {
      const saved = localStorage.getItem('cca_reduced_motion') === '1';
      reducedMotionToggle.checked = saved;
      if(saved) {
        window.CCA_reduced_motion = true;
        document.body.classList.add('cca-reduced-motion');
      }
    } catch(e) {}
  }
  
  try{ Settings.init(); }catch(e){ /* non-fatal */ }
}

function initializeGame(){
  boardRoot = document.getElementById('board-root');
  if(!boardRoot) {
    console.error('No board-root found!');
    return;
  }
  
  console.log('[initializeGame] board-root encontrado, inicializando...');
  setupGameUI();
  
  // ESPERAR a que audio esté listo ANTES de jugar
  Sound.initAudio().then(() => {
    console.log('[initializeGame] ✓ Audio context está listo');
    startGame(true);
  }).catch(e => {
    console.warn('[initializeGame] Audio warning (no crítico), iniciando juego igual:', e);
    startGame(true);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  console.log('[DOMContentLoaded] Iniciando...');
  
  const mainMenu = document.getElementById('main-menu');
  const instructionsModal = document.getElementById('instructions-modal');
  const gameContainer = document.getElementById('game-container');
  
  const btnPlay = document.getElementById('btn-play');
  const btnInstructions = document.getElementById('btn-instructions');
  const btnSettings = document.getElementById('btn-settings');
  const btnCloseInstructions = document.getElementById('btn-close-instructions');
  const btnBackMenu = document.getElementById('btn-back-menu');
  
  console.log('[DOMContentLoaded] Elementos encontrados:', {
    btnPlay: !!btnPlay,
    btnInstructions: !!btnInstructions,
    btnSettings: !!btnSettings,
    btnCloseInstructions: !!btnCloseInstructions,
    btnBackMenu: !!btnBackMenu,
    mainMenu: !!mainMenu,
    instructionsModal: !!instructionsModal,
    gameContainer: !!gameContainer
  });
  
  if(btnPlay) {
    console.log('[btnPlay] Registrando click listener');
    btnPlay.addEventListener('click', async ()=>{
      console.log('[btnPlay] Clicked!');
      if(mainMenu) {
        mainMenu.classList.add('hidden');
      }
      if(gameContainer) {
        gameContainer.classList.remove('hidden');
      }
      // Ensure audio is initialized/resumed as part of the user gesture
      try{
        await Sound.initAudio();
        console.log('[btnPlay] Audio initialized from user gesture');
        try{ Sound.testTone(); showMessage('Sonido activado ✅', 1200); }catch(e){ console.warn('[btnPlay] testTone failed', e); showMessage('Sonido: fallo al reproducir tono', 1400); }
      }catch(e){ console.warn('[btnPlay] Audio init failed on click', e); showMessage('No se pudo activar sonido', 1800); }

      // Start background decorations so astronauts/ships spawn
      try{ Decorations.startDecorations('#space-bg', 0.7); console.log('[btnPlay] Decorations started');
        // debug: force show any decorations in case they are hidden behind layers
        try{ const shown = Decorations.debugShowAll(); console.log('[btnPlay] debugShowAll applied ->', shown); if(shown>0) showMessage('Astronautas visibles ✅', 1200); else showMessage('Astronautas: no aparecen (ver consola)', 1800); }catch(e){ }
      }catch(e){ console.warn('[btnPlay] Decorations start failed', e); showMessage('Decoraciones no activas', 1800); }

      initializeGame();
    });
  }
  
  if(btnInstructions) {
    console.log('[btnInstructions] Registrando click listener');
    btnInstructions.addEventListener('click', ()=>{
      console.log('[btnInstructions] Clicked!');
      if(mainMenu) mainMenu.classList.add('hidden');
      if(instructionsModal) instructionsModal.classList.remove('hidden');
    });
  }
  
  if(btnCloseInstructions || btnBackMenu) {
    console.log('[btnBackMenu] Registrando click listener');
    const backBtn = btnCloseInstructions || btnBackMenu;
    backBtn.addEventListener('click', ()=>{
      console.log('[btnBackMenu] Clicked!');
      if(instructionsModal) instructionsModal.classList.add('hidden');
      if(mainMenu) mainMenu.classList.remove('hidden');
    });
  }
  
  if(btnSettings) {
    console.log('[btnSettings] Registrando click listener');
    btnSettings.addEventListener('click', ()=>{
      console.log('[btnSettings] Clicked!');
      alert('Settings coming soon!');
    });
  }
  
  console.log('[DOMContentLoaded] ✓ Completado');
});
