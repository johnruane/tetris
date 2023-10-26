import React from 'react';
import ReactDOM from 'react-dom';
import rotate from './lib/rotate.js';
import {
  convertScore,
  cloneArray,
  addTetrominoToBoard,
  compareBoards,
} from './lib/helpers.js';
import { gameBoard, tetrominos } from './lib/matrices.js';
import Board from './components/Board.js';
import Button from './components/Button.js';
import './index.css';

const getRandomTetromino = () => {
  return tetrominos[Math.floor(Math.random() * Math.floor(tetrominos.length))];
};

export default class Tetris extends React.Component {
  constructor(props) {
    super(props);

    this.tetromino = getRandomTetromino();
    this.startPos = [0, 4];
    this.numberOfRows = gameBoard.length;

    this.state = {
      previousBoard: gameBoard,
      board: gameBoard,
      activeTetromino: this.tetromino.matrix,
      activeTetrominoValue: this.tetromino.value,
      nextTetromino: getRandomTetromino(),
      tetrominoPosR: 0,
      tetrominoPosC: 4,
      intervalTime: 1000,
      level: 1,
      levelCounter: 0,
      score: '0000000',
      gameStatus: '',
    };
  }

  componentDidMount() {
    this.setNewTetromino();
    this.setInterval(this.state.intervalTime);
    window.addEventListener('keydown', this.keyPress);
  }

  /*
   * Adds the active tetromino to board at starting position [0, 4]
   */
  setNewTetromino = () => {
    const { board, activeTetromino } = this.state;
    const mBoard = addTetrominoToBoard(
      cloneArray(board),
      activeTetromino,
      ...this.startPos
    );
    const canAddTetromino = compareBoards(board, mBoard);

    // Ends game
    if (canAddTetromino === false) {
      this.setState({
        board: mBoard,
        gameStatus: 'Game Over',
      });
      window.clearInterval(this.interval);
      return false;
    }

    this.setState({
      board: mBoard,
      tetrominoPosR: this.startPos[0],
      tetrominoPosC: this.startPos[1],
    });
  };

  /*
   * Initialises gameplay interval.
   */
  setInterval = (intervalTime) => {
    window.clearInterval(this.interval);
    this.interval = window.setInterval(this.runCycle, intervalTime);
    this.setState({
      intervalTime: intervalTime,
    });
  };

  /*
   * Will try move activeTetromino 'Down'. If it cannot move 'Down' that piece is set to be static
   * and the next tetromino is added at the starting position.
   */
  runCycle = () => {
    let canMove = this.moveTetromino('ArrowDown');
    if (canMove === false) {
      const { nextTetromino } = this.state;
      this.setState({
        activeTetromino: nextTetromino.matrix,
        activeTetrominoValue: nextTetromino.value,
        nextTetromino: getRandomTetromino(),
      });
      this.freezeTetromino();
      this.checkForCompleteRow();
      this.setNewTetromino();
    }
  };

  /*
   * Increases level score
   */
  checkLevel = () => {
    const { level, intervalTime } = this.state;
    this.setState({
      level: level + 1,
    });
    window.clearInterval(this.interval);
    this.setInterval(intervalTime * 0.9);
  };

  /*
   * reverse loop through board. if every cell in a line is < 0 then that's a
   * winning row. remove winning row, add new row to beginning, increment multiplier.
   * if winning row found multiply by 100 for score.
   */
  checkForCompleteRow = () => {
    let { board } = this.state;
    const row = this.numberOfRows - 2; // -2 to skip the floor row
    let winningRowsFound = 0;
    let didFindWinningRow = false;
    for (let i = row; i >= 0; i--) {
      if (board[i].every((row) => row < 0)) {
        board.splice(i, 1); // remove complete row from board
        board.unshift([-1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -1]); // add new row to board start
        winningRowsFound += 1;
        didFindWinningRow = true;
        i++; // put the index back 1 as the rows have shifted down
      }
    }

    if (didFindWinningRow) {
      this.updateScore(winningRowsFound);
    }
  };

  updateScore = (multiplier) => {
    let { board, score } = this.state;
    let strScore = parseInt(score);
    this.setState({
      score: convertScore(strScore, multiplier),
      board,
      levelCounter: this.state.levelCounter + 1,
    });
    this.checkLevel();
  };

