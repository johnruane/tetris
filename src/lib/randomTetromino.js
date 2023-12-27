import { tetrominos } from './matrices.js';

export const getRandomTetromino = () => {
  const tetro = tetrominos[Math.floor(Math.random() * Math.floor(tetrominos.length))];
  return { matrix: tetro.matrix, value: tetro.value };
};
