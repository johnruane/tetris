import React from 'react';
import ReactDOM from 'react-dom';
import { compareBoards } from './lib/helpers.js';
import { addTetrominoToBoard } from './lib/utils/addTetrominoToBoard.js';
import { cloneArray } from './lib/utils/cloneArray.js';
import { rotateMatrix } from './lib/utils/rotateMatrix.js';
import { convertScore } from './lib/utils/convertScore.js';
import { tetrominos } from './lib/matrices.js';
import { gameBoard } from './lib/board.js';
import Board from './components/Board.js';
import Controls from './components/Controls.js';
import SidePanel from './components/SidePanel.js';
import './index.css';

const getRandomTetromino = () => {
  return tetrominos[Math.floor(Math.random() * Math.floor(tetrominos.length))];
};

const startPos = [0, 4];
const tetro = getRandomTetromino();

/*
 * @previousBoard: The board without the current moving piece. When moving or rotating a piece,
 * the previous board is a clean board that we can add the moving piece to in order to check
 * the move is valid. Otherwise we'd have to keep removing it on the next cycle.
 * @board: The board with all the static pieces
 * @activeTetromino: The current piece matrix and value
 * @nextTetromino: The next piece
 * @tetrominoPosR: Current row position of top left corner of the matrix
 * @tetrominoPosC: Current column position of top left corner of the matrix
 * @fallSpeed: Interval at which the cycle runs at
 * @level: Level in the game. Increments at interval of levelSpeed
 * @lines: Number of winning rows achieved
 * @score: Score
 * @gameStatus: String for 'Game Over' message
 */

const initialState = {
  previousBoard: gameBoard,
  board: gameBoard,
  activeTetromino: { matrix: tetro.matrix, value: tetro.value },
  nextTetromino: getRandomTetromino(),
  tetrominoPosR: startPos[0],
  tetrominoPosC: startPos[1],
  fallSpeed: 1000,
  level: 1,
  lines: 0,
  score: '000000',
  gameStatus: '',
};

export default class Tetris extends React.Component {
  constructor(props) {
    super(props);

    this.startPos = [0, 4];
    this.numberOfRows = gameBoard.length;
    this.levelSpeed = 30000;

    this.state = {
      ...initialState,
    };
  }

  componentDidMount() {
    this.startGame();
    window.addEventListener('keydown', this.keyPress);
  }

  resetGame = () => {
    this.setState(
      {
        ...initialState,
      },
      () => {
        this.startGame();
      }
    );
  };

  startGame = () => {
    this.setNewTetromino();
    this.setFallSpeedInterval(this.state.fallSpeed);
    this.setLevelIncreaseInterval(this.state.levelIncrease);
  };

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

  /*
   * Initialises level speed interval.
   */
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
    }
  };

  /*
   * Increases level score
   */
  increaseLevel = () => {
    const { fallSpeed } = this.state;
    window.clearInterval(this.fallSpeedInterval);
    this.setFallSpeedInterval(fallSpeed * 0.9);
    this.setState((previousState) => ({ level: previousState.level + 1 }));
  };

  /*
   * Reverse loop through board. If every cell in a line is < 0 then that's a
   * winning row. Remove winning row, add new row to beginning, increment multiplier.
   * If winning row found multiply by 100 for score.
   */
  checkForCompleteRow = () => {
    let { board } = this.state;
    const row = this.numberOfRows - 2; // -2 to skip the floor row
    let winningRowsFound = 0;
    let didFindWinningRow = false;

    /* We remove and add rows on a clone of the board. This is because we want to animate
     * the cells in the row. If the board gets updated whilst the animation is in progress
     * then the animations will be on the wrong rows and mess up the board.
     */
    const cloneBoard = cloneArray(board);

    for (let i = row; i >= 0; i--) {
      if (cloneBoard[i].every((row) => row < 0)) {
        cloneBoard.splice(i, 1); // remove complete row from board
        cloneBoard.unshift([-1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -1]); // add new row to board start

        winningRowsFound += 1;
        didFindWinningRow = true;
        i++; // put the index back 1 as the rows have shifted down
      }
    }

    // Animate the rows
    for (let i = row; i >= 0; i--) {
      if (board[i].every((row) => row < 0)) {
        this.animateWinningRow(i, cloneBoard);
      }
    }

    if (didFindWinningRow) {
      this.updateScore(winningRowsFound);
    } else {
      this.setNewTetromino();
    }
  };

  /*
   * Gets the winning row DOM, loops though each cell adding animation. Takes in the modified
   * board with the winning rows removed, after once animation is complete updates the board
   * state. The cancel() call removes the effects of the animation, restoring the cell scale.
   */
  animateWinningRow = (row, cloneBoard) => {
    const rowDOM = document
      .querySelectorAll('[data-animation="game-board"]')[0]
      .children.item(row);
    Array.from(rowDOM.children).forEach((cell) => {
      const rabbitDownKeyframes = new KeyframeEffect(
        cell,
        [
          { transform: 'scale(1) rotate(0deg)' },
          { transform: 'scale(0) rotate(-360deg)', offset: 1 },
        ],
        { duration: 250, fill: 'forwards', pseudoElement: '::after' }
      );
      const rabbitDownAnimation = new Animation(rabbitDownKeyframes, document.timeline);
      rabbitDownAnimation.onfinish = () => {
        this.setState({
          board: cloneBoard,
          previousBoard: cloneBoard, // Update the clean board ready for the new active piece
        });
        this.setNewTetromino();
        rabbitDownAnimation.cancel();
      };
      rabbitDownAnimation.play();
    });
  };

  updateScore = (multiplier) => {
    let { score } = this.state;
    this.setState({
      score: convertScore(score, multiplier),
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
    const rotatedTetromino = rotateMatrix(activeTetromino.matrix);
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
        <div className='layout-wrapper'>
          <div className='layout-grid'>
            <p className='title'>TETRIS</p>
            <div className='game-board'>
              <div className='board-wrapper game-board-stack' data-animation='game-board'>
                <Board board={board} />
              </div>
              {gameStatus && (
                <div className='overlay game-board-stack'>
                  <span className='overlay-text' onClick={this.resetGame}>
                    Tap here to play again
                  </span>
                </div>
              )}
            </div>
            <SidePanel
              score={score}
              level={level}
              lines={lines}
              nextTetromino={nextTetromino.matrix}
              gameStatus={gameStatus}
            />
          </div>
        </div>
        <div className='controls-wrapper'>
          <div className='controls'>
            <Controls canMove={this.canMove} rotateTetromino={this.rotateTetromino} />
          </div>
        </div>
      </div>
    );
  }
}

ReactDOM.render(<Tetris />, document.getElementById('root'));
