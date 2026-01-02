import {cloneBoard, getRandomTile} from './board.js';

function deepClone(board){ return cloneBoard(board); }

// Find all match groups (arrays of {r,c}). Horizontal and vertical runs >=3
export function findMatches(board){
  // Returns array of match objects: {cells: [{r,c}], orientation: 'h'|'v', len}
  const rows = board.length; const cols = board[0].length;
  const groups = [];
  // horizontal
  for(let r=0;r<rows;r++){
    let runStart=0;
    for(let c=0;c<=cols;c++){
      if(c<cols && board[r][c] && board[r][runStart] && board[r][c].v===board[r][runStart].v){
        // continue
      } else {
        const runLen = c - runStart;
        if(runLen>=3){
          const group=[];
          for(let x=runStart;x<c;x++) group.push({r, c:x});
          groups.push({cells:group, orientation:'h', len:group.length});
        }
        runStart = c;
      }
    }
  }
  // vertical
  for(let c=0;c<cols;c++){
    let runStart=0;
    for(let r=0;r<=rows;r++){
      if(r<rows && board[r][c] && board[runStart][c] && board[r][c].v===board[runStart][c].v){
        // continue
      } else {
        const runLen = r - runStart;
        if(runLen>=3){
          const group=[];
          for(let y=runStart;y<r;y++) group.push({r:y, c});
          groups.push({cells:group, orientation:'v', len:group.length});
        }
        runStart = r;
      }
    }
  }
  return groups;
}

export function swapTiles(board, a, b){
  const tmp = board[a.r][a.c];
  board[a.r][a.c] = board[b.r][b.c];
  board[b.r][b.c] = tmp;
}

export function isValidSwap(board, a, b){
  const ta = board[a.r][a.c];
  const tb = board[b.r][b.c];
  // If either is a booster/power-up, it's a valid swap now
  if((ta && ta.p) || (tb && tb.p)) return true;

  const copy = deepClone(board);
  swapTiles(copy, a, b);
  const groups = findMatches(copy);
  return groups.length>0;
}

// Activate a striped power at position -> returns set of removed coords
function activateStriped(board, r, c, orientation){
  const rows = board.length; const cols = board[0].length;
  const removed = new Set();
  if(orientation==='h'){
    for(let x=0;x<cols;x++){ if(board[r][x]) removed.add(`${r},${x}`); }
  } else {
    for(let y=0;y<rows;y++){ if(board[y][c]) removed.add(`${y},${c}`); }
  }
  return removed;
}

// Activate wrapped: remove 3x3 centered
function activateWrapped(board, r, c){
  const rows = board.length; const cols = board[0].length;
  const removed = new Set();
  for(let dr=-1;dr<=1;dr++){
    for(let dc=-1;dc<=1;dc++){
      const rr=r+dr, cc=c+dc;
      if(rr>=0 && rr<rows && cc>=0 && cc<cols && board[rr][cc]) removed.add(`${rr},${cc}`);
    }
  }
  return removed;
}

// Activate bomb: remove the bomb cell plus all 8 surrounding tiles (3x3 area)
function activateBomb(board, r, c){
  const rows = board.length; const cols = board[0].length;
  const removed = new Set();
  for(let dr=-1; dr<=1; dr++){
    for(let dc=-1; dc<=1; dc++){
      const rr = r+dr, cc = c+dc;
      if(rr>=0 && rr<rows && cc>=0 && cc<cols && board[rr][cc]){ 
        removed.add(`${rr},${cc}`); 
      }
    }
  }
  return removed;
}

function activateHammer(board, r, c){
  const rows = board.length; const cols = board[0].length;
  const removed = new Set();
  // Hammer destroys a small cross shape
  const coords = [[r,c], [r-1,c], [r+1,c], [r,c-1], [r,c+1]];
  for(const [rr,cc] of coords){
    if(rr>=0 && rr<rows && cc>=0 && cc<cols && board[rr][cc]){
      removed.add(`${rr},${cc}`);
    }
  }
  return removed;
}

// Activate colorbomb swapped with a color value -> remove all tiles of that value
function activateColorBomb(board, colorValue){
  const rows = board.length; const cols = board[0].length;
  const removed = new Set();
  for(let r=0;r<rows;r++) for(let c=0;c<cols;c++){
    if(board[r][c] && board[r][c].v===colorValue) removed.add(`${r},${c}`);
  }
  return removed;
}

