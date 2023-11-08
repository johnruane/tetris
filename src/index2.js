import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import {
  convertScore,
  cloneArray,
  addTetrominoToBoard,
  compareBoards,
  rotateMatrix,
} from './lib/helpers.js';
import { gameBoard, tetrominos } from './lib/matrices.js';
import Board from './components/Board.js';
import Controls from './components/Controls.js';
import SidePanel from './components/SidePanel.js';
import './index.css';

const getRandomTetromino = () => {
  return tetrominos[Math.floor(Math.random() * Math.floor(tetrominos.length))];
};

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

const Tetris = () => {
  const startPos = [0, 4];
  const numberOfRows = gameBoard.length;
  const levelSpeed = 30000;
  const tetro = getRandomTetromino();

  const [board, setBoard] = useState(gameBoard);
  const [previousBoard, setPreviousBoard] = useState(gameBoard);
  const [activeTetromino, setActiveTetromino] = useState({
    matrix: tetro.matrix,
    value: tetro.value,
  });
  const [nextTetromino, setNextTetromino] = useState(getRandomTetromino());
  const [tetrominoPosR, setTetrominoPosR] = useState(startPos[0]);
  const [tetrominoPosC, setTetrominoPosC] = useState(startPos[1]);
  const [fallSpeed, setFallSpeed] = useState(1000);
  const [level, setLevel] = useState(1);
  const [lines, setLines] = useState(0);
  const [score, setScore] = useState('0000000');
  const [gameStatus, setGameStatus] = useState('');

  const resetGame = () => {
    setBoard(gameBoard);
    setPreviousBoard(gameBoard);
    setActiveTetromino(...getRandomTetromino());
    setNextTetromino(...getRandomTetromino());
    setTetrominoPosR(startPos[0]);
    setTetrominoPosC(startPos[1]);
    setFallSpeed(1000);
    setLevel(1);
    setLines(0);
    setScore('0000000');
    setGameStatus('');
    startGame();
  };

  const startGame = () => {
    setNewTetromino();
    // setFallSpeedInterval(fallSpeed);
    // setLevelIncreaseInterval(levelIncrease);
  };

  /*
   * Adds the active tetromino to board at starting position [0, 4]
   */
  const setNewTetromino = () => {
    const mBoard = addTetrominoToBoard(
      cloneArray(board),
      activeTetromino.matrix,
      ...startPos
    );
    const canAddTetromino = compareBoards(board, mBoard);

    // Ends game
    if (canAddTetromino === false) {
      setBoard(mBoard);
      setGameStatus('Game Over');
      // window.clearInterval(fallSpeedInterval);
      // window.clearInterval(levelIncreaseInterval);
      return false;
    }

    setBoard(mBoard);
    setTetrominoPosR(startPos[0]);
    setTetrominoPosC(startPos[1]);
  };

  /*
   * Initialises fall speed interval.
   */
  const setFallSpeedInterval = (fallSpeed) => {
    // window.clearInterval(fallSpeedInterval);
    const fallSpeedInterval = window.setInterval(runCycle, fallSpeed);
    setFallSpeed(fallSpeed);
  };

  /*
   * Initialises level speed interval.
   */
  const setLevelIncreaseInterval = () => {
    // levelIncreaseInterval = window.setInterval(increaseLevel(), levelSpeed);
  };

  /*
   * Will try move activeTetromino 'Down'. If it cannot move 'Down' that piece is set to be static
   * and the next tetromino is added at the starting position.
   */
  const runCycle = () => {
    let canTetrominoMove = canMove('ArrowDown');
    if (canTetrominoMove === false) {
      setActiveTetromino({ matrix: nextTetromino.matrix, value: nextTetromino.value });
      setNextTetromino(getRandomTetromino());
      freezeTetromino();
      checkForCompleteRow();
    }
  };

  /*
   * Increases level score
   */
  const increaseLevel = () => {
    // window.clearInterval(fallSpeedInterval);
    setFallSpeedInterval(fallSpeed * 0.9);
    setLevel((prev) => ({ level: prev + 1 }));
  };

  /*
   * Reverse loop through board. If every cell in a line is < 0 then that's a
   * winning row. Remove winning row, add new row to beginning, increment multiplier.
   * If winning row found multiply by 100 for score.
   */
  const checkForCompleteRow = () => {
    const row = numberOfRows - 2; // -2 to skip the floor row
    let winningRowsFound = 0;
    let didFindWinningRow = false;

    /* We remove and add rows on a clone of the board. This is because we want to animate
     * the cells in the row. If the board gets updated whilst the animation is in progress
     * then the animations will be on the wrong rows and mess up the board.
     */
    const cloneBoard = cloneArray(board);

    for (let i = row; i >= 0; i--) {
      if (cloneBoard[i].every((row) => row < 0)) {
        cloneBoard.splice(i, 1); // Remove complete row from board
        cloneBoard.unshift([-1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -1]); // add new row to board start

        winningRowsFound += 1;
        didFindWinningRow = true;
        i++; // Put the index back 1 as the rows have shifted down
      }
    }

    // Animate the rows
    for (let i = row; i >= 0; i--) {
      if (board[i].every((row) => row < 0)) {
        animateWinningRow(i, cloneBoard);
      }
    }

    if (didFindWinningRow) {
      updateScore(winningRowsFound);
    } else {
      setNewTetromino();
    }
  };

  /*
   * Gets the winning row DOM, loops though each cell adding animation. Takes in the modified
   * board with the winning rows removed, after once animation is complete updates the board
   * state. The cancel() call removes the effects of the animation, restoring the cell scale.
   */
  const animateWinningRow = (row, cloneBoard) => {
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
        setBoard(cloneBoard);
        setPreviousBoard(cloneBoard); // Update the clean board ready for the new active piece
        setNewTetromino();
        rabbitDownAnimation.cancel();
      };
      rabbitDownAnimation.play();
    });
  };

  const updateScore = (multiplier) => {
    setScore(convertScore(score, multiplier));
    setLines(lines + multiplier);
  };

  /*
   * Keypress events
   */
  const keyPress = (event) => {
    const key = event.code;
    const validKeys = ['Space', 'ArrowRight', 'ArrowLeft', 'ArrowDown'];
    if (validKeys.includes(key)) {
      switch (key) {
        case 'Space':
          rotateTetromino();
          break;
        case 'ArrowRight':
        case 'ArrowLeft':
        case 'ArrowDown':
        default:
          canMove(key);
          break;
      }
    }
  };

  /*
   * Rotate the active game piece, add the piece to a temp board, test if the new
   * piece lands on an invalid cell on the current board. if it doesn't then set
   * the current board to the temp board
   */
  const rotateTetromino = () => {
    const rotatedTetromino = rotateMatrix(activeTetromino.matrix);
    let mBoard = addTetrominoToBoard(
      cloneArray(previousBoard),
      rotatedTetromino,
      tetrominoPosR,
      tetrominoPosC
    );

    if (compareBoards(board, mBoard)) {
      setBoard(mBoard);
      setActiveTetromino({ matrix: rotatedTetromino });
    }
  };

  /*
   * Places piece in new position on a clean board and compares new board with current board. If piece
   * can move to new position then updates state with new board.
   */
  const moveTetromino = (activeTetromino, newDirection) => {
    setBoard(
      addTetrominoToBoard(
        cloneArray(previousBoard),
        activeTetromino.matrix,
        newDirection[0],
        newDirection[1]
      )
    );
    setTetrominoPosR(newDirection[0]);
    setTetrominoPosC(newDirection[1]);
  };

  const canMove = (direction) => {
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
      moveTetromino(activeTetromino, newDirection);
      return true;
    }
    return false;
  };

  /*
   * Maps through rows & columns and negates positive numbered squares in order
   * to stop them from being moved
   */
  const freezeTetromino = () => {
    const newBoard = cloneArray(board).map((row) => {
      return row.map((piece) => (piece > 0 ? -Math.abs(piece) : piece));
    });

    setBoard(newBoard);
    setPreviousBoard(newBoard);
  };

  useEffect(() => {
    startGame();
    window.addEventListener('keydown', keyPress);
    return () => {
      window.removeEventListener('keydown', keyPress);
    };
  }, []);

  useEffect(() => {
    const fallSpeedInterval = setInterval(() => {
      runCycle();
    }, fallSpeed);
    return () => clearInterval(fallSpeedInterval);
  }, []);

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
                <span className='overlay-text' onClick={resetGame}>
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
          <Controls canMove={canMove} rotateTetromino={rotateTetromino} />
        </div>
      </div>
    </div>
  );
};

export default Tetris;

ReactDOM.render(<Tetris />, document.getElementById('root'));
