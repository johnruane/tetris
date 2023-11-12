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
import { useInterval } from './hooks/useInterval.js';
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
  const tetro = getRandomTetromino();
  let tetrominoPosR = 0;
  let tetrominoPosC = 0;

  const [board, setBoard] = useState(gameBoard);
  const [previousBoard, setPreviousBoard] = useState(gameBoard);
  const [activeTetromino, setActiveTetromino] = useState({
    matrix: tetro.matrix,
    value: tetro.value,
  });

  const startGame = () => {
    setNewTetromino();
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

    setBoard(mBoard);
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
  };

  /*
   * Will try move activeTetromino 'Down'. If it cannot move 'Down' that piece is set to be static
   * and the next tetromino is added at the starting position.
   */
  const runCycle = () => {
    let canTetrominoMove = canMove('ArrowDown');
    if (canTetrominoMove === false) {
      freezeTetromino();
    }
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

  useEffect(() => {
    startGame();
    window.addEventListener('keydown', keyPress);
    return () => {
      window.removeEventListener('keydown', keyPress);
    };
  }, []);

  useInterval(runCycle, 1000);

  return (
    <div className='main'>
      <div className='layout-wrapper'>
        <div className='layout-grid'>
          <p className='title'>TETRIS</p>
          <div className='game-board'>
            <div className='board-wrapper game-board-stack' data-animation='game-board'>
              <Board board={board} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tetris;

ReactDOM.render(<Tetris />, document.getElementById('root'));
