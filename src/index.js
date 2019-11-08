import React from 'react';
import ReactDOM from 'react-dom';
import GamePiece from './GamePiece.js';
import tetrominos from './lib/tetrominos.js';
import './index.css';

export default class Tetris extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      board: [
        [-1,0,0,0,0,0,0,0,0,0,0,-1],
        [-1,0,0,0,0,0,0,0,0,0,0,-1],
        [-1,0,0,0,0,0,0,0,0,0,0,-1],
        [-1,0,0,0,0,0,0,0,0,0,0,-1],
        [-1,0,0,0,0,0,0,0,0,0,0,-1],
        [-1,0,0,0,0,0,0,0,0,0,0,-1],
        [-1,0,0,0,0,0,0,0,0,0,0,-1],
        [-1,0,0,0,0,0,0,0,0,0,0,-1],
        [-1,0,0,0,0,0,0,0,0,0,0,-1],
        [-1,0,0,0,0,0,0,0,0,0,0,-1],
        [-1,0,0,0,0,0,0,0,0,0,0,-1],
        [-1,0,0,0,0,0,0,0,0,0,0,-1],
        [-1,0,0,0,0,0,0,0,0,0,0,-1],
        [-1,0,0,0,0,0,0,0,0,0,0,-1],
        [-1,0,0,0,0,0,0,0,0,0,0,-1],
        [-1,0,0,0,0,0,0,0,0,0,0,-1],
        [-1,0,0,0,0,0,0,0,0,0,0,-1],
        [-1,0,0,0,0,0,0,0,0,0,0,-1],
        [-1,0,0,0,0,0,0,0,0,0,0,-1],
        [-1,0,0,0,0,0,0,0,0,0,0,-1],
        [-2,-2,-2,-2,-2,-2,-2,-2,-2,-2,-2,-2]
      ],
      activeTetrominoPos: [0][4],
    }
  }

  componentDidMount() {
    this.setState({
      board: this.addTetrominoToBoard(),
    })
    window.setInterval(() => this.moveTetrominoDown(), 1000);
  }

  addTetrominoToBoard() {
    const r = 0;
    const c = 4;
    let board = this.state.board;
    const tetromino = tetrominos[Math.floor(Math.random() * Math.floor(7))];
    tetromino.map((trow, rindex) => {
      trow.map((tcolumn, cindex) => {
        board[r+rindex][c+cindex] = tcolumn;
      })
    });
    return board;
  }

  moveTetrominoDown() {
    let board = this.state.board;

    board.reverse().map((trow,tindex) => {
      trow.map((tcolumn, cindex) => {
        if (tcolumn === 1) {
          if (board[tindex-1][cindex] === 0) {
            board[tindex][cindex] = 0;
            board[tindex-1][cindex] = 1;
          }
        }
      })
    })
    board.reverse();
    this.setState({
      board: board,
    })
  }

  render() {
    const { board } = this.state;

    return (
      <div className="boardWrapper">
        <div className="board">
          {
            board.map(boardRow => 
              <div className="row">
                { 
                  boardRow.map(cell =>
                    <div className="cell" data-value={cell}></div>
                  )
                }
              </div>
            )
          }
        </div>
        {/* <GamePiece pieceMatrix={tetrominos[Math.floor(Math.random() * Math.floor(7))]} />
         */}
        {/* {
          tetrominos.map(piece =>
            <GamePiece pieceMatrix={piece} />
          )
        } */}
      </div>
    );
  }
}

ReactDOM.render(<Tetris />, document.getElementById('root'));
