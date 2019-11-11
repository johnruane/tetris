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
        // [-1,0,0,0,0,0,0,0,0,0,0,-1],
        // [-1,0,0,0,0,0,0,0,0,0,0,-1],
        // [-1,0,0,0,0,0,0,0,0,0,0,-1],
        // [-1,0,0,0,0,0,0,0,0,0,0,-1],
        // [-1,0,0,0,0,0,0,0,0,0,0,-1],
        // [-1,0,0,0,0,0,0,0,0,0,0,-1],
        // [-1,0,0,0,0,0,0,0,0,0,0,-1],
        // [-1,0,0,0,0,0,0,0,0,0,0,-1],
        // [-1,0,0,0,0,0,0,0,0,0,0,-1],
        // [-1,0,0,0,0,0,0,0,0,0,0,-1],
        // [-1,0,0,0,0,0,0,0,0,0,0,-1],
        // [-1,0,0,0,0,0,0,0,0,0,0,-1],
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
      activeTetrominoPos: [0,4],
      activeTetromino: [],
      activeTetrominoValue: 0,
      winningRow:0,
    }
  }

  componentDidMount() {
    this.setNewTetromino();
    window.addEventListener('keydown', this.keyPress);
    window.setInterval(() => this.runCycle(), 1000);
  }

  setNewTetromino = () => {
    // const r = Math.floor(Math.random() * Math.floor(7));
    const r = 0;
    const activeTetromino = tetrominos[r];
    this.setState({
      board: this.addTetrominoToBoard(activeTetromino.matrix),
      activeTetromino: activeTetromino.matrix,
      activeTetrominoValue: tetrominos[r].value,
    })
  }

  runCycle = () => {
    if (this.tetrominoHasCollided()) {
      this.freezeTetromino();
      this.checkForCompleteRow();
      this.setNewTetromino();
    } else {
      this.moveTetromino();
    }
  }

  // return true if all row columns are negative
  rowIsComplete = (row) => {
    return row < 0;
  }

  checkForCompleteRow = () => {
    let board = this.state.board;
    const rLength = board.length-2; // -2 to skip the floor row
    for(let i=rLength;i>=0;i--) {
      if (board[i].every(this.rowIsComplete)) {
        board.splice(i,1); // remove row from board
        board.unshift([-1,0,0,0,0,0,0,0,0,0,0,-1]); // add new row to board start
        this.setState({
          board,
        });
        this.checkForCompleteRow(); // repeat check for rows in case of multiple wins
      }
    }
  }

  keyPress = (event) => {
    const key = event.code;
    if (key === "Space") {

    }
    this.moveTetromino(key);
  }

  // adds a new piece to the board a position 0,4
  addTetrominoToBoard = (tetromino) => {
    const r = 0;
    const c = 4;
    let board = this.state.board;
    tetromino.map((trow, rindex) => {
      trow.map((tcolumn, cindex) => {
        board[r+rindex][c+cindex] = tcolumn;
      })
    });
    return board;
  }

  moveTetromino = (direction) => {
    let board = this.state.board;
    let pos = this.state.activeTetrominoPos;
    const rLength = board.length-1;
    const cLength = board[0].length-1;
    switch(direction) {
      case 'ArrowLeft':
        if (this.canMoveLeft()) {
          for(let i=rLength;i>=0;i--) {
            for(let j=0;j<=cLength;j++) {
              if (board[i][j]>0) {
                  board[i][j] = 0;
                  board[i][j-1] = this.state.activeTetrominoValue;
              }
            }
          }
        }
      break;
      case 'ArrowRight':
        if (this.canMoveRight()) {
          for(let i=rLength;i>=0;i--) {
            for(let j=cLength;j>=0;j--) {
              if (board[i][j]>0) {
                board[i][j] = 0;
                board[i][j+1] = this.state.activeTetrominoValue;
              }
            }
          }
        }
      break;
      case 'ArrowDown':
        if (this.canMoveDown()) {
          for(let i=rLength;i>=0;i--) {
            for(let j=0;j<=11;j++) {
              if (board[i][j]>0) {
                board[i][j] = 0;
                board[i+1][j] = this.state.activeTetrominoValue;
              }
            }
          }
        }
      break;
      default:
        if (this.canMoveDown()) {
          for(let i=rLength;i>=0;i--) {
            for(let j=0;j<=11;j++) {
              if (board[i][j]>0) {
                board[i][j] = 0;
                board[i+1][j] = this.state.activeTetrominoValue;
              }
            }
          }
        }
      }
    this.setState({
      board,
    })
  }

  // loops through rows & columns (from left to right). if a positive number is 
  // found it will check the column to the left and set canMove to false if it 
  // is a negative number
  canMoveLeft = () => {
    let canMove = true;
    const rLength = this.state.board.length-1;
    const cLength = this.state.board[0].length-1;
    for(let i=rLength;i>=0;i--) {
      for(let j=0;j<=cLength;j++) {
        if (this.state.board[i][j]>0) {
          if (this.state.board[i][j-1]<0) {
            canMove = false;
          }
        }
      }
    }
    return canMove;
  }

  // loops through rows & columns (from right to left). if a positive number is 
  // found it will check the column to the right and set canMove to false if it 
  // is a negative number
  canMoveRight = () => {
    let canMove = true;
    const rLength = this.state.board.length-1;
    const cLength = this.state.board[0].length-1;
    for(let i=rLength;i>=0;i--) {
      for(let j=cLength;j>=0;j--) {
        if (this.state.board[i][j]>0) {
          if (this.state.board[i][j+1]<0) {
            canMove = false;
          }
        }
      }
    }
    return canMove;
  }

  // loops through rows & columns. if a positive number is found it will check
  // the row below the found square and set canMove to false if it is a
  // negative number
  canMoveDown = () => {
    let canMove = true;
    const rLength = this.state.board.length-1;
    const cLength = this.state.board[0].length-1;
    for(let i=rLength;i>=0;i--) {
      for(let j=0;j<=cLength;j++) {
        if (this.state.board[i][j]>0) {
          if (this.state.board[i+1][j]<0) {
            canMove = false;
          }
        }
      }
    }
    return canMove;
  }

  // loops through rows & columns and turns numbered square negative in order
  // to stop them from being moved
  freezeTetromino = () => {
    let board = this.state.board;
    const rLength = board.length-1;
    const cLength = board[0].length-1;
    for(let i=rLength;i>=0;i--) {
      for(let j=0;j<=cLength;j++) {
        if (this.state.board[i][j]>0) {
          board[i][j] = -Math.abs(board[i][j]);
        }
      }
    }
  }

  tetrominoHasCollided = () => {
    return !this.canMoveDown();
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
