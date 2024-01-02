import React from 'react';
import Board from './Board';

const Next = ({ nextTetromino, gameOver }) => {
  return (
    <div className='next'>
      {gameOver ? (
        <p className='notification'>Game Over</p>
      ) : (
        <div className='data-wrapper'>
          <p className='data-title next-label'>Next</p>
          <div className='tetromino-board'>
            <Board board={nextTetromino} />
          </div>
        </div>
      )}
    </div>
  );
};

export default Next;
