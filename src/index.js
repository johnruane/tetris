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

    this.tetromino = this.getRandomTetromino();

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
      activeTetromino: this.tetromino.matrix,
      activeTetrominoValue: this.tetromino.value,
      nextTetromino: this.getRandomTetromino(),
      // monitor position of moving tetromino for rotational purposes
      tetrominoPosR: 0,
      tetrominoPosC: 4,
      intervalTime: 1000,
      level: 1, 
      levelCounter: 0,
      score: '0000000',
      gameStatus: '',
    }

    this.row = this.state.board.length-2;
    this.column = this.state.board[0].length-1;
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
  * sets new gameplay interval
  */
  setInterval = (intervalTime) => {
    window.clearInterval(this.interval);
    this.interval = window.setInterval(this.runCycle, intervalTime);
    this.setState({
      intervalTime: intervalTime,
    })
  }

  /*
  * set 'zoom' down interval
  */
  setDownInterval = () => {
    window.clearInterval(this.downInterval);
    this.downInterval = window.setInterval(this.runCycle, 20);
  }

  /*
  * moves the tetromino down. if can't move down then add new piece
  */
  runCycle = () => {
    let canMove = this.moveTetromino('ArrowDown');
    if (canMove === false) { // false = couldn't move down
      const { nextTetromino } = this.state;
      this.setState({
        activeTetromino: nextTetromino.matrix,
        activeTetrominoValue: nextTetromino.value,
        nextTetromino: this.getRandomTetromino(),
      })
      this.freezeTetromino();
      this.checkForCompleteRow();
      this.setNewTetromino();
      window.clearInterval(this.downInterval);
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
    const row = board.length-2; // -2 to skip the floor row
    let multiplier = 0;
    let didFindWinningRow = false;
    for(let i=row;i>=0;i--) {
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
  * keypress events
  */
  keyPress = (event) => {
    const key = event.code;
    const validKeys = ["Space", "ArrowRight", "ArrowLeft", "ArrowDown"];
    if (validKeys.includes(key)) {
      switch (key) {
        case 'Space':
          this.rotateTetromino();
          break;
        case 'ArrowDown':
          this.setDownInterval();
          break;
        default:
          this.moveTetromino(key);
          break;
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
    for(let i=0;i<=this.row;i++) {
      for(let j=0;j<=this.column;j++) {
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
    for(let i=this.row;i>=0;i--) {
      for(let j=0;j<=this.column;j++) {
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
    let moveBoard = cloneArray(board);
    const r = this.state.tetrominoPosR;
    const c = this.state.tetrominoPosC;

    switch(direction) {
      case 'ArrowLeft':
        for(let i=this.row;i>=0;i--) {
          for(let j=0;j<=this.column;j++) {
            if (moveBoard[i][j]>0) {
              moveBoard[i][j] = 0;
              moveBoard[i][j-1] = this.state.activeTetrominoValue;
              // set tracking of moving tetromino
              this.setState({
                tetrominoPosC: c-1,
              });
            }
          }
        }
      break;
      case 'ArrowRight':
        for(let i=this.row;i>=0;i--) {
          for(let j=this.column;j>=0;j--) {
            if (moveBoard[i][j]>0) {
              moveBoard[i][j] = 0;
              moveBoard[i][j+1] = this.state.activeTetrominoValue;
              // set tracking of moving tetromino
              this.setState({
                tetrominoPosC: c+1,
              });
            }
          }
        }
      break;
      case 'ArrowDown':
        for(let i=this.row;i>=0;i--) {
          for(let j=0;j<=this.column;j++) {
            if (moveBoard[i][j]>0) {
              moveBoard[i][j] = 0;
              moveBoard[i+1][j] = this.state.activeTetrominoValue;
              // set tracking of moving tetromino
              this.setState({
                tetrominoPosR: r+1,
              });
            }
          }
        }
      break;
      default:
    }
    const canMove = this.compareBoards(board, moveBoard);
    if (canMove) {
      this.setState({
        board: moveBoard,
      })
    }
    return canMove; 
  }

  /*
  * takes 2 boards and returns false if an active piece on the newBoard is on
  * a negative piece on the currentBoard - piece can't move
  */
  compareBoards = (currentBoard, newBoard) => {
    let canMove = true;
    const row = currentBoard.length-1;
    const column = currentBoard[0].length-1;
    for(let i=0;i<=row;i++) {
      for(let j=0;j<=column;j++) {
        if (newBoard[i][j]>0) {
          if(currentBoard[i][j]<0) {
            canMove = false;
          }
        }
      }
    }
    return canMove;
  }

  /*
  * loops through rows & columns and turns numbered square negative in order
  * to stop them from being moved
  */
  freezeTetromino = () => {
    let board = this.state.board;
    for(let i=this.row;i>=0;i--) {
      for(let j=0;j<=this.column;j++) {
        if (this.state.board[i][j]>0) {
          board[i][j] = -Math.abs(board[i][j]); // negate pieces value to freeze
        }
      }
    }
  }

  render() {
    const { board, score, gameStatus, level } = this.state;

    return (
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
          <Button classname={"directionalButton down"}  onClick={() => this.setDownInterval()} />
          <Button classname={"directionalButton right"}  onClick={() => this.moveTetromino('ArrowRight')} />            
        </div>
      </div>
    );
  }
}

ReactDOM.render(<Tetris />, document.getElementById('root'));
