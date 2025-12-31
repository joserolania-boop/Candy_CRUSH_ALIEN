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

// Activate bomb: remove the bomb cell plus up to 6 surrounding tiles (prioritize orthogonals then diagonals)
function activateBomb(board, r, c){
  const rows = board.length; const cols = board[0].length;
  const removed = new Set();
  // include the bomb's own cell
  if(r>=0 && r<rows && c>=0 && c<cols && board[r][c]) removed.add(`${r},${c}`);
  const neighbors = [[-1,0],[1,0],[0,-1],[0,1],[-1,-1],[-1,1],[1,-1],[1,1]];
  let count = 0;
  for(const [dr,dc] of neighbors){
    if(count>=6) break;
    const rr = r+dr, cc = c+dc;
    if(rr>=0 && rr<rows && cc>=0 && cc<cols && board[rr][cc]){ removed.add(`${rr},${cc}`); count++; }
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

// Handle a swap including power-up interactions and return {phases, removedCount}
export function handleSwapAndResolve(board, a, b, opts = {}){
  const phases = [];
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

  // colorbomb combos
  if(ta && ta.p==='colorbomb' && tb){
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
      activationRemovals.add(`${b.r},${b.c}`);
    } else {
      const rem = activateColorBomb(board, ta.v);
      activationRemovals = new Set([...activationRemovals, ...rem]);
      activationRemovals.add(`${b.r},${b.c}`);
    }
  } else {
    // single power activation: if swapped into a tile
    if(ta && ta.p==='striped'){
      const rem = activateStriped(board, a.r, a.c, ta.orientation||'h');
      activationRemovals = new Set([...activationRemovals, ...rem]);
      activationRemovals.add(`${a.r},${a.c}`);
    }
    if(ta && ta.p==='bomb'){
      const rem = activateBomb(board, a.r, a.c);
      activationRemovals = new Set([...activationRemovals, ...rem]);
      activationRemovals.add(`${a.r},${a.c}`);
      // record origin for UI
      activationOrigin = {r:a.r, c:a.c}; activationType = 'bomb';
    }
    if(tb && tb.p==='striped'){
      const rem = activateStriped(board, b.r, b.c, tb.orientation||'h');
      activationRemovals = new Set([...activationRemovals, ...rem]);
      activationRemovals.add(`${b.r},${b.c}`);
    }
    if(tb && tb.p==='bomb'){
      const rem = activateBomb(board, b.r, b.c);
      activationRemovals = new Set([...activationRemovals, ...rem]);
      activationRemovals.add(`${b.r},${b.c}`);
      activationOrigin = {r:b.r, c:b.c}; activationType = 'bomb';
    }
    if(ta && ta.p==='wrapped'){
      const rem = activateWrapped(board, a.r, a.c);
      activationRemovals = new Set([...activationRemovals, ...rem]);
      activationRemovals.add(`${a.r},${a.c}`);
    }
    if(tb && tb.p==='wrapped'){
      const rem = activateWrapped(board, b.r, b.c);
      activationRemovals = new Set([...activationRemovals, ...rem]);
      activationRemovals.add(`${b.r},${b.c}`);
    }
  }

  let powerActivatedCount = 0;
  if(activationRemovals.size>0){
    // apply activations
    const removedNow = applyRemovalSet(board, activationRemovals); totalRemoved += removedNow;
    powerActivatedCount += 1;
    const phase = {type:'power-activated', board: deepClone(board), removals:Array.from(activationRemovals)};
    if(typeof activationType !== 'undefined') phase.power = activationType;
    if(typeof activationOrigin !== 'undefined') phase.origin = activationOrigin;
    phases.push(phase);
  }

  // after activations, resolve normal matches and cascading, collecting phases
  // Prefer the detailed resolver that returns removed counts so scoring accounts for cascades.
  // If the detailed resolver fails for any reason, fall back to the simpler resolver and
  // compute removed counts from the returned phases.
  let resolvedDetail;
  try{
    resolvedDetail = resolveAllWithPhases_returningDetail(board);
    phases.push(...resolvedDetail.phases);
    totalRemoved += (resolvedDetail.removedCount || 0);
    // include any power creations/activations reported by the resolver in bonuses
    const createdPowers = (resolvedDetail && (resolvedDetail.powerActivationsCount || resolvedDetail.powerActivations)) || 0;
    powerActivatedCount += createdPowers;
  }catch(err){
    console.warn('detailed resolver failed, falling back', err);
    // fallback: use older resolver and infer removedCount from match-found groups
    const fallbackPhases = resolveAllWithPhases(board);
    phases.push(...fallbackPhases);
    // infer removed cells from 'match-found' phases
    const removedSet = new Set();
    for(const p of fallbackPhases){
      if(p.type==='match-found' && p.groups){
        for(const g of p.groups){ for(const cell of g.cells) removedSet.add(`${cell.r},${cell.c}`); }
        // if power creations exist, those creation cells are not removed
        if(p.powerCreations){ for(const pc of p.powerCreations){ removedSet.delete(`${pc.r},${pc.c}`); } }
      }
    }
    totalRemoved += removedSet.size;
  }

  // scoring: base points per tile removed + bonuses for power activations and combos
  const POINTS_PER_TILE = 60;
  const POWER_BONUS = 200; // per power activated
  const COMBO_BONUS = (powerActivatedCount >= 2) ? 500 : 0;
  const base = totalRemoved * POINTS_PER_TILE;
  const powerBonus = powerActivatedCount * POWER_BONUS;
  const score = base + powerBonus + COMBO_BONUS;

  return {phases, removedCount: totalRemoved, score};
}

// Helper wrapper: modified resolveAllWithPhases to return phases AND removedCount
export function resolveAllWithPhases_returningDetail(board){
  const all = []; let totalRemoved = 0;
  let totalPowerActivations = 0;
  while(true){
    const result = resolveOnceWithPhases_returningDetail(board);
    if(result.isNomatch) break;
    all.push(...result.phases);
    totalRemoved += result.removed;
    // count power creations/activations reported by the inner resolver
    if(result.powerActivations) totalPowerActivations += result.powerActivations;
  }
  return {phases: all, removedCount: totalRemoved, powerActivationsCount: totalPowerActivations};
}

// Update resolveOnceWithPhases to return removed count and phases (we keep both named variants)
function resolveOnceWithPhases_returningDetail(board){
  // reuse logic from resolveOnceWithPhases but return object
  const phases = [];
  const rawGroups = findMatches(board);
  if(rawGroups.length===0){ return {isNomatch:true, phases:[{type:'nomatch', board: deepClone(board)}], removed:0}; }

  const rows = board.length; const cols = board[0].length;
  const cellMap = Array.from({length:rows}, ()=> Array(cols).fill(0).map(()=>[]));
  rawGroups.forEach((g, idx)=>{ for(const p of g.cells) cellMap[p.r][p.c].push(idx); });

  const powerCreations = [];
  const toRemove = new Set();
  let powerActivations = 0;

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
      // immediate bomb explosion: remove the matched 4 plus the 4 orthogonal neighbors
      // choose center as middle cell for adjacency
      const center = g.cells[Math.floor(g.cells.length/2)];
      const adj = [[-1,0],[1,0],[0,-1],[0,1]];
      // mark matched cells for removal
      for(const p of g.cells) toRemove.add(`${p.r},${p.c}`);
      // add orthogonal neighbors (if in bounds) to a separate set to report as explosion removals
      const explosionAdds = new Set();
      for(const [dr,dc] of adj){
        const rr = center.r + dr, cc = center.c + dc;
        if(rr>=0 && rr<rows && cc>=0 && cc<cols){ explosionAdds.add(`${rr},${cc}`); }
      }
      // merge into toRemove
      for(const key of explosionAdds) toRemove.add(key);
      // annotate a special immediate bomb action as a pseudo-powerCreation so UI can animate
      powerCreations.push({r:center.r, c:center.c, type:'bomb-explode', removals:Array.from(explosionAdds)});
      return;
    }
    for(const p of g.cells) toRemove.add(`${p.r},${p.c}`);
  });

  // debug: report groups
  try{ console.debug('resolveOnceWithPhases_returningDetail: rawGroups=', rawGroups.map(g=>({len:g.len, orientation:g.orientation}))); }catch(e){}
  phases.push({type:'match-found', board: deepClone(board), groups: rawGroups, powerCreations});
  // If we created any immediate bomb-explode powerCreations, emit a dedicated 'bomb-explode' phase
  for(const pc of powerCreations){
    if(pc.type==='bomb-explode'){
      phases.push({type:'bomb-explode', board: deepClone(board), origin:{r:pc.r, c:pc.c}, removals: pc.removals || []});
    }
  }

  // count removals
  let removedCount = 0;
  for(const key of toRemove){ const [rr,cc]=key.split(',').map(Number); if(board[rr][cc]){ board[rr][cc]=null; removedCount++; } }
  for(const pc of powerCreations){ const existing = board[pc.r][pc.c]; if(existing){ existing.p = pc.type; } else { board[pc.r][pc.c] = {v: getRandomTile().v, p: pc.type}; } }
  powerActivations = powerCreations.length;

  phases.push({type:'after-remove', board: deepClone(board), powerCreations});
  applyGravity(board);
  phases.push({type:'after-gravity', board: deepClone(board)});
  refillBoard(board);
  phases.push({type:'after-refill', board: deepClone(board)});

  return {isNomatch:false, phases, removed: removedCount, powerActivations};
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

