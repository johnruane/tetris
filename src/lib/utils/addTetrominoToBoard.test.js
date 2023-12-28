import { addTetrominoToBoard } from './addTetrominoToBoard';
import { t1, t2, t3, t4 } from './__test__/testUtils';

describe('addTetrominoToBoard Test Suite', () => {
  it.each`
    board                                | tetromino    | r    | c    | output
    ${[[0, 0, 0], [0, 0, 0], [0, 0, 0]]} | ${t1.matrix} | ${0} | ${0} | ${[[1, 0, 0], [0, 0, 0], [0, 0, 0]]}
    ${[[0, 0, 0], [0, 0, 0], [0, 0, 0]]} | ${t1.matrix} | ${2} | ${2} | ${[[0, 0, 0], [0, 0, 0], [0, 0, 1]]}
    ${[[0, 0, 0], [0, 0, 0], [0, 0, 0]]} | ${t2.matrix} | ${0} | ${0} | ${[[0, 0, 0], [0, 1, 0], [0, 0, 0]]}
    ${[[0, 0, 0], [0, 0, 0], [0, 0, 0]]} | ${t2.matrix} | ${2} | ${2} | ${[[0, 0, 0], [0, 0, 0], [0, 0, 0]]}
    ${[[0, 0, 0], [0, 0, 0], [0, 0, 0]]} | ${t3.matrix} | ${1} | ${1} | ${[[0, 0, 0], [0, 0, 1], [0, 0, 1]]}
    ${[[0, 0, 0], [0, 0, 0], [0, 0, 0]]} | ${t3.matrix} | ${2} | ${1} | ${[[0, 0, 0], [0, 0, 0], [0, 0, 1]]}
    ${[[0, 0, 0], [0, 0, 0], [0, 0, 0]]} | ${t4.matrix} | ${1} | ${1} | ${[[0, 0, 0], [0, 0, 0], [0, 1, 1]]}
  `(
    'should add tetromino to board at specified position',
    ({ board, tetromino, r, c, output }) => {
      expect(JSON.stringify(addTetrominoToBoard(board, tetromino, r, c))).toEqual(
        JSON.stringify(output)
      );
    }
  );
});
