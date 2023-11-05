/*
 * Creates a string score with the correct zero padding
 */
export function convertScore(score, m) {
  let s = parseInt(parseInt(score));
  let pad = '0000000';
  s = (s + 100 * m * m).toString();
  return pad.concat(s).substr(s.length);
}

/*
 * Deep copy of board array
 */
export function cloneArray(array) {
  const strArray = JSON.stringify(array);
  return JSON.parse(strArray);
}

/*
 * Adds a new piece (minus the zeros) to a board at position provided
 */
export function addTetrominoToBoard(board, tetromino, r, c) {
  const length = tetromino.length - 1;
  for (let i = 0; i <= length; i++) {
    for (let j = 0; j <= length; j++) {
      if (tetromino[i][j] > 0) {
        board[r + i][c + j] = tetromino[i][j];
      }
    }
  }
  return board;
}

/*
 * Takes 2 boards and returns false if an active piece on the newBoard is on
 * a negative piece on the currentBoard - piece can't move
 */
export function compareBoards(board, newBoard) {
  let canMove = true;
  for (let i = 0, rLen = board.length - 1; i <= rLen; i++) {
    for (let j = 0, cLen = board[0].length - 1; j <= cLen; j++) {
      if (newBoard[i][j] > 0) {
        if (board[i][j] < 0) {
          canMove = false;
        }
      }
    }
  }
  return canMove;
}
