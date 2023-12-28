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
 * Takes @tetro matrix and negates ONLY positive integers
 *
 * @param {Number[][]} tetro
 * @return {Number[][]} tetro negated
 */
export function negateTetromino(tetro) {
  return tetro.map((row) =>
    row.map((value) => (Number.isInteger(value) && value > 0 ? -value : value))
  );
}
