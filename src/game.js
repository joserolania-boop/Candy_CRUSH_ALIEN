import { createBoardState, DEFAULT_COLS, DEFAULT_ROWS } from './board.js';
import { UIManager } from './ui.js';
import * as Sound from './sound.js';
import Decorations from './decorations.js';
import Particles from './particles.js';
import Settings from './settings.js';
import * as Backgrounds from './backgrounds.js';
import Story from './story.js';
import economy from './economy.js';
import boosters, { BOOSTER_TYPES } from './boosters.js';

console.log('[game.js] Module loaded successfully');

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
  createLevel('First Contact', 'deep_nebula', 20, { type: 'score', target: 1200, description: 'Channel your magic to create a protective barrier around the approaching ship' }),
  createLevel('City Defense', 'alien_green', 22, { type: 'pieces', target: 40, description: 'Destroy 40 alien probes threatening our cities with candy blasts' }),
  createLevel('Building Power', 'cosmic_blue', 22, { type: 'score', target: 2500, description: 'Build up magical energy to power our defense shields' }),
  createLevel('Combo Training', 'void_dark', 24, { type: 'score', target: 3500, description: 'Master the art of creating combos to unleash devastating attacks' }),
  createLevel('Final Prep', 'inferno', 24, { type: 'score', target: 4000, description: 'Prepare the ultimate counter-spell against the alien invasion' }),
  createLevel('Wave One', 'station_orbit', 25, { type: 'score', target: 5000, description: 'Lead the first wave of magical defense against the alien fleet' }, 'act1'),
  createLevel('Coastal Raid', 'aurora', 26, { type: 'pieces', target: 60, description: 'Protect our coastlines by eliminating 60 alien landing craft' }),
  createLevel('Arsenal Build', 'galaxy_core', 26, { type: 'score', target: 6500, description: 'Forge powerful artifacts to strengthen our magical arsenal' }),
  createLevel('Mid-Battle', 'binary_sunset', 28, { type: 'score', target: 7000, description: 'Turn the tide of battle with overwhelming magical force' }),
  createLevel('Sector Clear', 'quantum_realm', 28, { type: 'pieces', target: 80, description: 'Clear Sector 7 of all alien presence - destroy 80 enemy units' }),
  createLevel('Base Assault', 'deep_nebula', 30, { type: 'score', target: 10000, description: 'Assault the alien command base with coordinated magical strikes' }, 'act2'),
  createLevel('Fortified Base', 'alien_green', 30, { type: 'pieces', target: 100, description: 'Breach the fortified alien base defenses - eliminate 100 guard units' }),
  createLevel('Maximum Firepower', 'cosmic_blue', 32, { type: 'score', target: 12000, description: 'Unleash maximum firepower by creating devastating combos' }),
  createLevel('Strategic Victory', 'void_dark', 32, { type: 'score', target: 15000, description: 'Achieve strategic victory through superior magical tactics' }),
  createLevel('Precision Bombing', 'inferno', 34, { type: 'score', target: 18000, description: 'Execute precision strikes with massive combo explosions' }),
  createLevel('Archaeological Dig', 'station_orbit', 34, { type: 'score', target: 20000, description: 'Unearth ancient artifacts that hold the key to understanding our visitors' }, 'act3'),
  createLevel('Deep Excavation', 'aurora', 36, { type: 'pieces', target: 150, description: 'Excavate deeper to find 150 crucial alien artifacts' }),
  createLevel('Full Potential', 'galaxy_core', 36, { type: 'score', target: 22000, description: 'Unlock the full potential of ancient magic through high scores' }),
  createLevel('Ancient Knowledge', 'binary_sunset', 38, { type: 'score', target: 25000, description: 'Master the ancient knowledge to bridge our worlds' }),
  createLevel('Master the Ruins', 'quantum_realm', 38, { type: 'score', target: 28000, description: 'Master the ancient ruins by harnessing powerful magical energy' }),
  createLevel('Peace Offering', 'deep_nebula', 40, { type: 'score', target: 30000, description: 'Create a grand peace offering through masterful magical displays' }, 'act4'),
  createLevel('Shared Sacrifice', 'alien_green', 40, { type: 'pieces', target: 200, description: 'Make the ultimate sacrifice - destroy 200 enemy units in a final stand' }),
  createLevel('Combined Might', 'cosmic_blue', 42, { type: 'score', target: 35000, description: 'Combine human and alien might by forging legendary artifacts' }),
  createLevel('United Strength', 'void_dark', 42, { type: 'score', target: 40000, description: 'Demonstrate united strength against the greater cosmic threat' }),
  createLevel('Final Battle', 'inferno', 45, { type: 'score', target: 50000, description: 'Lead humanity and aliens together in the final battle for survival' })
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

