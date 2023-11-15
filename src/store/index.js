import { gameBoard } from '../lib/board.js';
import { tetrominos } from '../lib/matrices.js';
import { createSlice } from '@reduxjs/toolkit';

const getRandomTetromino = () => {
  const tetro = tetrominos[Math.floor(Math.random() * Math.floor(tetrominos.length))];
  return { matrix: tetro.matrix, value: tetro.value };
};

export const useBoardReducer = createSlice({
  name: 'boardReducer',
  initialState: {
    board: gameBoard,
    previousBoard: gameBoard,
    position: { row: 0, column: 4 },
    nextTetromino: getRandomTetromino(),
    activeTetromino: getRandomTetromino(),
  },
  reducers: {
    setBoard: (state, action) => {
      state.board = action.payload;
    },
    setPreviousBoard: (state, action) => {
      state.previousBoard = action.payload;
    },
    setPosition: (state, action) => {
      state.position = action.payload;
    },
    setNextTetromino: (state, action) => {
      state.nextTetromino = action.payload;
    },
    setActiveTetromino: (state, action) => {
      state.activeTetromino = action.payload;
    },
  },
});
