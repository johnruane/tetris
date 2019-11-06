import React from 'react';
import ReactDOM from 'react-dom';
import Piece from './piece.js';
import './index.css';

export default class Tetris extends React.Component {
  render() {
    return (
      <div className="App">
        <Piece pieceMatrix={[[0,0,0],[0,1,0],[1,1,1]]} />
        <Piece pieceMatrix={[[0,0,0],[1,0,0],[1,1,1]]} />
        <Piece pieceMatrix={[[0,0,0],[0,1,1],[1,1,0]]} />
      </div>
    );
  }
}

ReactDOM.render(<Tetris />, document.getElementById('root'));
