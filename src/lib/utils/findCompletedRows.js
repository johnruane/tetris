/**
 * Takes @board and returns an array of indexes in the board that have complete rows.
 *
 * @param {Number[][]} matrix
 * @return {Number[]} indexes of complete rows
 */

export const findCompletedRows = (board) => {
  let completeRows = [];

  for (let i = board.length - 1; i >= 0; i--) {
    if (board[i].every((row) => row !== 0)) {
      completeRows.push(i);
    }
  }
  return completeRows;
};
