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
      if (cell !== 0 && r + i < board.length && c + j < board[0].length) {
        board[r + i][c + j] = cell;
      }
    });
  });

  return board;
}
