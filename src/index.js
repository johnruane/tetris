import React from 'react';
import ReactDOM from 'react-dom';
import rotate from './lib/rotate.js';
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
      mBoard: [],
      testBoard: [],
      tetrominoPosR: 0,
      tetrominoPosC: 4,
      activeTetromino: [],
      activeTetrominoValue: 0,
    }
  }

  componentDidMount() {
    this.setNewTetromino();
    window.addEventListener('keydown', this.keyPress);
    window.setInterval(() => this.runCycle(), 1000);
  }

  cloneArray = (array) => {
    const strArray = JSON.stringify(array);
    return JSON.parse(strArray);
  }

  setNewTetromino = () => {
    const r = Math.floor(Math.random() * Math.floor(7));
    const activeTetromino = tetrominos[r];
    this.setState({
      board: this.addTetrominoToBoard(this.state.board, activeTetromino.matrix, 0, 4),
      activeTetromino: activeTetromino.matrix,
      activeTetrominoValue: tetrominos[r].value,
      tetrominoPosC: 4,
      tetrominoPosR: 0,
    })
  }

  runCycle = () => {
    if (this.tetrominoHasCollided()) {
      this.freezeTetromino();
      this.checkForCompleteRow();
      this.setNewTetromino();
    } else {
      this.moveTetromino('ArrowDown');
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
      this.rotateTetromino();
    } else {
      this.moveTetromino(key);
    }
  }

  // rotate the active game piece, clears he board, add new rotation to board
  rotateTetromino = () => {
    const rotatedTetromino = rotate(this.state.activeTetromino);
    let mBoard = this.addTetrominoToBoard(this.clearBoard(this.cloneArray(this.state.board)), rotatedTetromino, this.state.tetrominoPosR, this.state.tetrominoPosC);
      
    let canRotate = true;
    const rLength = mBoard.length-1;
    const cLength = mBoard[0].length-1;
    for(let i=0;i<=rLength;i++) {
      for(let j=0;j<=cLength;j++) {
        if (mBoard[i][j] > 0) {
          if (this.state.board[i][j] < 0) {
            canRotate = false;
          }
        }
      }
    }

    if (canRotate) {
      this.setState({
        board: mBoard,
        activeTetromino: rotatedTetromino,
      })
    }
  }

  // does what it says
  clearBoard = (board) => {
    const rLength = board.length-1;
    const cLength = board[0].length-1;
    for(let i=rLength;i>=0;i--) {
      for(let j=0;j<=cLength;j++) {
        if (board[i][j] > 0) {
          board[i][j] = 0;
        }
      }
    }
    return board;
  }

  // adds a new piece to the board a position 0,4
  addTetrominoToBoard = (board, tetromino, r, c) => {
    let newBoard = board.slice(0);
    const length = tetromino.length-1;
    for(let i=0;i<=length;i++) {
      for(let j=0;j<=length;j++) {
        newBoard[r+i][c+j] = tetromino[i][j];
      }
    };
    return newBoard;
  }

  moveTetromino = (direction) => {
    let board = this.state.board;
    const rLength = board.length-1;
    const cLength = board[0].length-1;
    const r = this.state.tetrominoPosR;
    const c = this.state.tetrominoPosC;
    switch(direction) {
      case 'ArrowLeft':
        if (this.canMoveLeft()) {
          for(let i=rLength;i>=0;i--) {
            for(let j=0;j<=cLength;j++) {
              if (board[i][j]>0) {
                  board[i][j] = 0;
                  board[i][j-1] = this.state.activeTetrominoValue;
                  this.setState({
                    tetrominoPosC: c-1,
                  });
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
                this.setState({
                  tetrominoPosC: c+1,
                });
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
                this.setState({
                  tetrominoPosR: r+1,
                });
              }
            }
          }
        }
      break;
      default: // do nothing
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
          board[i][j] = -Math.abs(board[i][j]); // negate piece values to freeze
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
        <div className="board">
          {
            this.state.activeTetromino.map((row) => (
              <div className="row">
                {
                  row.map((value) => (
                    <div className="cell" data-value={value}></div>
                  ))
                }
              </div>
            ))
          }
        </div>
      </div>
    );
  }
}

ReactDOM.render(<Tetris />, document.getElementById('root'));
