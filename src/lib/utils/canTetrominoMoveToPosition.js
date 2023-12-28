/**
 * Takes @position object, @tetro matrix and @board and returns false if an active piece in @tetro matrix is
 * in the same position as a NON zero position in @board.
 * Will also check that the poistion in the array is NOT 'undefined', which is valid since a tetromino can be placed
 * over the edge as long as the non-zero values remain within the @board
 *
 * @param {{r: number, c: number}} position
 * @param {Number[][]} tetro
 * @param {Number[][]} board
 * @return {Boolean} Tetromino can be moved to position on @board
 */
export function canTetrominoMoveToPosition(position, tetro, board) {
  for (let i = 0, rLen = tetro.length; i < rLen; i++) {
    for (let j = 0, cLen = tetro[0].length - 1; j <= cLen; j++) {
      const row = board[position.r + i];
      const col = row && row[position.c + j];

      if (tetro[i][j] > 0 && (row === undefined || col === undefined || col !== 0)) {
        return false;
      }
    }
  }
  return true;
}