// Economy state
let economyInitialized = false;
let livesTimerInterval = null;

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
  
  // Check if player has lives
  if (!economy.hasLives()) {
    showNoLivesModal();
    return;
  }
  
  // Show pre-level screen instead of directly starting
  showPreLevelScreen();
}

function showPreLevelScreen() {
  const screen = document.getElementById('pre-level-screen');
  const levelNumber = document.getElementById('pre-level-number');
  const levelName = document.getElementById('pre-level-name');
  const objectiveEl = document.getElementById('pre-level-objective');
  const movesEl = document.getElementById('pre-level-moves');
  const boostersContainer = document.getElementById('pre-level-boosters');
  
  if (!screen) {
    console.warn('[showPreLevelScreen] Screen not found, starting game directly');
    actuallyStartGame(true);
    return;
  }
  
  const levelDef = LEVELS[level - 1] || LEVELS[0];
  
  // Setup level state
  currentObjective = levelDef.objective || {type: 'score', target: 500};
  objectiveProgress = 0;
  applyTheme(levelDef.theme);
  
  // Update level info
  if (levelNumber) levelNumber.textContent = `Level ${level}`;
  if (levelName) levelName.textContent = levelDef.name;
  
  // Format objective in human-readable way
  if (objectiveEl) {
    const { icon, text } = formatObjective(levelDef.objective);
    objectiveEl.innerHTML = `
      <span class="objective-icon">${icon}</span>
      <span class="objective-text">${text}</span>
    `;
  }
  
  // Show moves
  if (movesEl) {
    movesEl.innerHTML = `
      <span class="moves-icon">⏱️</span>
      <span class="moves-text">${levelDef.moves} moves available</span>
    `;
  }
  
  // Populate boosters
  if (boostersContainer) {
    boostersContainer.innerHTML = '';
    const allBoosters = boosters.getAllBoosterTypes();
    
    for (const booster of allBoosters) {
      const card = document.createElement('div');
      card.className = 'booster-card';
      card.dataset.boosterId = booster.id;
      
      const inventory = boosters.getBoosterCount(booster.id);
      const canAfford = economy.hasCoins(booster.cost);
      const isActive = boosters.isBoosterActive(booster.id);
      
      if (!canAfford && inventory === 0) {
        card.classList.add('insufficient-funds');
      }
      
      if (isActive) {
        card.classList.add('active');
      }
      
      card.innerHTML = `
        <span class="booster-icon">${booster.icon}</span>
        <div class="booster-name">${booster.name}</div>
        <div class="booster-description">${booster.description}</div>
        <div class="booster-cost">💰 ${booster.cost}</div>
        ${inventory > 0 ? `<div class="booster-inventory">×${inventory}</div>` : ''}
      `;
      
      card.addEventListener('click', () => toggleBoosterInPreLevel(booster.id));
      boostersContainer.appendChild(card);
    }
  }
  
  // Show screen
  screen.classList.remove('hidden');
  
  // Setup start button
  const btnStart = document.getElementById('btn-start-level');
  if (btnStart) {
    btnStart.onclick = () => {
      screen.classList.add('hidden');
      startLevel();
    };
  }
}

function startLevel(){
  console.log('[startLevel] Starting level...');
  
  const levelDef = LEVELS[level - 1] || LEVELS[0];
  
  // Initialize board state
  boardState = createBoardState();
  
  // Apply starting power-ups from boosters
  const boosterEffects = boosters.applyPreGameBoosters();
  movesLeft = levelDef.moves + boosterEffects.extraMoves;
  
  if (boosterEffects.startingPowerUps && boosterEffects.startingPowerUps.length > 0) {
    for (const powerUp of boosterEffects.startingPowerUps) {
      // Place power-up at random position
      const randomRow = Math.floor(Math.random() * DEFAULT_ROWS);
      const randomCol = Math.floor(Math.random() * DEFAULT_COLS);
      if (boardState[randomRow] && boardState[randomRow][randomCol]) {
        boardState[randomRow][randomCol].p = powerUp.type;
        console.log(`[startLevel] Applied booster: ${powerUp.type} at ${randomRow},${randomCol}`);
      }
    }
  }
  
  // Consume the boosters from inventory
  boosters.consumeActiveBoosters();
  
  if(boardRoot) {
    boardRoot.innerHTML = '';
    console.log('[startLevel] board-root cleared');
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
    console.log('[startLevel] UIManager created');
    window.ui = ui; // Expose global instance for debug
    ui.render();
    console.log('[startLevel] Board rendered');
  } catch(e) {
    console.error('[startLevel] Error creating UIManager:', e);
    return;
  }

  updateUI();
  updateEconomyUI();
  try { Sound.playBackground().catch(() => {}); } catch(e) { console.warn('Background music error:', e); }
  try{ ui.playPreview(); }catch(e){ console.warn('Preview failed:', e); }
  console.log('[startLevel] ✓ Completed');
}