  /*
   * keypress events
   */
  keyPress = (event) => {
    const key = event.code;
    const validKeys = ['Space', 'ArrowRight', 'ArrowLeft', 'ArrowDown'];
    if (validKeys.includes(key)) {
      switch (key) {
        case 'Space':
          this.rotateTetromino();
          break;
        case 'ArrowRight':
        case 'ArrowLeft':
        case 'ArrowDown':
        default:
          this.moveTetromino(key);
          break;
      }
    }
  };

  /*
   * rotate the active game piece, add the piece to a temp board, test if the new
   * piece lands on an invalid cell on the current board. if it doesn't then set
   * the current board to the temp board
   */
  rotateTetromino = () => {
    const { board, previousBoard, activeTetromino, tetrominoPosR, tetrominoPosC } =
      this.state;
    const rotatedTetromino = rotate(activeTetromino);
    let mBoard = addTetrominoToBoard(
      cloneArray(previousBoard),
      rotatedTetromino,
      tetrominoPosR,
      tetrominoPosC
    );

    if (compareBoards(board, mBoard)) {
      this.setState({
        board: mBoard,
        activeTetromino: rotatedTetromino,
      });
    }
  };

  /*
   * places piece in new position on a clean board and compares new board with current board. If piece
   * can move to new position then updates state with new board.
   */

  moveTetromino = (direction) => {
    const { board, activeTetromino, tetrominoPosR, tetrominoPosC } = this.state;
    let newDirection;

    switch (direction) {
      case 'ArrowLeft':
        newDirection = [tetrominoPosR, tetrominoPosC - 1];
        break;
      case 'ArrowRight':
        newDirection = [tetrominoPosR, tetrominoPosC + 1];
        break;
      case 'ArrowDown':
      default:
        newDirection = [tetrominoPosR + 1, tetrominoPosC];
        break;
    }

    const mBoard = addTetrominoToBoard(
      cloneArray(board),
      activeTetromino,
      ...newDirection
    );

    if (compareBoards(board, mBoard)) {
      this.setState({
        board: addTetrominoToBoard(
          cloneArray(this.state.previousBoard),
          activeTetromino,
          newDirection[0],
          newDirection[1]
        ),
        tetrominoPosR: newDirection[0],
        tetrominoPosC: newDirection[1],
      });
      return true;
    }
    return false;
  };

  /*
   * maps through rows & columns and negates positive numbered squares in order
   * to stop them from being moved
   */
  freezeTetromino = () => {
    const { board } = this.state;

    const newBoard = cloneArray(board).map((row) => {
      return row.map((piece) => (piece > 0 ? -Math.abs(piece) : piece));
    });

    this.setState({
      board: newBoard,
      previousBoard: newBoard,
    });
  };

  render() {
    const { board, score, gameStatus, level } = this.state;

    return (
      <div className='main-wrapper'>
        <div className='board-wrapper'>
          <p className='game-title'>TETRIS</p>
          <div className='board main-board'>
            <Board board={board} />
          </div>
          <div className='stats'>
            <div className='stats-wrapper'>
              <p className='stat-label next-label'>Next</p>
              <Board board={this.state.nextTetromino.matrix} />
            </div>
            <div className='stats-wrapper stats-border'>
              <p className='stat-label'>Score</p>
              <p className='score'>{score}</p>
            </div>
            <div className='stats-wrapper stats-border'>
              <p className='stat-label'>Level</p>
              <p className='score'>{level}</p>
            </div>
            <p className='game-status'>{gameStatus}</p>
          </div>
        </div>
        <div className='controls'>
          <Button
            classname={'directionalButton left'}
            onClick={() => this.moveTetromino('ArrowLeft')}
          />
          <Button classname={'directionalButton rotate'} onClick={this.rotateTetromino} />
          <Button
            classname={'directionalButton down'}
            onClick={() => this.setDownInterval()}
          />
          <Button
            classname={'directionalButton right'}
            onClick={() => this.moveTetromino('ArrowRight')}
          />
        </div>
      </div>
    );
  }
}

ReactDOM.render(<Tetris />, document.getElementById('root'));
