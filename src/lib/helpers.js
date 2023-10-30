/*
 * @param {string} $str - score
 * @param {number} $m - multiplier
 * creates a string score with the correct zero padding
 */
export function convertScore(score, m) {
  let s = parseInt(parseInt(score));
  let pad = '0000000';
  s = (s + 100 * m * m).toString();
  return pad.concat(s).substr(s.length);
}

/*
 * @param {array}
 * bad method for deep copy of board array
 */
export function cloneArray(array) {
  const strArray = JSON.stringify(array);
  return JSON.parse(strArray);
}

/*
 * adds a new piece (minus the zeros) to a board at position provided
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
 * takes 2 boards and returns false if an active piece on the newBoard is on
 * a negative piece on the currentBoard - piece can't move
 */
export function compareBoards(currentBoard, newBoard) {
  let canMove = true;
  const row = currentBoard.length - 1;
  const column = currentBoard[0].length - 1;
  for (let i = 0; i <= row; i++) {
    for (let j = 0; j <= column; j++) {
      if (newBoard[i][j] > 0) {
        if (currentBoard[i][j] < 0) {
          canMove = false;
        }
      }
    }
  }
  return canMove;
}
