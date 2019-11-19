/*
* @param {string} $str - score
* @param {number} $m - multiplier
* creates a string score with the correct zero padding
*/
export function convertScore(score, m) {
  let s = parseInt(parseInt(score));
  let pad = '0000000';
  s = (s + (100 * m) * m).toString();
  return (pad.concat(s)).substr(s.length);
}

/*
* @param {array}
* bad method for deep copy of board array
*/
export function cloneArray(array) {
  const strArray = JSON.stringify(array);
  return JSON.parse(strArray);
}