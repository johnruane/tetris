import { findCompletedRows } from './findCompletedRows';

describe('findCompletedRows Test Suite', () => {
  it.each`
    board                                | output
    ${[[0, 0, 0], [0, 0, 0], [0, 0, 0]]} | ${[]}
    ${[[0, 1, 0], [0, 1, 0], [0, 1, 0]]} | ${[]}
    ${[[0, 0, 0], [0, 0, 0], [1, 1, 1]]} | ${[2]}
    ${[[0, 0, 0], [1, 1, 1], [0, 0, 0]]} | ${[1]}
    ${[[1, 1, 1], [0, 0, 0], [0, 1, 0]]} | ${[0]}
    ${[[1, 1, 1], [0, 0, 0], [1, 1, 1]]} | ${[2, 0]}
    ${[[1, 1, 1], [1, 1, 1], [1, 1, 1]]} | ${[2, 1, 0]}
  `('should return the index of every complete row in board', ({ board, output }) => {
    expect(JSON.stringify(findCompletedRows(board))).toBe(JSON.stringify(output));
  });
});
