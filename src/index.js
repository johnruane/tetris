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
    window.addEventListener('keydown', this.keyPress);
    window.setInterval(() => this.moveTetromino(), 1000);
  }

  keyPress = (event) => {
    this.moveTetromino(event.code);
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

  moveTetromino = (direction) => {
    let board = this.state.board;
    const rLength = board.length-1;
    const cLength = board[0].length-1;
      switch(direction) {
        case 'ArrowLeft':
          if (this.canMoveLeft()) {
            for(let i=rLength;i>=0;i--) {
              for(let j=0;j<=cLength;j++) {
                if (board[i][j]===1) {
                    board[i][j] = 0;
                    board[i][j-1] = 1;
                }
              }
            }
          }
        break;
        case 'ArrowRight':
          if (this.canMoveRight()) {
            for(let i=rLength;i>=0;i--) {
              for(let j=cLength;j>=0;j--) {
                if (board[i][j]===1) {
                    board[i][j] = 0;
                    board[i][j+1] = 1;
                }
              }
            }
          }
        break;
        case 'ArrowDown':
          for(let i=rLength;i>=0;i--) {
            if (this.canMoveDown()) {
              for(let j=0;j<=11;j++) {
                if (board[i][j]===1) {
                  if (board[i+1][j]===0) {
                    board[i][j] = 0;
                    board[i+1][j] = 1;
                  }
                }
              }
            }
          }
        break;
        default:
          for(let i=rLength;i>=0;i--) {
            if (this.canMoveDown()) {
              for(let j=0;j<=11;j++) {
                if (board[i][j]===1) {
                  if (board[i+1][j]===0) {
                    board[i][j] = 0;
                    board[i+1][j] = 1;
                  }
                }
              }
            }
          }
      }
    this.setState({
      board,
    })
  }

  canMoveLeft = () => {
    let canMove = true;
    const rLength = this.state.board.length-1;
    const cLength = this.state.board[0].length-1;
    for(let i=rLength;i>=0;i--) {
      for(let j=0;j<=cLength;j++) {
        if (this.state.board[i][j]===1) {
          if (this.state.board[i][j-1]===-1) {
            canMove = false;
          }
        }
      }
    }
    return canMove;
  }

  canMoveRight = () => {
    let canMove = true;
    const rLength = this.state.board.length-1;
    const cLength = this.state.board[0].length-1;
    for(let i=rLength;i>=0;i--) {
      for(let j=cLength;j>=0;j--) {
        if (this.state.board[i][j]===1) {
          if (this.state.board[i][j+1]===-1) {
            canMove = false;
          }
        }
      }
    }
    return canMove;
  }
  

  canMoveDown = () => {
    let canMove = true;
    const rLength = this.state.board.length-1;
    const cLength = this.state.board[0].length-1;
    for(let i=rLength;i>=0;i--) {
      for(let j=0;j<=cLength;j++) {
        if (this.state.board[i][j]===1) {
          if (this.state.board[i+1][j]===-1) {
            canMove = false;
          }
        }
      }
    }
    return canMove;
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
