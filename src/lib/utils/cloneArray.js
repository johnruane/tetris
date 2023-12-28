/**
 * Deep clones array
 *
 * @return {Array} Array copy
 */
export function cloneArray(array) {
  const strArray = JSON.stringify(array);
  return JSON.parse(strArray);
}
