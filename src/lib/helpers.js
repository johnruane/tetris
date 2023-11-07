/**
 * Creates a string score with the correct zero padding.
 * Multiplier is applied twice to create a bigger return score
 *
 * Example: 100 * 2 * 2 = 400
 * Example: 100 * 4 * 4 = 1600
 *
 * @param {String} score
 * @param {Number} m Multiplier
 * @return {String} Updated @score padded with zeros
 */
export function convertScore(score, m) {
  const s = parseInt(score) + 100 * m * m;
  return s.toString().padStart(7, '0');
}

/**
 * Deep clones array
 *
 * @return {Array} Array copy
 */
export function cloneArray(array) {
  const strArray = JSON.stringify(array);
  return JSON.parse(strArray);
}

/**
 * Adds @tetromino to @board at specified @r & @c
 * @r & @c refer to the top left corner of the @tetromino
 * @tetromino cells that are positioned outside the bounds of @board are ignored
 * Only positive @tetromino values are added to @board, zeros are ignored
 *
 * @param {Number[][]} board
 * @param {{matrix: Number[][], value: Number}} tetromino Requires @tetromino.matrix
 * @param {Number} r Row
 * @param {Number} c Column
 * @return {Number[][]} New board with @tetromino added
 */
export function addTetrominoToBoard(board, tetromino, r, c) {
  tetromino.forEach((row, i) => {
    row.forEach((cell, j) => {
      if (cell > 0 && r + i < board.length && c + j < board[0].length) {
        board[r + i][c + j] = cell;
      }
    });
  });

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