// Helper to apply removal set to board and return number removed
function applyRemovalSet(board, removalSet){
  let removed = 0;
  for(const key of removalSet){ const [r,c]=key.split(',').map(Number); if(board[r][c]){ board[r][c]=null; removed++; } }
  return removed;
}

export function removeGroups(board, groups){
  let removed = 0;
  for(const g of groups){
    for(const p of g){
      if(board[p.r][p.c]){ board[p.r][p.c] = null; removed++; }
    }
  }
  return removed;
}

export function applyGravity(board){
  const rows = board.length; const cols = board[0].length;
  for(let c=0;c<cols;c++){
    let write = rows-1;
    for(let r=rows-1;r>=0;r--){
      if(board[r][c]){ board[write][c]=board[r][c]; if(write!==r) board[r][c]=null; write--; }
    }
    for(let r=write;r>=0;r--) board[r][c]=null;
  }
}

export function refillBoard(board, paletteSize, luck = 0){
  const rows = board.length; const cols = board[0].length;
  const luckyPositions = [];
  
  // We'll process from bottom to top to ensure we can see what's below
  for(let r=rows-1; r>=0; r--){
    for(let c=0; c<cols; c++){
      if(!board[r][c]) {
        let tileValue = null;
        let isLucky = false;
        
        // Smart Lucky Biasing
        if (luck > 0 && Math.random() < luck) {
          const candidates = [];
          const possibleValues = [];
          // Get all possible tile values (0 to paletteSize-1)
          for(let v=0; v<paletteSize; v++) possibleValues.push(v);
          
          // For each possible value, check if it creates a match
          for(const v of possibleValues) {
            // Temporary placement
            board[r][c] = { v };
            if (checkMatchAt(board, r, c)) {
              candidates.push({ v, weight: 10 }); // High weight for immediate match
            } else {
              // Check for "near matches" (match of 2)
              if (checkNearMatchAt(board, r, c)) {
                candidates.push({ v, weight: 3 }); // Medium weight for potential match
              }
            }
            board[r][c] = null; // Reset
          }
          
          if (candidates.length > 0) {
            // Sort by weight and pick one of the best
            candidates.sort((a, b) => b.weight - a.weight);
            const bestWeight = candidates[0].weight;
            const bestCandidates = candidates.filter(can => can.weight === bestWeight);
            tileValue = bestCandidates[Math.floor(Math.random() * bestCandidates.length)].v;
            if (bestWeight === 10) isLucky = true; // Only mark as lucky if it creates an immediate match
          }
        }
        
        if (tileValue !== null) {
          board[r][c] = { v: tileValue };
          if (isLucky) luckyPositions.push({ r, c });
        } else {
          board[r][c] = getRandomTile(paletteSize);
        }
      }
    }
  }
  return luckyPositions;
}

// Helper to check if a tile at (r,c) creates a match of 3+
function checkMatchAt(board, r, c) {
  const val = board[r][c].v;
  const rows = board.length;
  const cols = board[0].length;
  
  // Horizontal
  let hCount = 1;
  // Right
  for(let i=c+1; i<cols && board[r][i] && board[r][i].v === val; i++) hCount++;
  // Left
  for(let i=c-1; i>=0 && board[r][i] && board[r][i].v === val; i++) hCount++;
  if(hCount >= 3) return true;
  
  // Vertical
  let vCount = 1;
  // Down
  for(let i=r+1; i<rows && board[i][c] && board[i][c].v === val; i++) vCount++;
  // Up
  for(let i=r-1; i>=0 && board[i][c] && board[i][c].v === val; i++) vCount++;
  if(vCount >= 3) return true;
  
  return false;
}

// Helper to check if a tile at (r,c) creates a match of 2 (near match)
function checkNearMatchAt(board, r, c) {
  const val = board[r][c].v;
  const rows = board.length;
  const cols = board[0].length;
  
  const directions = [[0,1],[0,-1],[1,0],[-1,0]];
  for(const [dr, dc] of directions) {
    const nr = r + dr, nc = c + dc;
    if(nr>=0 && nr<rows && nc>=0 && nc<cols && board[nr][nc] && board[nr][nc].v === val) {
      return true;
    }
  }
  return false;
}