function formatObjective(objective) {
  if (!objective) return { icon: '🎯', text: 'Complete the level' };
  
  const typeMap = {
    score: {
      icon: '⭐',
      format: (target) => `Reach ${target.toLocaleString()} points`
    },
    pieces: {
      icon: '👽',
      format: (target) => `Collect ${target} alien pieces`
    },
    power_ups: {
      icon: '💣',
      format: (target) => `Create ${target} power-ups`
    },
    combo: {
      icon: '🔥',
      format: (target) => `Make ${target} combo chains`
    }
  };
  
  const config = typeMap[objective.type] || typeMap.score;
  return {
    icon: config.icon,
    text: config.format(objective.target)
  };
}

function actuallyStartGame(resetScore = true){
  console.log('[actuallyStartGame] Starting game with resetScore:', resetScore);
  levelInProgress = true;
  if(resetScore) score = 0;

  const levelDef = LEVELS[level - 1] || LEVELS[0];
  
  const proceedToGame = () => {
    if(boardRoot) boardRoot.classList.remove(BOARD_HIDE_CLASS);
    startLevel();
  };

  if(!levelDef.story_checkpoint) {
    proceedToGame();
  } else {
    if(boardRoot) boardRoot.classList.add(BOARD_HIDE_CLASS);
    showStoryScene(levelDef.story_checkpoint)
      .then(proceedToGame)
      .catch((err) => {
        console.warn('[actuallyStartGame] Story scene rejected', err);
        proceedToGame();
      });
  }
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
  
  // Award stars and coins
  const result = economy.onLevelComplete(level, score, currentObjective.target);
  
  if (result.success) {
    const starText = '⭐'.repeat(result.stars);
    const coinsText = result.coinsEarned > 0 ? ` +${result.coinsEarned}💰` : '';
    showMessage(`✅ LEVEL ${level} COMPLETE! ${starText}${coinsText}`, 3000);
    
    // Show star animations
    if (result.newStars > 0) {
      for (let i = 0; i < result.stars; i++) {
        setTimeout(() => showStarAnimation(), i * 300);
      }
    }
    
    updateEconomyUI();
    
    setTimeout(() => {
      if(level < LEVELS.length) {
        levelUp();
      } else {
        gameEnded('victory');
      }
    }, 3000);
  }
}

function levelFailed(){
  console.log('[levelFailed] Level', level, 'failed. Out of moves.');
  
  // Deduct a life
  economy.spendLife();
  updateEconomyUI();
  
  showMessage(`❌ Out of Moves! Lost 1 life ❤️ (${economy.getLives()} remaining)`, 3000);
  
  setTimeout(() => {
    if (economy.hasLives()) {
      startGame(false); // Restart same level, keep score
    } else {
      showNoLivesModal();
    }
  }, 3000);
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
          // After story, show pre-level screen
          setTimeout(() => showPreLevelScreen(), 500);
        });
    }, 3000);
  } else {
    // No story checkpoint, go directly to pre-level screen after overlay
    setTimeout(() => showPreLevelScreen(), 3000);
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
  const objDescription = levelDef.objective.description || `${objType} ${objTarget}`;
  objective.textContent = `Objective: ${objDescription}`;
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
  
  // Update objective progress display with improved formatting
  if(currentObjective) {
    const { icon, text } = formatObjective(currentObjective);
    let progressText = '';
    
    switch(currentObjective.type) {
      case 'score': 
        progressText = `${icon} ${objectiveProgress.toLocaleString()} / ${currentObjective.target.toLocaleString()}`;
        break;
      case 'pieces': 
        progressText = `${icon} ${objectiveProgress} / ${currentObjective.target} pieces`;
        break;
      case 'power_ups': 
        progressText = `${icon} ${objectiveProgress} / ${currentObjective.target} power-ups`;
        break;
      case 'combo': 
        progressText = `${icon} ${objectiveProgress} / ${currentObjective.target} combos`;
        break;
      default:
        progressText = `${icon} ${objectiveProgress} / ${currentObjective.target}`;
    }
    
    const objEl = document.getElementById('objective-display');
    if(objEl) {
      objEl.textContent = progressText;
      objEl.style.display = 'block';
      // Color progress bar based on progress percentage
      const progress = Math.min(100, (objectiveProgress / currentObjective.target) * 100);
      objEl.style.background = `linear-gradient(90deg, rgba(100,200,255,0.4) ${progress}%, transparent ${progress}%)`;
    }
  }
}

