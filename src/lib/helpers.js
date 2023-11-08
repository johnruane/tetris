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
 * @param {Number[][]} tetromino
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

/**
 * Takes @board and @newBoard and returns true if an active piece on @newBoard is
 * NOT on a negative piece on @board
 *
 * @param {Number[][]} board
 * @param {Number[][]} newBoard
 * @return {Boolean} Tetromino can be moved in new direction
 */
export function compareBoards(board, newBoard) {
  for (let i = 0, rLen = board.length - 1; i <= rLen; i++) {
    for (let j = 0, cLen = board[0].length - 1; j <= cLen; j++) {
      if (newBoard[i][j] > 0) {
        if (board[i][j] < 0) {
          return false;
        }
      }
    }
  }
  return true;
}

/**
 * Takes @matrix and rotates the rows
 *
 * @param {Number[][]} matrix
 * @return {Number[][]} Rotated @matrix
 */
export function rotateMatrix(matrix) {
  let newMatrix = [];
  const matrixLength = matrix.length - 1;

  for (let i = 0; i <= matrixLength; i++) {
    let row = [];
    for (let j = 0; j <= matrixLength; j++) {
      row.push(matrix[matrixLength - j][i]);
    }
    newMatrix.push(row);
  }
  return newMatrix;
}
