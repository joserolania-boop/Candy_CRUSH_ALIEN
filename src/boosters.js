// ============================================================================
// BOOSTERS SYSTEM
// ============================================================================
// Pre-game boosters that players can purchase and activate before starting
// a level to gain strategic advantages.
// ============================================================================

import economy from './economy.js';

const BOOSTER_TYPES = {
  HAMMER: {
    id: 'hammer',
    name: 'Lollipop Hammer',
    icon: '🔨',
    description: 'Destroys a 3x3 area when swapped with any tile',
    cost: 100,
    type: 'pre-game'
  },
  BOMB: {
    id: 'bomb',
    name: 'Mega Bomb',
    icon: '💣',
    description: 'Massive 5x5 explosion when swapped with any tile',
    cost: 180,
    type: 'pre-game'
  },
  EXTRA_MOVES: {
    id: 'extra_moves',
    name: '+5 Moves',
    icon: '⏱️',
    description: 'Start the level with 5 additional moves',
    cost: 120,
    type: 'pre-game'
  },
  COLOR_BOMB: {
    id: 'color_bomb',
    name: 'Color Bomb',
    icon: '🌈',
    description: 'Clears all tiles of the same color when swapped',
    cost: 250,
    type: 'pre-game'
  }
};

const STORAGE_KEY = 'candy_boosters_inventory';

class BoosterSystem {
  constructor() {
    this.inventory = this._loadInventory();
    this.activeBoosters = new Set(); // Boosters active for current level
    this.activeHammer = false; // Special state for hammer mode
  }

  // ========== INVENTORY MANAGEMENT ==========
  
  _loadInventory() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : this._getDefaultInventory();
    } catch(e) {
      console.warn('[Boosters] Failed to load inventory:', e);
      return this._getDefaultInventory();
    }
  }
  
  _getDefaultInventory() {
    return {
      hammer: 0,
      bomb: 0,
      extra_moves: 0,
      color_bomb: 0
    };
  }
  
  _saveInventory() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.inventory));
    } catch(e) {
      console.warn('[Boosters] Failed to save inventory:', e);
    }
  }
  
  getInventory() {
    return { ...this.inventory };
  }
  
  getBoosterCount(boosterId) {
    return this.inventory[boosterId] || 0;
  }
  
  hasBooster(boosterId) {
    return this.getBoosterCount(boosterId) > 0;
  }

  // ========== PURCHASE ==========
  
  purchaseBooster(boosterId) {
    const booster = Object.values(BOOSTER_TYPES).find(b => b.id === boosterId);
    
    if (!booster) {
      console.error('[Boosters] Invalid booster ID:', boosterId);
      return { success: false, error: 'Invalid booster' };
    }
    
    if (!economy.hasCoins(booster.cost)) {
      return { 
        success: false, 
        error: 'Not enough coins',
        cost: booster.cost,
        available: economy.getCoins()
      };
    }
    
    if (economy.spendCoins(booster.cost)) {
      this.inventory[boosterId] = (this.inventory[boosterId] || 0) + 1;
      this._saveInventory();
      
      return {
        success: true,
        boosterId,
        newCount: this.inventory[boosterId],
        coinsRemaining: economy.getCoins()
      };
    }
    
    return { success: false, error: 'Purchase failed' };
  }

  // ========== PRE-GAME ACTIVATION ==========
  
  activatePreGameBooster(boosterId) {
    if (!this.hasBooster(boosterId)) {
      return { success: false, error: 'Booster not in inventory' };
    }
    
    const booster = Object.values(BOOSTER_TYPES).find(b => b.id === boosterId);
    
    if (!booster || booster.type !== 'pre-game') {
      return { success: false, error: 'Not a pre-game booster' };
    }
    
    // Add to active boosters for this level
    this.activeBoosters.add(boosterId);
    
    // Don't consume yet - will be consumed when level actually starts
    return { success: true, boosterId };
  }
  
  deactivatePreGameBooster(boosterId) {
    this.activeBoosters.delete(boosterId);
  }
  
  getActiveBoosters() {
    return Array.from(this.activeBoosters);
  }
  
  isBoosterActive(boosterId) {
    return this.activeBoosters.has(boosterId);
  }

  // ========== LEVEL START ==========
  
  consumeActiveBoosters() {
    // Called when level actually starts - consumes the active boosters
    const consumed = [];
    
    for (const boosterId of this.activeBoosters) {
      if (this.inventory[boosterId] > 0) {
        this.inventory[boosterId]--;
        consumed.push(boosterId);
      }
    }
    
    this._saveInventory();
    return consumed;
  }
  
  applyPreGameBoosters() {
    // Returns configuration for how boosters affect the level
    const effects = {
      extraMoves: 0,
      startingPowerUps: []
    };
    
    if (this.activeBoosters.has('extra_moves')) {
      effects.extraMoves = 5;
    }
    
    if (this.activeBoosters.has('hammer')) {
      effects.startingPowerUps.push({
        type: 'hammer',
        position: 'random' // Will be placed randomly on board
      });
    }
    
    if (this.activeBoosters.has('bomb')) {
      effects.startingPowerUps.push({
        type: 'bomb',
        position: 'random' // Will be placed randomly on board
      });
    }
    
    if (this.activeBoosters.has('color_bomb')) {
      effects.startingPowerUps.push({
        type: 'colorbomb',
        position: 'random' // Will be placed randomly on board
      });
    }
    
    return effects;
  }
  
  clearActiveBoosters() {
    this.activeBoosters.clear();
  }

  // ========== IN-GAME BOOSTERS (HAMMER) ==========
  
  activateHammer() {
    if (!this.hasBooster('hammer')) {
      return { success: false, error: 'No hammers in inventory' };
    }
    
    this.activeHammer = true;
    return { success: true };
  }
  
  useHammer(row, col, board) {
    if (!this.activeHammer) {
      return { success: false, error: 'Hammer not activated' };
    }
    
    // Consume hammer from inventory
    if (this.inventory.hammer > 0) {
      this.inventory.hammer--;
      this._saveInventory();
    }
    
    this.activeHammer = false;
    
    // Remove the tile at the specified position
    return {
      success: true,
      position: { row, col },
      newCount: this.inventory.hammer
    };
  }
  
  cancelHammer() {
    this.activeHammer = false;
  }
  
  isHammerActive() {
    return this.activeHammer;
  }

  // ========== UTILITY ==========
  
  getAllBoosterTypes() {
    return Object.values(BOOSTER_TYPES);
  }
  
  getBoosterInfo(boosterId) {
    return Object.values(BOOSTER_TYPES).find(b => b.id === boosterId);
  }

  // ========== DEBUG ==========
  
  reset() {
    this.inventory = this._getDefaultInventory();
    this.activeBoosters.clear();
    this.activeHammer = false;
    this._saveInventory();
  }
  
  addDebugBoosters(boosterId = 'hammer', count = 5) {
    this.inventory[boosterId] = (this.inventory[boosterId] || 0) + count;
    this._saveInventory();
  }
}

// Singleton instance
const boosters = new BoosterSystem();

export default boosters;
export { BOOSTER_TYPES };