// ============================================================================
// ECONOMY UI FUNCTIONS
// ============================================================================

function updateEconomyUI() {
  // Update lives
  const livesCount = document.getElementById('lives-count');
  const livesTimer = document.getElementById('lives-timer');
  if (livesCount) {
    livesCount.textContent = economy.getLives();
  }
  if (livesTimer) {
    livesTimer.textContent = economy.getTimeToNextLifeFormatted();
  }
  
  // Update coins
  const coinsCount = document.getElementById('coins-count');
  if (coinsCount) {
    coinsCount.textContent = economy.getCoins();
  }
  
  // Update stars
  const starsCount = document.getElementById('stars-count');
  if (starsCount) {
    starsCount.textContent = economy.getTotalStars();
  }
}

function startLivesTimer() {
  if (livesTimerInterval) clearInterval(livesTimerInterval);
  
  livesTimerInterval = setInterval(() => {
    const livesTimer = document.getElementById('lives-timer');
    if (livesTimer) {
      livesTimer.textContent = economy.getTimeToNextLifeFormatted();
    }
    
    // Update lives count in case it regenerated
    const livesCount = document.getElementById('lives-count');
    if (livesCount) {
      livesCount.textContent = economy.getLives();
    }
  }, 1000); // Update every second
}

// showBoosterModal removed - replaced by showPreLevelScreen

function toggleBoosterInPreLevel(boosterId) {
  const card = document.querySelector(`.booster-card[data-booster-id="${boosterId}"]`);
  if (!card) return;
  
  const boosterInfo = boosters.getBoosterInfo(boosterId);
  const inventory = boosters.getBoosterCount(boosterId);
  const isActive = boosters.isBoosterActive(boosterId);
  
  if (isActive) {
    // Deactivate
    boosters.deactivatePreGameBooster(boosterId);
    card.classList.remove('active');
    return;
  }
  
  // Try to activate - need to own or buy
  if (inventory > 0) {
    boosters.activatePreGameBooster(boosterId);
    card.classList.add('active');
  } else {
    // Try to purchase
    const boosterInfo = boosters.getBoosterInfo(boosterId);
    if (!economy.hasCoins(boosterInfo.cost)) {
      showMessage(`❌ Not enough coins! Need 💰${boosterInfo.cost}`, 2000);
      return;
    }
    
    const result = boosters.purchaseBooster(boosterId);
    if (result.success) {
      showMessage(`✅ Purchased ${boosterInfo.name}!`, 1500);
      boosters.activatePreGameBooster(boosterId);
      card.classList.add('active');
      
      // Update inventory display
      const invEl = card.querySelector('.booster-inventory');
      if (invEl) {
        invEl.textContent = `×${result.newCount}`;
      } else {
        card.insertAdjacentHTML('beforeend', `<div class="booster-inventory">×${result.newCount}</div>`);
      }
      
      updateEconomyUI();
    } else {
      showMessage(`❌ ${result.error}`, 2000);
    }
  }
}

function showNoLivesModal() {
  const message = `
    ❤️ Out of Lives!
    
    Wait ${economy.getTimeToNextLifeFormatted()} for next life
    or
    Get more lives from the shop (Coming soon!)
  `;
  
  alert(message);
}

function showStarAnimation() {
  const popup = document.createElement('div');
  popup.className = 'star-popup';
  popup.textContent = '⭐';
  popup.style.left = `${Math.random() * window.innerWidth}px`;
  popup.style.top = `${Math.random() * (window.innerHeight / 2)}px`;
  document.body.appendChild(popup);
  
  setTimeout(() => popup.remove(), 1500);
}

// ============================================================================
// PAUSE MENU
// ============================================================================

