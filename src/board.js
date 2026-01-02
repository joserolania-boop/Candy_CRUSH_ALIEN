// Board utilities: tile palette, board state creation and helpers
// Uniform palette: each symbol appears once to keep equal frequency
const PALETTE = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

function makeTile(value, power=null){
  return {v: value, p: power};
}

function randInt(n){ return Math.floor(Math.random()*n); }

export function getRandomTile(paletteSize = PALETTE.length){
  const size = Math.max(3, Math.min(paletteSize, PALETTE.length));
  return makeTile(PALETTE[randInt(size)]);
}

export function cloneBoard(board){
  return board.map(row => row.map(cell => cell ? {v:cell.v, p:cell.p} : null));
}

// Create board ensuring no immediate matches of 3 at start
export function createBoardState(cols=9, rows=9, paletteSize = PALETTE.length){
  const board = Array.from({length:rows}, ()=> Array(cols).fill(null));
  for(let r=0;r<rows;r++){
    for(let c=0;c<cols;c++){
      let tile;
      let attempts=0;
      do{
        tile = getRandomTile(paletteSize);
        attempts++;
        // safety break
        if(attempts>20) break;
      }while(c>=2 && board[r][c-1] && board[r][c-2] && board[r][c-1].v===tile.v && board[r][c-2].v===tile.v
             || r>=2 && board[r-1][c] && board[r-2][c] && board[r-1][c].v===tile.v && board[r-2][c].v===tile.v);
      board[r][c]=tile;
    }
  }
  return board;
}

export const DEFAULT_COLS = 9;
export const DEFAULT_ROWS = 9;
