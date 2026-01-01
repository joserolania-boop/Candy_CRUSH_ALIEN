// ============================================================================
// ECONOMY SYSTEM - Lives, Coins, Stars
// ============================================================================
// Manages the game economy including lives regeneration, coin transactions,
// and star ratings for level completion.
// ============================================================================

const STORAGE_KEYS = {
  LIVES: 'candy_lives',
  COINS: 'candy_coins',
  LAST_LIFE_TIME: 'candy_last_life_time',
  LEVEL_STARS: 'candy_level_stars' // JSON object: {level: stars}
};

const CONFIG = {
  MAX_LIVES: 5,
  LIFE_REGEN_TIME_MS: 30 * 60 * 1000, // 30 minutes in milliseconds
  INITIAL_COINS: 100,
  
  // Rewards per star rating
  COINS_PER_STAR: {
    1: 50,
    2: 100,
    3: 150
  },
  
  // Star thresholds as percentage of target score
  STAR_THRESHOLDS: {
    1: 1.0,   // Complete objective
    2: 1.3,   // 130% of target
    3: 1.6    // 160% of target
  }
};

class EconomySystem {
  constructor() {
    this.lives = this._loadLives();
    this.coins = this._loadCoins();
    this.levelStars = this._loadLevelStars();
    this.lastLifeTime = this._loadLastLifeTime();
    
    // Start life regeneration timer
    this._startLifeRegen();
  }

  // ========== LIVES SYSTEM ==========
  
  _loadLives() {
    try {
      const saved = parseInt(localStorage.getItem(STORAGE_KEYS.LIVES), 10);
      return Number.isFinite(saved) ? Math.min(saved, CONFIG.MAX_LIVES) : CONFIG.MAX_LIVES;
    } catch(e) {
      console.warn('[Economy] Failed to load lives:', e);
      return CONFIG.MAX_LIVES;
    }
  }
  
  _saveLives() {
    try {
      localStorage.setItem(STORAGE_KEYS.LIVES, this.lives);
    } catch(e) {
      console.warn('[Economy] Failed to save lives:', e);
    }
  }
  
  _loadLastLifeTime() {
    try {
      const saved = parseInt(localStorage.getItem(STORAGE_KEYS.LAST_LIFE_TIME), 10);
      return Number.isFinite(saved) ? saved : Date.now();
    } catch(e) {
      return Date.now();
    }
  }
  
  _saveLastLifeTime() {
    try {
      localStorage.setItem(STORAGE_KEYS.LAST_LIFE_TIME, this.lastLifeTime);
    } catch(e) {
      console.warn('[Economy] Failed to save life time:', e);
    }
  }
  
  _startLifeRegen() {
    // Check for regenerated lives every minute
    setInterval(() => {
      this._updateLives();
    }, 60 * 1000); // Check every minute
    
    // Initial check
    this._updateLives();
  }
  
  _updateLives() {
    if (this.lives >= CONFIG.MAX_LIVES) {
      this.lastLifeTime = Date.now();
      this._saveLastLifeTime();
      return;
    }
    
    const now = Date.now();
    const elapsed = now - this.lastLifeTime;
    const livesToAdd = Math.floor(elapsed / CONFIG.LIFE_REGEN_TIME_MS);
    
    if (livesToAdd > 0) {
      this.lives = Math.min(this.lives + livesToAdd, CONFIG.MAX_LIVES);
      this.lastLifeTime = now - (elapsed % CONFIG.LIFE_REGEN_TIME_MS);
      this._saveLives();
      this._saveLastLifeTime();
      
      // Trigger UI update if callback exists
      if (this.onLivesChanged) {
        this.onLivesChanged(this.lives);
      }
    }
  }
  
  getLives() {
    this._updateLives(); // Always check for regen before returning
    return this.lives;
  }
  
  hasLives() {
    return this.getLives() > 0;
  }
  
  spendLife() {
    if (!this.hasLives()) {
      return false;
    }
    
    this.lives--;
    
    // Start regeneration timer if we just went below max
    if (this.lives === CONFIG.MAX_LIVES - 1) {
      this.lastLifeTime = Date.now();
      this._saveLastLifeTime();
    }
    
    this._saveLives();
    
    if (this.onLivesChanged) {
      this.onLivesChanged(this.lives);
    }
    
    return true;
  }
  
  addLives(amount) {
    this.lives = Math.min(this.lives + amount, CONFIG.MAX_LIVES);
    this._saveLives();
    
    if (this.onLivesChanged) {
      this.onLivesChanged(this.lives);
    }
  }
  
  getTimeToNextLife() {
    if (this.lives >= CONFIG.MAX_LIVES) {
      return 0;
    }
    
    const now = Date.now();
    const elapsed = now - this.lastLifeTime;
    const remaining = CONFIG.LIFE_REGEN_TIME_MS - (elapsed % CONFIG.LIFE_REGEN_TIME_MS);
    return remaining;
  }
  
