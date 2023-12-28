/**
 * Takes @matrix and rotates the rows
 *
 * @param {Number[][]} matrix
 * @return {Number[][]} Rotated @matrix
 */
export function rotateMatrix(tetromino) {
  if (tetromino.value === 8) return tetromino.matrix;

  let newMatrix = [];
  const matrixLength = tetromino.matrix.length - 1;

  for (let i = 0; i <= matrixLength; i++) {
    let row = [];
    for (let j = 0; j <= matrixLength; j++) {
      row.push(tetromino.matrix[matrixLength - j][i]);
    }
    newMatrix.push(row);
  }
  return newMatrix;
}
