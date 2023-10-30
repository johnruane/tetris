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
import Controls from './components/Controls.js';
import SidePanel from './components/SidePanel.js';
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
    this.levelSpeed = 30000;

    this.state = {
      previousBoard: gameBoard,
      board: gameBoard,
      activeTetromino: { matrix: this.tetromino.matrix, value: this.tetromino.value },
      nextTetromino: getRandomTetromino(),
      tetrominoPosR: this.startPos[0],
      tetrominoPosC: this.startPos[1],
      fallSpeed: 1000,
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
      activeTetromino.matrix,
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
    this.levelIncreaseInterval = window.setInterval(this.increaseLevel, this.levelSpeed);
  };

  /*
   * Will try move activeTetromino 'Down'. If it cannot move 'Down' that piece is set to be static
   * and the next tetromino is added at the starting position.
   */
  runCycle = () => {
    let canMove = this.canMove('ArrowDown');
    if (canMove === false) {
      const { nextTetromino } = this.state;
      this.setState({
        activeTetromino: { matrix: nextTetromino.matrix, value: nextTetromino.value },
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
    const { fallSpeed } = this.state;
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

    // animate cells before removing
    for (let i = row; i >= 0; i--) {
      if (board[i].every((row) => row < 0)) {
        this.animateWinningRow(i);
      }
    }

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

  /*
   * gets the winning row DOM, loops though each cell adding WEB API animation
   */
  animateWinningRow = (row) => {
    const rowDOM = document.getElementsByClassName('game-board')[0].children.item(row);
    Array.from(rowDOM.children).forEach((cell) => {
      const rabbitDownKeyframes = new KeyframeEffect(
        cell,
        [
          { transform: 'scale(1) rotate(0deg)' },
          { transform: 'scale(0) rotate(-360deg)', offset: 0.99 },
          { transform: 'scale(1) rotate(0deg)' },
        ],
        { duration: 500, fill: 'backwards' }
      );
      const rabbitDownAnimation = new Animation(rabbitDownKeyframes, document.timeline);
      rabbitDownAnimation.play();
    });
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
          this.canMove(key);
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
    const rotatedTetromino = rotate(activeTetromino.matrix);
    let mBoard = addTetrominoToBoard(
      cloneArray(previousBoard),
      rotatedTetromino,
      tetrominoPosR,
      tetrominoPosC
    );

    if (compareBoards(board, mBoard)) {
      this.setState({
        board: mBoard,
        activeTetromino: { matrix: rotatedTetromino },
      });
    }
  };

  /*
   * places piece in new position on a clean board and compares new board with current board. If piece
   * can move to new position then updates state with new board.
   */

  moveTetromino = (activeTetromino, newDirection) => {
    this.setState({
      board: addTetrominoToBoard(
        cloneArray(this.state.previousBoard),
        activeTetromino.matrix,
        newDirection[0],
        newDirection[1]
      ),
      tetrominoPosR: newDirection[0],
      tetrominoPosC: newDirection[1],
    });
  };

  canMove = (direction) => {
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
      activeTetromino.matrix,
      ...newDirection
    );

    if (compareBoards(board, mBoard)) {
      this.moveTetromino(activeTetromino, newDirection);
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
    const { board, score, gameStatus, level, lines, nextTetromino } = this.state;
    return (
      <div className='main'>
        <div className='layout-grid'>
          <p className='title'>TETRIS</p>
          <div className='game-board'>
            <Board board={board} />
          </div>
          <div className='game-data'>
            <SidePanel
              score={score}
              level={level}
              lines={lines}
              nextTetromino={nextTetromino.matrix}
            />
          </div>
          <p className='game-over'>{gameStatus}</p>
        </div>
        <div className='mcontrols-wrapper'>
          <Controls canMove={this.canMove} rotateTetromino={this.rotateTetromino} />
        </div>
      </div>
    );
  }
}

ReactDOM.render(<Tetris />, document.getElementById('root'));
