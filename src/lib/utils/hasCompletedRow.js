export const hasCompletedRow = (board) => {
  let winningRowsFound = 0;
  let didFindWinningRow = false;

  /* We remove and add rows on a clone of the board. This is because we want to animate
   * the cells in the row. If the board gets updated whilst the animation is in progress
   * then the animations will be on the wrong rows and mess up the board.
   */
  const cloneBoard = cloneArray(board);

  for (let i = row; i >= 0; i--) {
    if (cloneBoard[i].every((row) => row < 0)) {
      cloneBoard.splice(i, 1); // remove complete row from board
      cloneBoard.unshift([-1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -1]); // add new row to board start

      winningRowsFound += 1;
      didFindWinningRow = true;
      i++; // put the index back 1 as the rows have shifted down
    }
  }
};
