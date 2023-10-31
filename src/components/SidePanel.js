import React from 'react';
import Board from './Board';

export default class SidePanel extends React.Component {
  render() {
    const { score, level, lines, nextTetromino, gameStatus } = this.props;
    return (
      <>
        <div className='score data-wrapper shadow'>
          <p className='data-title'>Score</p>
          <p className='data-value'>{score}</p>
        </div>
        <div className='level data-wrapper shadow'>
          <p className='data-title'>Level</p>
          <p className='data-value'>{level}</p>
        </div>
        <div className='lines data-wrapper shadow'>
          <p className='data-title'>Lines</p>
          <p className='data-value'>{lines}</p>
        </div>
        <div className='next data-wrapper next-board'>
          <p className='data-title next-label'>Next</p>
          <div className='tetromino-board'>
            <Board board={nextTetromino} />
          </div>
        </div>
        <p className='notification'>{gameStatus}</p>
      </>
    );
  }
}
