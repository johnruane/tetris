import React from 'react';

const Board = (board) => {
  return (
    <>
      {board?.map((boardRow, i) => (
        <div key={`row-${i}`} className='row'>
          {boardRow.map((cell, j) => (
            <div key={`cell-${i}${j}`} className='cell' data-value={cell}></div>
          ))}
        </div>
      ))}
    </>
  );
};

export default Board;
