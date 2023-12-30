import { removeRowsFromBoard } from './removeRowsFromBoard';

describe('removeRowsFromBoard Test Suite', () => {
  it.each`
    board                                | indexes      | output
    ${[[0, 1, 0], [0, 0, 0], [0, 0, 0]]} | ${[0]}       | ${[[0, 0, 0], [0, 0, 0], [0, 0, 0]]}
    ${[[0, 1, 0], [0, 0, 0], [0, 0, 0]]} | ${[1]}       | ${[[0, 0, 0], [0, 1, 0], [0, 0, 0]]}
    ${[[1, 1, 1], [1, 1, 1], [1, 1, 1]]} | ${[0, 1]}    | ${[[0, 0, 0], [0, 0, 0], [1, 1, 1]]}
    ${[[1, 1, 1], [1, 1, 1], [1, 1, 1]]} | ${[2]}       | ${[[0, 0, 0], [1, 1, 1], [1, 1, 1]]}
    ${[[0, 1, 0], [1, 1, 1], [1, 1, 1]]} | ${[1, 2]}    | ${[[0, 0, 0], [0, 0, 0], [0, 1, 0]]}
    ${[[1, 1, 1], [1, 1, 1], [1, 1, 1]]} | ${[1]}       | ${[[0, 0, 0], [1, 1, 1], [1, 1, 1]]}
    ${[[1, 1, 1], [1, 1, 1], [1, 1, 1]]} | ${null}      | ${[[1, 1, 1], [1, 1, 1], [1, 1, 1]]}
    ${[[1, 1, 1], [1, 1, 1], [1, 1, 1]]} | ${undefined} | ${[[1, 1, 1], [1, 1, 1], [1, 1, 1]]}
    ${[[1, 1, 1], [1, 1, 1], [1, 1, 1]]} | ${[]}        | ${[[1, 1, 1], [1, 1, 1], [1, 1, 1]]}
  `(
    'should return board with complete rows removed and new rows added to the top',
    ({ board, indexes, output }) => {
      expect(JSON.stringify(removeRowsFromBoard(board, indexes))).toBe(
        JSON.stringify(output)
      );
    }
  );
});
