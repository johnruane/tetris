import React from 'react';
import ReactDOM from 'react-dom';
import rotate from './lib/rotate.js';
import { convertScore, cloneArray } from './lib/helpers.js';
import tetrominos from './lib/tetrominos.js';
import Board from './components/Board.js'
import Button from './components/Button.js'
import './index.css';

export default class Tetris extends React.Component {
  constructor(props) {
    super(props);

    const tetromino = this.getRandomTetromino();

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
      activeTetromino: tetromino.matrix,
      activeTetrominoValue: tetromino.value,
      nextTetromino: this.getRandomTetromino(),
      tetrominoPosR: 0,
      tetrominoPosC: 4,
      intervalTime: 1000,
      level: 1, 
      levelCounter: 0,
      score: '0000000',
      gameStatus: '',
    }
  }

  componentDidMount() {
    this.setNewTetromino();
    this.setInterval(this.state.intervalTime);
    window.addEventListener('keydown', this.keyPress);
  }

  /*
  * randomly picks a tetromino
  */
  getRandomTetromino = () => {
    return tetrominos[Math.floor(Math.random() * Math.floor(tetrominos.length))];
  }

  /*
  * adds the active tetromino to board at position [0, 4]
  */
  setNewTetromino = () => {    
    const { board, activeTetromino } = this.state;
    const mBoard = this.addTetrominoToBoard(cloneArray(board), activeTetromino, 0, 4);
    const tl = activeTetromino.length-1;
    let canAddTetromino = true;

    for(let i=tl;i>0;i--) {
      for(let j=4;j<tl+4;j++) {
        if (mBoard[i][j] > 0) { // if a piece on the move board
          if (this.state.board[i][j] < 0) { // hits a bad piece on the state board
            canAddTetromino = false;
          }
        }
      }
    }

    if (canAddTetromino === false) {
      this.setState({
        board: mBoard,
        gameStatus: 'Game Over',
      })
      window.clearInterval(this.interval);
      return false;
    }
    
    this.setState({
      board: mBoard,
      tetrominoPosR: 0,
      tetrominoPosC: 4,
    })
  }
  /*
  * clears current interval and sets new one
  */
  setInterval = (intervalTime) => {
    window.clearInterval(this.interval);
    this.interval = window.setInterval(this.runCycle, intervalTime);
    this.setState({
      intervalTime: intervalTime,
    })
  }

  /*
  * methods to run every interval. moveTetromino() will move the piece down during
  * this test
  */
  runCycle = () => {
    if (this.moveTetromino('ArrowDown') === false) { // false = can't move down
      const { nextTetromino } = this.state;
      this.setState({
        activeTetromino: nextTetromino.matrix,
        activeTetrominoValue: nextTetromino.value,
        nextTetromino: this.getRandomTetromino(),
      })
      this.freezeTetromino();
      this.checkForCompleteRow();
      this.setNewTetromino();
    }
  }

  /*
  * increases level score
  */
  checkLevel = () => {
    const { level, intervalTime } = this.state;
      this.setState({
        level: level + 1,
      });
      window.clearInterval(this.interval);
      this.setInterval(intervalTime*0.9);
  }

  /*
  * reverse loop through board. if every cell in a line is < 0 then that's a 
  * winning row. remove winning row, add new row to beginning, increment multiplier.
  * if winning row found multiply by 100 for score.
  */
  checkForCompleteRow = () => {
    let { board, score } = this.state;
    const rLength = board.length-2; // -2 to skip the floor row
    let multiplier = 0;
    let didFindWinningRow = false;
    for(let i=rLength;i>=0;i--) {
      if (board[i].every((row) => row < 0)) {
        board.splice(i,1); // remove complete row from board
        board.unshift([-1,0,0,0,0,0,0,0,0,0,0,-1]); // add new row to board start
        multiplier+=1;
        didFindWinningRow = true;
        i++; // put the index back 1 as the rows have shifted down
      }
    }

    if (didFindWinningRow) {
      let strScore = parseInt(score);
      this.setState({
        score: convertScore(strScore, multiplier),
        board,
        levelCounter: this.state.levelCounter+1,
      });
      this.checkLevel();
    }
  }

  /*
  * keypress event decision
  */
  keyPress = (event) => {
    const key = event.code;
    const validKeys = ["Space", "ArrowRight", "ArrowLeft", "ArrowDown"];
    if (validKeys.includes(key)) {
      switch (key) {
        case 'Space':
          this.rotateTetromino();
          break;
        default:
          this.moveTetromino(key);
      }
    }
  }

  /*
  * rotate the active game piece, add the piece to a temp board, test if the new
  * piece lands on an invalid cell on the current board. if it doesn't then set
  * the current board to the temp board
  */
  rotateTetromino = () => {
    const { board, activeTetromino } = this.state;
    const rotatedTetromino = rotate(activeTetromino);
    let mBoard = this.addTetrominoToBoard(
      this.clearBoard(cloneArray(board)),
      rotatedTetromino,
      this.state.tetrominoPosR,
      this.state.tetrominoPosC
    );
      
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

  /*
  * reverse loop board and set any positive cells to 0
  */
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

  /* 
  * adds a new piece (minus the zeros) to a board at position provided
  */
  addTetrominoToBoard = (board, tetromino, r, c) => {
    const length = tetromino.length-1;
    for(let i=0;i<=length;i++) {
      for(let j=0;j<=length;j++) {
        if (tetromino[i][j] > 0) {
          board[r+i][c+j] = tetromino[i][j];
        }
      }
    };
    return board;
  }

  /*
  * loops board from different directions looking for positive numbers. if found
  * then check the cell adjacent
  */
  moveTetromino = (direction) => {
    let board = this.state.board;
    const rLength = board.length-1;
    const cLength = board[0].length-1;
    const r = this.state.tetrominoPosR;
    const c = this.state.tetrominoPosC;
    let canMove = true;
    switch(direction) {
      case 'ArrowLeft':
        for(let i=rLength;i>=0;i--) {
          for(let j=0;j<=cLength;j++) {
            if (this.state.board[i][j]>0) {
              if (this.state.board[i][j-1]<0) {
                canMove = false;
              }
            }
          }
        }
        if (canMove) {
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
        for(let i=rLength;i>=0;i--) {
          for(let j=cLength;j>=0;j--) {
            if (this.state.board[i][j]>0) {
              if (this.state.board[i][j+1]<0) {
                canMove = false;
              }
            }
          }
        }
        if (canMove) {
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
        for(let i=rLength;i>=0;i--) {
          for(let j=0;j<=cLength;j++) {
            if (this.state.board[i][j]>0) {
              if (this.state.board[i+1][j]<0) {
                canMove = false;
              }
            }
          }
        }
        if (canMove) {
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
        } else {
          return false;
        }
      break;
      default: // do nothing
      }
    this.setState({
      board,
    })
  }

  /*
  * loops through rows & columns and turns numbered square negative in order
  * to stop them from being moved
  */
  freezeTetromino = () => {
    let board = this.state.board;
    const rLength = board.length-1;
    const cLength = board[0].length-1;
    for(let i=rLength;i>=0;i--) {
      for(let j=0;j<=cLength;j++) {
        if (this.state.board[i][j]>0) {
          board[i][j] = -Math.abs(board[i][j]); // negate pieces value to freeze
        }
      }
    }
  }

  render() {
    const { board, score, gameStatus, level } = this.state;

    return (
      <>
        <div className="boardWrapper">
          <p className="gameTitle">TETRIS</p>
          <div className="board mainBoard">
            <Board board={board} />
          </div>
          <div className="stats">
            <p className="statLabel">Score</p>
            <p className="score">{score}</p>
            <p className="statLabel">Level</p>
            <p className="score">{level}</p>
            <p className="statLabel">Next</p>
            <Board board={this.state.nextTetromino.matrix}/>
            <p className="gameStatus">{gameStatus}</p>
          </div>
          <div className="controls">
            <Button classname={"directionalButton left"} onClick={() => this.moveTetromino('ArrowLeft')} />
            <Button classname={"directionalButton rotate"}  onClick={this.rotateTetromino} />            
            <Button classname={"directionalButton down"}  onClick={() => this.moveTetromino('ArrowDown')} />
            <Button classname={"directionalButton right"}  onClick={() => this.moveTetromino('ArrowRight')} />            
          </div>
        </div>
      </>
    );
  }
}

ReactDOM.render(<Tetris />, document.getElementById('root'));
