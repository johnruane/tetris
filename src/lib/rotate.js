const rotateMatrix = matrix => {
  let newMatrix = [];
  const matrixLength = matrix.length-1;

  for(let i=0;i<=matrixLength;i++) {
    let row = [];
    for(let j=0;j<=matrixLength;j++) {
      row.push(matrix[matrixLength - j][i]);
    }
    newMatrix.push(row);
  }
  return newMatrix;
}

export default rotateMatrix;