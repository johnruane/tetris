import { canTetrominoMoveToPosition } from './canTetrominoMoveToPosition';
import { t1, t2, t4, t5 } from './__test__/testUtils';

describe('canTetrominoMoveToPosition Test Suite', () => {
  it.each`
    position          | tetro        | board                                | output
    ${{ r: 0, c: 0 }} | ${t1.matrix} | ${[[0, 0, 0], [0, 0, 0], [0, 0, 0]]} | ${true}
    ${{ r: 0, c: 0 }} | ${t1.matrix} | ${[[1, 0, 0], [0, 0, 0], [0, 0, 0]]} | ${false}
    ${{ r: 2, c: 2 }} | ${t1.matrix} | ${[[0, 0, 0], [0, 0, 0], [0, 0, 0]]} | ${true}
    ${{ r: 2, c: 2 }} | ${t2.matrix} | ${[[0, 0, 0], [0, 0, 0], [0, 0, 0]]} | ${false}
    ${{ r: 0, c: 0 }} | ${t4.matrix} | ${[[0, 0, 0], [1, 1, 0], [0, 0, 0]]} | ${false}
    ${{ r: 0, c: 0 }} | ${t5.matrix} | ${[[0, 1, 0], [1, 0, 0], [0, 0, 0]]} | ${true}
    ${{ r: 2, c: 2 }} | ${t5.matrix} | ${[[0, 0, 0], [0, 0, 0], [0, 0, 0]]} | ${false}
  `(
    'should return true if board does not have any negative numbers in any position where the tetro matrix has a positive number',
    ({ position, tetro, board, output }) => {
      expect(canTetrominoMoveToPosition(position, tetro, board)).toBe(output);
    }
  );
});