export function refillBoard(board){
  const rows = board.length; const cols = board[0].length;
  for(let r=0;r<rows;r++){
    for(let c=0;c<cols;c++){
      if(!board[r][c]) board[r][c] = getRandomTile();
    }
  }
}

// Resolve matches once and return phased snapshots for preview (swap already applied outside)
export function resolveOnceWithPhases(board){
  const phases = [];
  const rawGroups = findMatches(board);
  if(rawGroups.length===0){
    phases.push({type:'nomatch', board: deepClone(board)});
    return phases;
  }

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
      // create a bomb for 4-in-a-row
      const pos = g.cells[0];
      powerCreations.push({r:pos.r, c:pos.c, type:'bomb', orientation: g.orientation});
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
  let powerActivations = 0;
  for(const pc of powerCreations){
    const existing = board[pc.r][pc.c];
    if(existing){ existing.p = pc.type; }
    else { board[pc.r][pc.c] = {v: getRandomTile().v, p: pc.type}; }
    powerActivations++;
  }
  phases.push({type:'after-remove', board: deepClone(board), powerCreations});
  applyGravity(board);
  phases.push({type:'after-gravity', board: deepClone(board)});
  refillBoard(board);
  phases.push({type:'after-refill', board: deepClone(board)});
  return phases;
}

// Resolve all matches completely and return concatenated phases
export function resolveAllWithPhases(board){
  const all = [];
  while(true){
    const phases = resolveOnceWithPhases(board);
    // if first phase is nomatch -> done
    if(phases.length===1 && phases[0].type==='nomatch') break;
    all.push(...phases);
  }
  return all;
}