// Resolve matches once and return phased snapshots for preview (swap already applied outside)
export function resolveOnceWithPhases(board, paletteSize, luck = 0){
  const phases = [];
  const rawGroups = findMatches(board);
  
  // Check for holes (nulls)
  let hasHoles = false;
  for(let r=0; r<board.length; r++) {
    for(let c=0; c<board[0].length; c++) {
      if(board[r][c] === null) { hasHoles = true; break; }
    }
    if(hasHoles) break;
  }

  if(rawGroups.length===0 && !hasHoles){
    phases.push({type:'nomatch', board: deepClone(board)});
    return phases;
  }

  if(rawGroups.length > 0) {
    // Merge groups and detect T/L (cross) shapes and power-up creation
    // Map cell -> list of groups indices
    const rows = board.length; const cols = board[0].length;
    const cellMap = Array.from({length:rows}, ()=> Array(cols).fill(0).map(()=>[]));
    rawGroups.forEach((g, idx)=>{
      for(const p of g.cells) cellMap[p.r][p.c].push(idx);
    });

    const powerCreations = []; // {r,c,type}
    const toRemove = new Set();

    rawGroups.forEach((g, idx)=>{
      // if any cell is intersection of horiz & vert groups -> wrapped (T/L)
      let isCross = false;
      for(const p of g.cells){
        if(cellMap[p.r][p.c].length>1) { isCross = true; break; }
      }
      if(isCross){
        // find intersection cell (prefer one with >1 groups)
        let inter = g.cells.find(p=>cellMap[p.r][p.c].length>1) || g.cells[0];
        powerCreations.push({r:inter.r, c:inter.c, type:'wrapped'});
        // mark all cells in involved groups for removal except the creation cell
        const involved = new Set();
        for(const gi of cellMap[inter.r][inter.c]){
          for(const p of rawGroups[gi].cells) involved.add(`${p.r},${p.c}`);
        }
        for(const key of involved){ if(key!==`${inter.r},${inter.c}`) toRemove.add(key); }
        return;
      }

      if(g.len>=5){
        // color bomb: place at center
        const mid = g.cells[Math.floor(g.cells.length/2)];
        powerCreations.push({r:mid.r, c:mid.c, type:'colorbomb'});
        // remove others
        for(const p of g.cells){ if(!(p.r===mid.r && p.c===mid.c)) toRemove.add(`${p.r},${p.c}`); }
        return;
      }

      if(g.len===4){
        // create a striped for 4-in-a-row
        const pos = g.cells[0];
        powerCreations.push({r:pos.r, c:pos.c, type:'striped', orientation: g.orientation});
        for(const p of g.cells){ if(!(p.r===pos.r && p.c===pos.c)) toRemove.add(`${p.r},${p.c}`); }
        return;
      }

      // default length 3 -> remove all
      for(const p of g.cells) toRemove.add(`${p.r},${p.c}`);
    });

    // before removal: show match-found
    phases.push({type:'match-found', board: deepClone(board), groups: rawGroups, powerCreations});

    // apply removals
    for(const key of toRemove){ const [rr,cc]=key.split(',').map(Number); if(board[rr][cc]) board[rr][cc]=null; }

    // apply power creations (place power-ups on their cell, replacing tile)
    for(const pc of powerCreations){
      const existing = board[pc.r][pc.c];
      if(existing){ existing.p = pc.type; }
      else { board[pc.r][pc.c] = {v: getRandomTile(paletteSize).v, p: pc.type}; }
    }
    phases.push({type:'after-remove', board: deepClone(board), powerCreations});
  }

  applyGravity(board);
  phases.push({type:'after-gravity', board: deepClone(board)});
  refillBoard(board, paletteSize, luck);
  phases.push({type:'after-refill', board: deepClone(board)});
  return phases;
}

// Resolve all matches completely and return concatenated phases
export function resolveAllWithPhases(board, paletteSize){
  const all = [];
  while(true){
    const phases = resolveOnceWithPhases(board, paletteSize);
    // if first phase is nomatch -> done
    if(phases.length===1 && phases[0].type==='nomatch') break;
    all.push(...phases);
  }
  return all;
}

