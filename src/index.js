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
      fallSpeed: 1000,
      levelSpeed: 30000,
      level: 1,
      levelCounter: 0,
      lines: 0,
      score: '0000000',
      gameStatus: '',
    };
  }

  componentDidMount() {
    this.setNewTetromino();
    this.setFallSpeedInterval(this.state.fallSpeed);
    this.setLevelIncreaseInterval(this.state.levelIncrease);
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
      window.clearInterval(this.fallSpeedInterval);
      window.clearInterval(this.levelIncreaseInterval);
      return false;
    }

    this.setState({
      board: mBoard,
      tetrominoPosR: this.startPos[0],
      tetrominoPosC: this.startPos[1],
    });
  };

  /*
   * Initialises fall speed interval.
   */
  setFallSpeedInterval = (fallSpeed) => {
    window.clearInterval(this.fallSpeedInterval);
    this.fallSpeedInterval = window.setInterval(this.runCycle, this.state.fallSpeed);
    this.setState({
      fallSpeed: fallSpeed,
    });
  };

  setLevelIncreaseInterval = () => {
    this.levelIncreaseInterval = window.setInterval(
      this.increaseLevel,
      this.state.levelSpeed
    );
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
  increaseLevel = () => {
    const { level, fallSpeed } = this.state;
    window.clearInterval(this.fallSpeedInterval);
    this.setFallSpeedInterval(fallSpeed * 0.9);
    this.setState({
      level: this.state.level + 1,
    });
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
      lines: this.state.lines + multiplier,
    });
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
    const { board, score, gameStatus, level, lines } = this.state;
    return (
      <div className='main'>
        <div className='layout-grid'>
          <p className='title'>TETRIS</p>
          <div className='game-board'>
            <Board board={board} />
          </div>
          <div className='game-data'>
            <div className='data-wrapper shadow'>
              <p className='data-title'>Score</p>
              <p className='data-value'>{score}</p>
            </div>
            <div className='data-wrapper shadow'>
              <p className='data-title'>Level</p>
              <p className='data-value'>{level}</p>
            </div>
            <div className='data-wrapper shadow'>
              <p className='data-title'>Lines</p>
              <p className='data-value'>{lines}</p>
            </div>
            <div className='data-wrapper next-board'>
              <p className='data-title next-label'>Next</p>
              <div className='tetromino-board'>
                <Board board={this.state.nextTetromino.matrix} />
              </div>
            </div>
          </div>
          <p className='game-over'>{gameStatus || 'Game over'}</p>
        </div>
        <div className='mcontrols-wrapper'>
          <Button
            classname={'button left'}
            onClick={() => this.moveTetromino('ArrowLeft')}
          />
          <Button
            classname={'button right'}
            onClick={() => this.moveTetromino('ArrowRight')}
          />
          <Button
            classname={'button down'}
            onClick={() => this.moveTetromino('ArrowDown')}
          />
          <Button classname={'button rotate'} onClick={this.rotateTetromino} />
        </div>
      </div>
    );
  }
}

ReactDOM.render(<Tetris />, document.getElementById('root'));
