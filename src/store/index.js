import { gameBoard } from '../lib/board.js';
import { createSlice } from '@reduxjs/toolkit';

export const useBoardReducer = createSlice({
  name: 'boardReducer',
  initialState: {
    board: gameBoard,
  },
  reducers: {
    setBoard: (state, action) => {
      state.board = action.payload;
    },
  },
});