function showPauseMenu() {
  const menu = document.getElementById('pause-menu');
  if (!menu) return;
  
  menu.classList.remove('hidden');
  
  // Pause game logic here if needed (stop timers, etc.)
  
  const btnResume = document.getElementById('btn-resume');
  const btnRestart = document.getElementById('btn-restart-level');
  const btnQuit = document.getElementById('btn-quit-level');
  
  if (btnResume) {
    btnResume.onclick = () => {
      menu.classList.add('hidden');
    };
  }
  
  if (btnRestart) {
    btnRestart.onclick = () => {
      menu.classList.add('hidden');
      if (confirm('Restart level? This will not cost a life if you have coins.')) {
        startGame(false);
      }
    };
  }
  
  if (btnQuit) {
    btnQuit.onclick = () => {
      menu.classList.add('hidden');
      if (confirm('Quit to menu? Progress will be lost.')) {
        // Return to main menu
        const gameContainer = document.getElementById('game-container');
        const mainMenu = document.getElementById('main-menu');
        if (gameContainer) gameContainer.classList.add('hidden');
        if (mainMenu) mainMenu.classList.remove('hidden');
      }
    };
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
  
  // Setup pause button
  const btnPause = document.getElementById('btn-pause');
  if (btnPause) {
    btnPause.addEventListener('click', () => showPauseMenu());
  }
  
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
  console.log('[initializeGame] Starting initialization...');
  try {
    boardRoot = document.getElementById('board-root');
    if(!boardRoot) {
      console.error('No board-root found!');
      return;
    }
    
    console.log('[initializeGame] board-root encontrado, inicializando...');
    setupGameUI();
    console.log('[initializeGame] setupGameUI completed');
    
    // Initialize economy UI
    updateEconomyUI();
    console.log('[initializeGame] updateEconomyUI completed');
    
    startLivesTimer();
    console.log('[initializeGame] startLivesTimer completed');
    
    // ESPERAR a que audio esté listo ANTES de jugar
    Sound.initAudio().then(() => {
      console.log('[initializeGame] ✓ Audio context está listo');
      // Don't auto-start, wait for user to click Play button
    }).catch(e => {
      console.warn('[initializeGame] Audio warning (no crítico):', e);
    });
  } catch(e) {
    console.error('[initializeGame] Error during initialization:', e);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  console.log('[DOMContentLoaded] Starting initialization...');
  
  // Initialize audio early to allow user interaction to resume context
  Sound.initAudio().catch(() => {});
  
  const mainMenu = document.getElementById('main-menu');
  const instructionsModal = document.getElementById('instructions-modal');
  const gameContainer = document.getElementById('game-container');
  
  const btnPlay = document.getElementById('btn-play');
  const btnContinue = document.getElementById('btn-continue');
  const btnNewGame = document.getElementById('btn-new-game');
  const btnInstructions = document.getElementById('btn-instructions');
  const btnSettings = document.getElementById('btn-settings');
  const btnCloseInstructions = document.getElementById('btn-close-instructions');
  const btnBackMenu = document.getElementById('btn-back-menu');
  
  console.log('[DOMContentLoaded] Elementos encontrados:', {
    btnPlay: !!btnPlay,
    btnContinue: !!btnContinue,
    btnNewGame: !!btnNewGame,
    btnInstructions: !!btnInstructions,
    btnSettings: !!btnSettings,
    btnCloseInstructions: !!btnCloseInstructions,
    btnBackMenu: !!btnBackMenu,
    mainMenu: !!mainMenu,
    instructionsModal: !!instructionsModal,
    gameContainer: !!gameContainer
  });
  
  // Check if there's saved progress
  const savedLevel = localStorage.getItem('candy_current_level');
  if(savedLevel && parseInt(savedLevel, 10) > 0) {
    if(btnContinue) btnContinue.style.display = 'block';
    if(btnPlay) btnPlay.style.display = 'none'; // Hide old play button
  } else {
    if(btnContinue) btnContinue.style.display = 'none';
    if(btnPlay) btnPlay.style.display = 'block';
  }
  
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

  if(btnContinue) {
    console.log('[btnContinue] Element found, registering click listener');
    btnContinue.addEventListener('click', async ()=>{
      console.log('[btnContinue] Clicked!');
      if(mainMenu) {
        mainMenu.classList.add('hidden');
      }
      if(gameContainer) {
        gameContainer.classList.remove('hidden');
      }
      // Ensure audio is initialized/resumed as part of the user gesture
      try{
        await Sound.initAudio();
        console.log('[btnContinue] Audio initialized from user gesture');
        try{ Sound.testTone(); showMessage('Sonido activado ✅', 1200); }catch(e){ console.warn('[btnContinue] testTone failed', e); showMessage('Sonido: fallo al reproducir tono', 1400); }
      }catch(e){ console.warn('[btnContinue] Audio init failed on click', e); showMessage('No se pudo activar sonido', 1800); }

      // Start background decorations so astronauts/ships spawn
      try{ Decorations.startDecorations('#space-bg', 0.7); console.log('[btnContinue] Decorations started');
        // debug: force show any decorations in case they are hidden behind layers
        try{ const shown = Decorations.debugShowAll(); console.log('[btnContinue] debugShowAll applied ->', shown); if(shown>0) showMessage('Astronautas visibles ✅', 1200); else showMessage('Astronautas: no aparecen (ver consola)', 1800); }catch(e){ }
      }catch(e){ console.warn('[btnContinue] Decorations start failed', e); showMessage('Decoraciones no activas', 1800); }

      console.log('[btnContinue] Calling initializeGame...');
      initializeGame();
      console.log('[btnContinue] Calling startGame...');
      startGame(false);
      console.log('[btnContinue] Game continue sequence completed');
    });
    console.log('[btnContinue] Event listener registered successfully');
  } else {
    console.error('[btnContinue] Button not found!');
  }

  if(btnNewGame) {
    console.log('[btnNewGame] Element found, registering click listener');
    btnNewGame.addEventListener('click', async ()=>{
      console.log('[btnNewGame] Clicked!');
      try {
        // Reset all progress
        localStorage.removeItem('candy_current_level');
        economy.reset();
        boosters.reset();
        level = 1;
        score = 0;
        objectiveProgress = 0;
        movesLeft = 0;
        currentObjective = null;

        if(mainMenu) {
          mainMenu.classList.add('hidden');
        }
        if(gameContainer) {
          gameContainer.classList.remove('hidden');
        }
        // Ensure audio is initialized/resumed as part of the user gesture
        try{
          await Sound.initAudio();
          console.log('[btnNewGame] Audio initialized from user gesture');
          try{ Sound.testTone(); showMessage('Sonido activado ✅', 1200); }catch(e){ console.warn('[btnNewGame] testTone failed', e); showMessage('Sonido: fallo al reproducir tono', 1400); }
        }catch(e){ console.warn('[btnNewGame] Audio init failed on click', e); showMessage('No se pudo activar sonido', 1800); }

        // Start background decorations so astronauts/ships spawn
        try{ Decorations.startDecorations('#space-bg', 0.7); console.log('[btnNewGame] Decorations started');
          // debug: force show any decorations in case they are hidden behind layers
          try{ const shown = Decorations.debugShowAll(); console.log('[btnNewGame] debugShowAll applied ->', shown); if(shown>0) showMessage('Astronautas visibles ✅', 1200); else showMessage('Astronautas: no aparecen (ver consola)', 1800); }catch(e){ }
        }catch(e){ console.warn('[btnNewGame] Decorations start failed', e); showMessage('Decoraciones no activas', 1800); }

        console.log('[btnNewGame] Calling initializeGame...');
        initializeGame();
        console.log('[btnNewGame] Calling startGame...');
        startGame(true);
        console.log('[btnNewGame] Game start sequence completed');
      } catch(e) {
        console.error('[btnNewGame] Error:', e);
        showMessage('Error starting game: ' + e.message, 3000);
      }
    });
    console.log('[btnNewGame] Event listener registered successfully');
  } else {
    console.error('[btnNewGame] Button not found!');
  }
  
  // Connect Start button in game to restart functionality  
  const btnGameStart = document.getElementById('btn-start');
  if(btnGameStart) {
    btnGameStart.addEventListener('click', () => startGame(true));
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
      if(gameContainer) gameContainer.classList.add('hidden');
      if(mainMenu) mainMenu.classList.remove('hidden');
    });
  }
  
  if(btnSettings) {
    console.log('[btnSettings] Registrando click listener');
    btnSettings.addEventListener('click', ()=>{
      console.log('[btnSettings] Clicked!');
      if(confirm('Reset all progress, coins and boosters?')) {
        economy.reset();
        boosters.reset();
        localStorage.removeItem('candy_current_level');
        location.reload();
      }
    });
  }
  
  console.log('[DOMContentLoaded] ✓ Completado');
});
