import {
  convertScore,
  addTetrominoToBoard,
  cloneArray,
  compareBoards,
  rotateMatrix,
} from '../helpers';
import {
  testBoard1,
  resultBoard1,
  resultBoard2,
  resultBoard3,
  resultBoard4,
  fixBoard1,
  fixBoard2,
  m1,
  m2,
  m3,
  m1Rotated,
  m2Rotated,
  m3Rotated,
} from './testBoards';
import { tetrominos } from '../matrices';

describe('Helpers Test Suite', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });
  it.each`
    score        | multiplier | output
    ${'0000000'} | ${1}       | ${'0000100'}
    ${'0000000'} | ${2}       | ${'0000400'}
    ${'0000000'} | ${4}       | ${'0001600'}
    ${'0000400'} | ${2}       | ${'0000800'}
    ${'0000850'} | ${4}       | ${'0002450'}
  `(
    'should return string score updated with 100 * multiplier and padded with zeros',
    ({ score, multiplier, output }) => {
      const result = convertScore(score, multiplier);
      expect(result).toBe(output);
    }
  );

  it.each`
    board                     | tetromino               | r    | c    | output
    ${cloneArray(testBoard1)} | ${tetrominos[0].matrix} | ${2} | ${3} | ${resultBoard1}
    ${cloneArray(testBoard1)} | ${tetrominos[4].matrix} | ${4} | ${1} | ${resultBoard2}
    ${cloneArray(testBoard1)} | ${tetrominos[6].matrix} | ${2} | ${5} | ${resultBoard3}
    ${cloneArray(testBoard1)} | ${tetrominos[2].matrix} | ${1} | ${5} | ${resultBoard4}
  `(
    'should add tetromino to board at specified position',
    ({ board, tetromino, r, c, output }) => {
      expect(JSON.stringify(addTetrominoToBoard(board, tetromino, r, c))).toEqual(
        JSON.stringify(output)
      );
    }
  );

  it.each`
    board        | newBoard        | output
    ${fixBoard1} | ${testBoard1}   | ${true}
    ${fixBoard1} | ${resultBoard3} | ${true}
    ${fixBoard1} | ${resultBoard1} | ${false}
    ${fixBoard2} | ${resultBoard4} | ${true}
    ${fixBoard2} | ${resultBoard2} | ${false}
  `(
    'should return true if newBoard does not occupy same cells as board',
    ({ board, newBoard, output }) => {
      expect(compareBoards(board, newBoard)).toBe(output);
    }
  );

  it.each`
    matrix | output
    ${m1}  | ${m1Rotated}
    ${m2}  | ${m2Rotated}
    ${m3}  | ${m3Rotated}
  `('should return rotated version of provided matrix', ({ matrix, output }) => {
    expect(JSON.stringify(rotateMatrix(matrix))).toBe(JSON.stringify(output));
  });
});
