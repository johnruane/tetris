import React from 'react';

export default class Board extends React.Component {
  render() {
    const { board } = this.props;
    return (
      <>
        {board.map((boardRow, i) => (
          <div key={`row-${i}`} className='row'>
            {boardRow.map((cell, j) => (
              <div key={`cell-${i}${j}`} className='cell' data-value={cell}></div>
            ))}
          </div>
        ))}
      </>
    );
  }
}
