import { compareBoards, negateTetromino } from '../helpers';
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
  m1Negated,
  m2Negated,
} from './testBoards';

describe('Helpers Test Suite', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

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
    tetro | output
    ${m1} | ${m1Negated}
    ${m2} | ${m2Negated}
  `('should return tetro matrix with positive integers negated', ({ tetro, output }) => {
    expect(JSON.stringify(negateTetromino(tetro))).toBe(JSON.stringify(output));
  });
});