// Helper wrapper: modified resolveAllWithPhases to return phases AND removedCount
export function resolveAllWithPhases_returningDetail(board, paletteSize, luck = 0){
  const all = []; let totalRemoved = 0;
  let totalPowerActivations = 0;
  while(true){
    const result = resolveOnceWithPhases_returningDetail(board, paletteSize, luck);
    if(result.isNomatch) break;
    all.push(...result.phases);
    totalRemoved += result.removed;
    // count power creations/activations reported by the inner resolver
    if(result.powerActivations) totalPowerActivations += result.powerActivations;
  }
  return {phases: all, removedCount: totalRemoved, powerActivationsCount: totalPowerActivations};
}

// Helper to process removals with cascading power-up activations
function processRemovalsWithCascades(board, initialRemovals, phases) {
  const finalRemovals = new Set();
  const processQueue = Array.from(initialRemovals);
  const activatedPowers = new Set();
  let removedCount = 0;

  while(processQueue.length > 0){
    const key = processQueue.shift();
    if(finalRemovals.has(key)) continue;
    
    const [rr,cc] = key.split(',').map(Number);
    const tile = board[rr][cc];
    if(!tile) continue;

    finalRemovals.add(key);

    if(tile.p && !activatedPowers.has(key)){
      activatedPowers.add(key);
      let extra = new Set();
      if(tile.p === 'striped') extra = activateStriped(board, rr, cc, tile.orientation || 'h');
      else if(tile.p === 'wrapped') extra = activateWrapped(board, rr, cc);
      else if(tile.p === 'bomb') extra = activateBomb(board, rr, cc);
      else if(tile.p === 'hammer') extra = activateHammer(board, rr, cc);
      
      for(const ek of extra) if(!finalRemovals.has(ek)) processQueue.push(ek);
      
      phases.push({
        type: 'power-activated',
        power: tile.p,
        origin: {r:rr, c:cc},
        removals: Array.from(extra),
        board: deepClone(board)
      });
    }
  }

  for(const key of finalRemovals){ 
    const [rr,cc]=key.split(',').map(Number); 
    if(board[rr][cc]){ board[rr][cc]=null; removedCount++; } 
  }
  return removedCount;
}

// Update resolveOnceWithPhases to return removed count and phases (we keep both named variants)
function resolveOnceWithPhases_returningDetail(board, paletteSize, luck = 0){
  // reuse logic from resolveOnceWithPhases but return object
  const phases = [];
  const rawGroups = findMatches(board);
  
  // Check for holes (nulls) that might have been left by boosters
  let hasHoles = false;
  for(let r=0; r<board.length; r++) {
    for(let c=0; c<board[0].length; c++) {
      if(board[r][c] === null) { hasHoles = true; break; }
    }
    if(hasHoles) break;
  }

  if(rawGroups.length===0 && !hasHoles){ 
    return {isNomatch:true, phases:[{type:'nomatch', board: deepClone(board)}], removed:0}; 
  }

  const rows = board.length; const cols = board[0].length;
  let removedCount = 0;
  let powerActivations = 0;

  if(rawGroups.length > 0) {
    const cellMap = Array.from({length:rows}, ()=> Array(cols).fill(0).map(()=>[]));
    rawGroups.forEach((g, idx)=>{ for(const p of g.cells) cellMap[p.r][p.c].push(idx); });

    const powerCreations = [];
    const toRemove = new Set();

    rawGroups.forEach((g, idx)=>{
      let isCross = false;
      for(const p of g.cells) if(cellMap[p.r][p.c].length>1) { isCross=true; break; }
      if(isCross){
        let inter = g.cells.find(p=>cellMap[p.r][p.c].length>1) || g.cells[0];
        powerCreations.push({r:inter.r, c:inter.c, type:'wrapped'});
        const involved = new Set();
        for(const gi of cellMap[inter.r][inter.c]) for(const p of rawGroups[gi].cells) involved.add(`${p.r},${p.c}`);
        for(const key of involved) if(key!==`${inter.r},${inter.c}`) toRemove.add(key);
        return;
      }
      if(g.len>=5){
        const mid = g.cells[Math.floor(g.cells.length/2)];
        powerCreations.push({r:mid.r, c:mid.c, type:'colorbomb'});
        for(const p of g.cells) if(!(p.r===mid.r && p.c===mid.c)) toRemove.add(`${p.r},${p.c}`);
        return;
      }
      if(g.len===4){
        // create a striped for 4-in-a-row
        const pos = g.cells[0];
        powerCreations.push({r:pos.r, c:pos.c, type:'striped', orientation: g.orientation});
        for(const p of g.cells){ if(!(p.r===pos.r && p.c===pos.c)) toRemove.add(`${p.r},${p.c}`); }
        return;
      }
      for(const p of g.cells) toRemove.add(`${p.r},${p.c}`);
    });

    // debug: report groups
    try{ console.debug('resolveOnceWithPhases_returningDetail: rawGroups=', rawGroups.map(g=>({len:g.len, orientation:g.orientation}))); }catch(e){}
    phases.push({type:'match-found', board: deepClone(board), groups: rawGroups, powerCreations});
    
    // apply removals with cascades
    removedCount = processRemovalsWithCascades(board, toRemove, phases);
    
    // apply power creations
    for(const pc of powerCreations){ 
      const existing = board[pc.r][pc.c]; 
      if(existing){ existing.p = pc.type; } 
      else { board[pc.r][pc.c] = {v: getRandomTile(paletteSize).v, p: pc.type}; } 
    }
    powerActivations = powerCreations.length;
    phases.push({type:'after-remove', board: deepClone(board), powerCreations});
  }

  // gravity and refill
  applyGravity(board);
  phases.push({type:'after-gravity', board: deepClone(board)});
  const luckyPositions = refillBoard(board, paletteSize, luck);
  phases.push({type:'after-refill', board: deepClone(board), luckyPositions});

  return {phases, removed: removedCount, powerActivations};
}

