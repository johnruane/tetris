/**
 * Creates a string score with the correct zero padding.
 * Multiplier is applied twice to create a bigger return score
 *
 * Example: 100 * 2 * 2 = 400
 * Example: 100 * 4 * 4 = 1600
 *
 * @param {String} score
 * @param {Number} m Multiplier
 * @return {String} Updated @score padded with zeros
 */
export function convertScore(score, m) {
  const s = parseInt(score) + 100 * m * m;
  return s.toString().padStart(7, '0');
}
