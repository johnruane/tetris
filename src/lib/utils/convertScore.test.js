import { convertScore } from './convertScore';

describe('convertScore Test Suite', () => {
  it.each`
    score       | multiplier | output
    ${'000000'} | ${1}       | ${'0000100'}
    ${'000000'} | ${2}       | ${'0000400'}
    ${'000000'} | ${4}       | ${'0001600'}
    ${'000400'} | ${2}       | ${'0000800'}
    ${'000850'} | ${4}       | ${'0002450'}
  `(
    'should return string score updated with 100 * multiplier and padded with zeros',
    ({ score, multiplier, output }) => {
      const result = convertScore(score, multiplier);
      expect(result).toBe(output);
    }
  );
});