// Handle a swap including power-up interactions and return {phases, removedCount}
export function handleSwapAndResolve(board, a, b, opts = {}){
  const phases = [];
  const paletteSize = opts.paletteSize || 8;
  const luck = opts.luck || 0;
  // swap first unless caller already swapped
  if(!opts.skipSwap){
    swapTiles(board, a, b);
  }
  phases.push({type:'after-swap', board: deepClone(board), swap:[a,b]});

  // check special combinations
  const ta = board[a.r][a.c];
  const tb = board[b.r][b.c];
  let totalRemoved = 0;
  let activationRemovals = new Set();
  let activationType = undefined;
  let activationOrigin = undefined;

  // same power-up combinations
  if(ta && tb && ta.p && tb.p && ta.p === tb.p){
    if(ta.p === 'striped'){
      // two striped -> mega striped: clear entire row and column
      activationType = 'mega-striped';
      activationOrigin = {r: Math.floor((a.r + b.r)/2), c: Math.floor((a.c + b.c)/2)};
      // clear row
      for(let c=0; c<board[0].length; c++) activationRemovals.add(`${a.r},${c}`);
      // clear column
      for(let r=0; r<board.length; r++) activationRemovals.add(`${r},${a.c}`);
    } else if(ta.p === 'wrapped'){
      // two wrapped -> mega wrapped: clear 5x5 area with wrapped effect
      activationType = 'mega-wrapped';
      activationOrigin = {r: Math.floor((a.r + b.r)/2), c: Math.floor((a.c + b.c)/2)};
      for(let dr=-2; dr<=2; dr++){
        for(let dc=-2; dc<=2; dc++){
          const nr = a.r + dr, nc = a.c + dc;
          if(nr>=0 && nr<board.length && nc>=0 && nc<board[0].length){
            activationRemovals.add(`${nr},${nc}`);
          }
        }
      }
    } else if(ta.p === 'colorbomb'){
      // two colorbombs -> rainbow bomb: clear entire board
      activationType = 'rainbow-bomb';
      activationOrigin = {r: Math.floor((a.r + b.r)/2), c: Math.floor((a.c + b.c)/2)};
      for(let r=0;r<board.length;r++) for(let c=0;c<board[0].length;c++) activationRemovals.add(`${r},${c}`);
    } else if(ta.p === 'hammer'){
      // two hammers -> mega hammer: clear 5x5 area
      activationType = 'mega-hammer';
      activationOrigin = {r: Math.floor((a.r + b.r)/2), c: Math.floor((a.c + b.c)/2)};
      for(let dr=-2; dr<=2; dr++){
        for(let dc=-2; dc<=2; dc++){
          const nr = a.r + dr, nc = a.c + dc;
          if(nr>=0 && nr<board.length && nc>=0 && nc<board[0].length) activationRemovals.add(`${nr},${nc}`);
        }
      }
    } else if(ta.p === 'bomb'){
      // two bombs -> nuclear bomb: clear 7x7 area
      activationType = 'nuclear-bomb';
      activationOrigin = {r: Math.floor((a.r + b.r)/2), c: Math.floor((a.c + b.c)/2)};
      for(let dr=-3; dr<=3; dr++){
        for(let dc=-3; dc<=3; dc++){
          const nr = a.r + dr, nc = a.c + dc;
          if(nr>=0 && nr<board.length && nc>=0 && nc<board[0].length) activationRemovals.add(`${nr},${nc}`);
        }
      }
    }
    activationRemovals.add(`${a.r},${a.c}`);
    activationRemovals.add(`${b.r},${b.c}`);
  } else if ((ta && ta.p === 'bomb' && tb && tb.p === 'striped') || (ta && ta.p === 'striped' && tb && tb.p === 'bomb')) {
    // bomb + striped -> ultra-cross: clear 5 rows and 5 columns
    activationType = 'ultra-cross';
    activationOrigin = {r: Math.floor((a.r + b.r)/2), c: Math.floor((a.c + b.c)/2)};
    const origin = activationOrigin;
    for(let dr=-2; dr<=2; dr++){
      const r = origin.r + dr;
      if(r>=0 && r<board.length) for(let c=0; c<board[0].length; c++) activationRemovals.add(`${r},${c}`);
    }
    for(let dc=-2; dc<=2; dc++){
      const c = origin.c + dc;
      if(c>=0 && c<board[0].length) for(let r=0; r<board.length; r++) activationRemovals.add(`${r},${c}`);
    }
    activationRemovals.add(`${a.r},${a.c}`);
    activationRemovals.add(`${b.r},${b.c}`);
  } else if ((ta && ta.p === 'bomb' && tb && tb.p === 'wrapped') || (ta && ta.p === 'wrapped' && tb && tb.p === 'bomb')) {
    // bomb + wrapped -> super-nova: clear 7x7 area
    activationType = 'super-nova';
    activationOrigin = {r: Math.floor((a.r + b.r)/2), c: Math.floor((a.c + b.c)/2)};
    for(let dr=-3; dr<=3; dr++){
      for(let dc=-3; dc<=3; dc++){
        const nr = activationOrigin.r + dr, nc = activationOrigin.c + dc;
        if(nr>=0 && nr<board.length && nc>=0 && nc<board[0].length) activationRemovals.add(`${nr},${nc}`);
      }
    }
    activationRemovals.add(`${a.r},${a.c}`);
    activationRemovals.add(`${b.r},${b.c}`);
  } else if ((ta && ta.p === 'striped' && tb && tb.p === 'wrapped') || (ta && ta.p === 'wrapped' && tb && tb.p === 'striped')) {
    // striped + wrapped -> mega-cross: clear 3 rows and 3 columns
    activationType = 'mega-cross';
    activationOrigin = {r: Math.floor((a.r + b.r)/2), c: Math.floor((a.c + b.c)/2)};
    const origin = activationOrigin;
    // clear 3 rows
    for(let dr=-1; dr<=1; dr++){
      const r = origin.r + dr;
      if(r>=0 && r<board.length){
        for(let c=0; c<board[0].length; c++) activationRemovals.add(`${r},${c}`);
      }
    }
    // clear 3 columns
    for(let dc=-1; dc<=1; dc++){
      const c = origin.c + dc;
      if(c>=0 && c<board[0].length){
        for(let r=0; r<board.length; r++) activationRemovals.add(`${r},${c}`);
      }
    }
    activationRemovals.add(`${a.r},${a.c}`);
    activationRemovals.add(`${b.r},${b.c}`);
  } else if(ta && ta.p==='colorbomb' && tb){
    // colorbomb + X
    if(tb.p==='colorbomb'){
      // both colorbombs -> clear entire board
      for(let r=0;r<board.length;r++) for(let c=0;c<board[0].length;c++) activationRemovals.add(`${r},${c}`);
      activationRemovals.add(`${a.r},${a.c}`); activationRemovals.add(`${b.r},${b.c}`);
    } else if(tb.p==='striped' || tb.p==='wrapped'){
      // convert all tiles with value tb.v into that power and activate them
      const targetVal = tb.v;
      for(let r=0;r<board.length;r++){
        for(let c=0;c<board[0].length;c++){
          if(board[r][c] && board[r][c].v===targetVal){
            board[r][c].p = tb.p;
            // activate immediately and collect removals
            if(tb.p==='striped'){
              const rem = activateStriped(board, r, c, tb.orientation||'h');
              for(const k of rem) activationRemovals.add(k);
            } else if(tb.p==='wrapped'){
              const rem = activateWrapped(board, r, c);
              for(const k of rem) activationRemovals.add(k);
            }
          }
        }
      }
      activationRemovals.add(`${a.r},${a.c}`);
    } else {
      // colorbomb + normal tile -> remove all of that color
      const rem = activateColorBomb(board, tb.v);
      activationRemovals = new Set([...activationRemovals, ...rem]);
      activationRemovals.add(`${a.r},${a.c}`);
      activationRemovals.add(`${b.r},${b.c}`);
    }
  } else if(tb && tb.p==='colorbomb' && ta){
    // symmetric cases for tb being colorbomb
    if(ta.p==='colorbomb'){
      for(let r=0;r<board.length;r++) for(let c=0;c<board[0].length;c++) activationRemovals.add(`${r},${c}`);
      activationRemovals.add(`${a.r},${a.c}`); activationRemovals.add(`${b.r},${b.c}`);
    } else if(ta.p==='striped' || ta.p==='wrapped'){
      const targetVal = ta.v;
      for(let r=0;r<board.length;r++){
        for(let c=0;c<board[0].length;c++){
          if(board[r][c] && board[r][c].v===targetVal){
            board[r][c].p = ta.p;
            if(ta.p==='striped'){
              const rem = activateStriped(board, r, c, ta.orientation||'h');
              for(const k of rem) activationRemovals.add(k);
            } else if(ta.p==='wrapped'){
              const rem = activateWrapped(board, r, c);
              for(const k of rem) activationRemovals.add(k);
            }
          }
        }
      }
      activationRemovals.add(`${a.r},${a.c}`);
      activationRemovals.add(`${b.r},${b.c}`);
    } else {
      const rem = activateColorBomb(board, ta.v);
      activationRemovals = new Set([...activationRemovals, ...rem]);
      activationRemovals.add(`${a.r},${a.c}`);
      activationRemovals.add(`${b.r},${b.c}`);
    }
  } else if ((ta && ta.p === 'hammer' && tb) || (tb && tb.p === 'hammer' && ta)) {
    // hammer + X -> destroy 3x3 area around the swap
    activationType = 'hammer-explode';
    activationOrigin = (ta && ta.p === 'hammer') ? a : b;
    const origin = activationOrigin;
    for(let dr=-1; dr<=1; dr++){
      for(let dc=-1; dc<=1; dc++){
        const nr = origin.r + dr, nc = origin.c + dc;
        if(nr>=0 && nr<board.length && nc>=0 && nc<board[0].length){
          activationRemovals.add(`${nr},${nc}`);
        }
      }
    }
    activationRemovals.add(`${a.r},${a.c}`);
    activationRemovals.add(`${b.r},${b.c}`);
  } else if ((ta && ta.p === 'bomb' && tb) || (tb && tb.p === 'bomb' && ta)) {
    // bomb + X -> massive 5x5 explosion
    activationType = 'mega-bomb';
    activationOrigin = (ta && ta.p === 'bomb') ? a : b;
    const origin = activationOrigin;
    for(let dr=-2; dr<=2; dr++){
      for(let dc=-2; dc<=2; dc++){
        const nr = origin.r + dr, nc = origin.c + dc;
        if(nr>=0 && nr<board.length && nc>=0 && nc<board[0].length){
          activationRemovals.add(`${nr},${nc}`);
        }
      }
    }
    activationRemovals.add(`${a.r},${a.c}`);
    activationRemovals.add(`${b.r},${b.c}`);
  } else {
    // single power activation: if swapped into a tile
    if(ta && ta.p==='striped'){
      const rem = activateStriped(board, a.r, a.c, ta.orientation||'h');
      activationRemovals = new Set([...activationRemovals, ...rem]);
      activationRemovals.add(`${a.r},${a.c}`);
      activationOrigin = {r:a.r, c:a.c}; activationType = 'striped';
    }
    if(ta && ta.p==='bomb'){
      const rem = activateBomb(board, a.r, a.c);
      activationRemovals = new Set([...activationRemovals, ...rem]);
      activationRemovals.add(`${a.r},${a.c}`);
      // record origin for UI
      activationOrigin = {r:a.r, c:a.c}; activationType = 'bomb';
    }
    if(ta && ta.p==='hammer'){
      const rem = activateHammer(board, a.r, a.c);
      activationRemovals = new Set([...activationRemovals, ...rem]);
      activationRemovals.add(`${a.r},${a.c}`);
      // record origin for UI
      activationOrigin = {r:a.r, c:a.c}; activationType = 'hammer';
    }
    if(tb && tb.p==='striped'){
      const rem = activateStriped(board, b.r, b.c, tb.orientation||'h');
      activationRemovals = new Set([...activationRemovals, ...rem]);
      activationRemovals.add(`${b.r},${b.c}`);
      activationOrigin = {r:b.r, c:b.c}; activationType = 'striped';
    }
    if(tb && tb.p==='bomb'){
      const rem = activateBomb(board, b.r, b.c);
      activationRemovals = new Set([...activationRemovals, ...rem]);
      activationRemovals.add(`${b.r},${b.c}`);
      activationOrigin = {r:b.r, c:b.c}; activationType = 'bomb';
    }
    if(tb && tb.p==='hammer'){
      const rem = activateHammer(board, b.r, b.c);
      activationRemovals = new Set([...activationRemovals, ...rem]);
      activationRemovals.add(`${b.r},${b.c}`);
      activationOrigin = {r:b.r, c:b.c}; activationType = 'hammer';
    }
    if(ta && ta.p==='wrapped'){
      const rem = activateWrapped(board, a.r, a.c);
      activationRemovals = new Set([...activationRemovals, ...rem]);
      activationRemovals.add(`${a.r},${a.c}`);
      activationOrigin = {r:a.r, c:a.c}; activationType = 'wrapped';
    }
    if(tb && tb.p==='wrapped'){
      const rem = activateWrapped(board, b.r, b.c);
      activationRemovals = new Set([...activationRemovals, ...rem]);
      activationRemovals.add(`${b.r},${b.c}`);
      activationOrigin = {r:b.r, c:b.c}; activationType = 'wrapped';
    }
  }

  let powerActivatedCount = 0;
  if(activationRemovals.size>0){
    // apply activations with cascades
    const removedNow = processRemovalsWithCascades(board, activationRemovals, phases);
    totalRemoved += removedNow;
    powerActivatedCount += 1;
    // Note: processRemovalsWithCascades already adds 'power-activated' phases
  }

  // after activations, resolve normal matches and cascading, collecting phases
  let resolvedDetail;
  try{
    resolvedDetail = resolveAllWithPhases_returningDetail(board, paletteSize, luck);
    phases.push(...resolvedDetail.phases);
    totalRemoved += (resolvedDetail.removedCount || 0);
    const createdPowers = (resolvedDetail && (resolvedDetail.powerActivationsCount || resolvedDetail.powerActivations)) || 0;
    powerActivatedCount += createdPowers;
  }catch(err){
    console.warn('detailed resolver failed, falling back', err);
    const fallbackPhases = resolveAllWithPhases(board, paletteSize, luck);
    phases.push(...fallbackPhases);
    const removedSet = new Set();
    for(const p of fallbackPhases){
      if(p.type==='match-found' && p.groups){
        for(const g of p.groups){ for(const cell of g.cells) removedSet.add(`${cell.r},${cell.c}`); }
        if(p.powerCreations){ for(const pc of p.powerCreations){ removedSet.delete(`${pc.r},${pc.c}`); } }
      }
    }
    totalRemoved += removedSet.size;
  }

  // scoring
  const POINTS_PER_TILE = 15; // Increased from 10
  const POWER_BONUS = 100;    // Increased from 50
  
  // Count how many match-found phases we have (cascades)
  const cascadeCount = phases.filter(p => p.type === 'match-found').length;
  const comboMultiplier = 1 + (cascadeCount * 0.8); // Increased from 0.5 (+80% per cascade)
  
  // Speed multiplier from UI (rewards rapid correct moves)
  const speedMultiplier = opts.speedMultiplier || 1;
  
  const base = totalRemoved * POINTS_PER_TILE;
  const powerBonus = powerActivatedCount * POWER_BONUS;
  const score = Math.floor((base + powerBonus) * comboMultiplier * speedMultiplier);

  return {phases, removedCount: totalRemoved, score};
}