  getTimeToNextLifeFormatted() {
    const ms = this.getTimeToNextLife();
    if (ms === 0) return 'Full';
    
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  // ========== COINS SYSTEM ==========
  
  _loadCoins() {
    try {
      const saved = parseInt(localStorage.getItem(STORAGE_KEYS.COINS), 10);
      return Number.isFinite(saved) ? saved : CONFIG.INITIAL_COINS;
    } catch(e) {
      console.warn('[Economy] Failed to load coins:', e);
      return CONFIG.INITIAL_COINS;
    }
  }
  
  _saveCoins() {
    try {
      localStorage.setItem(STORAGE_KEYS.COINS, this.coins);
    } catch(e) {
      console.warn('[Economy] Failed to save coins:', e);
    }
  }
  
  getCoins() {
    return this.coins;
  }
  
  hasCoins(amount) {
    return this.coins >= amount;
  }
  
  addCoins(amount) {
    this.coins += amount;
    this._saveCoins();
    
    if (this.onCoinsChanged) {
      this.onCoinsChanged(this.coins);
    }
    
    return this.coins;
  }
  
  spendCoins(amount) {
    if (!this.hasCoins(amount)) {
      return false;
    }
    
    this.coins -= amount;
    this._saveCoins();
    
    if (this.onCoinsChanged) {
      this.onCoinsChanged(this.coins);
    }
    
    return true;
  }

  // ========== STARS SYSTEM ==========
  
  _loadLevelStars() {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.LEVEL_STARS);
      return saved ? JSON.parse(saved) : {};
    } catch(e) {
      console.warn('[Economy] Failed to load level stars:', e);
      return {};
    }
  }
  
  _saveLevelStars() {
    try {
      localStorage.setItem(STORAGE_KEYS.LEVEL_STARS, JSON.stringify(this.levelStars));
    } catch(e) {
      console.warn('[Economy] Failed to save level stars:', e);
    }
  }
  
  calculateStars(score, targetScore) {
    const ratio = score / targetScore;
    
    if (ratio >= CONFIG.STAR_THRESHOLDS[3]) return 3;
    if (ratio >= CONFIG.STAR_THRESHOLDS[2]) return 2;
    if (ratio >= CONFIG.STAR_THRESHOLDS[1]) return 1;
    return 0; // Failed to meet objective
  }
  
  getLevelStars(level) {
    return this.levelStars[level] || 0;
  }
  
  setLevelStars(level, stars) {
    const previousStars = this.getLevelStars(level);
    
    // Only update if new stars are higher
    if (stars > previousStars) {
      this.levelStars[level] = stars;
      this._saveLevelStars();
      
      // Award coins for NEW stars only
      const newStarsEarned = stars - previousStars;
      const coinsEarned = newStarsEarned * CONFIG.COINS_PER_STAR[stars];
      
      if (coinsEarned > 0) {
        this.addCoins(coinsEarned);
      }
      
      return {
        stars,
        newStars: newStarsEarned,
        coinsEarned,
        isNewRecord: true
      };
    }
    
    return {
      stars: previousStars,
      newStars: 0,
      coinsEarned: 0,
      isNewRecord: false
    };
  }
  
  getTotalStars() {
    return Object.values(this.levelStars).reduce((sum, stars) => sum + stars, 0);
  }
  
  // ========== LEVEL COMPLETION ==========
  
  onLevelComplete(level, score, targetScore) {
    const stars = this.calculateStars(score, targetScore);
    
    if (stars === 0) {
      // Failed to meet objective - lose a life
      this.spendLife();
      return {
        success: false,
        stars: 0,
        newStars: 0,
        coinsEarned: 0
      };
    }
    
    // Success - award stars and coins
    const result = this.setLevelStars(level, stars);
    
    return {
      success: true,
      ...result
    };
  }

  // ========== DEBUG ==========
  
  reset() {
    this.lives = CONFIG.MAX_LIVES;
    this.coins = CONFIG.INITIAL_COINS;
    this.levelStars = {};
    this.lastLifeTime = Date.now();
    
    this._saveLives();
    this._saveCoins();
    this._saveLevelStars();
    this._saveLastLifeTime();
  }
  
  // Cheat codes for testing
  addDebugCoins(amount = 1000) {
    this.addCoins(amount);
  }
  
  fillLives() {
    this.lives = CONFIG.MAX_LIVES;
    this._saveLives();
    if (this.onLivesChanged) this.onLivesChanged(this.lives);
  }
}

// Singleton instance
const economy = new EconomySystem();

// Export for use in other modules
export default economy;
export { CONFIG as ECONOMY_CONFIG };
