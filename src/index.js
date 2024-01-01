/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';

/* Utils */
import { canTetrominoMoveToPosition } from './lib/utils/canTetrominoMoveToPosition';
import { addTetrominoToBoard } from './lib/utils/addTetrominoToBoard';
import { cloneArray } from './lib/utils/cloneArray';
import { rotateMatrix } from './lib/utils/rotateMatrix';
import { animateCompleteRow } from './lib/utils/animateCompleteRow';
import { findCompletedRows } from './lib/utils/findCompletedRows';
import { removeRowsFromBoard } from './lib/utils/removeRowsFromBoard';
import { convertScore } from './lib/utils/convertScore';

/* Lib */
import { gameBoard2 } from './lib/board';
import { getRandomTetromino } from './lib/randomTetromino';

/* Components */
import Board from './components/Board';
import SidePanel from './components/SidePanel';
import Controls from './components/Controls';

/* Hooks */
import { useInterval } from './hooks/useInterval';

/* Styles */
import './index.css';

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
  const [position, setPosition] = useState({ r: 0, c: 4 });

  const [displayBoard, setDisplayBoard] = useState(gameBoard2);
  const [staticBoard, setStaticBoard] = useState(gameBoard2);

  const [currentTetromino, setCurrentTetromino] = useState(getRandomTetromino());
  const [nextTetromino, setNextTetromino] = useState(getRandomTetromino());

  const [score, setScore] = useState('000000');
  const [lines, setLines] = useState(0);
  const [level, setLevel] = useState(0);

  const [delay, setDelay] = useState(1000);
  const [speed, setSpeed] = useState(30000);

  const [gameStatus, setGameStatus] = useState('');

  /*
   * Update the 'position' either via 'useInterval', in which case 'direction' is 'undefined' or
   * via 'keyPress'.
   */
  const moveTetrominoInDirection = (direction) => {
    let newR = position.r;
    let newC = position.c;

    switch (direction) {
      case 'ArrowLeft':
        newC = position.c - 1;
        break;
      case 'ArrowRight':
        newC = position.c + 1;
        break;
      case 'ArrowDown':
      default:
        newR = position.r + 1;
        break;
    }

    const canMove = canTetrominoMoveToPosition(
      {
        r: newR,
        c: newC,
      },
      currentTetromino.matrix,
      staticBoard
    );

    if (canMove) {
      setPosition({
        r: newR,
        c: newC,
      });
    }

    /*
     * If both are falsey the piece can no longer move down so set 'staticBoard' to complete the current
     * play and reset everything for the next piece.
     */
    if (!canMove && !direction) {
      setStaticBoard(
        addTetrominoToBoard(
          cloneArray(staticBoard),
          currentTetromino.matrix,
          position.r,
          position.c
        )
      );
      setPosition({ r: 0, c: 4 });
      setCurrentTetromino(nextTetromino);
      setNextTetromino(getRandomTetromino());
    }
  };

  /*
   * Keypress events. Either the piece is attempted to move in desired direction, or 'currentTetromino'
   * is rotated.
   */
  const keyPress = (event) => {
    event.preventDefault();
    const key = event.code;
    move(key);
  };

  const move = (key) => {
    if (['ArrowRight', 'ArrowLeft', 'ArrowDown'].includes(key)) {
      moveTetrominoInDirection(key);
    }

    if (key === 'Space') {
      const rotatedMatrix = rotateMatrix(currentTetromino);
      const canMove = canTetrominoMoveToPosition(
        {
          r: position.r,
          c: position.c,
        },
        rotatedMatrix,
        staticBoard
      );

      if (canMove) {
        setCurrentTetromino({
          matrix: rotatedMatrix,
          value: currentTetromino.value,
        });
      }
    }
  };

  /*
   * When staticBoard is updated, that signals that a play has ended so we need to check for completed
   * rows on the board. Completed rows are returned in an array of indexes. Indexed rows are removed from
   * a clone of the static board. The updated board is passed as an argument to the animateWinningRows
   * function to be executed as a 'onFinish' function if the index is the last row to be animated.
   */
  useEffect(() => {
    const cloneBoard = cloneArray(staticBoard);
    /*
     * We sort the indexes ascending so that rows are removed from top to bottom. If descending then the board
     * indexes would be wrong as we shift the rows downwards after removing a row.
     */
    const indexesOfCompleteRows = findCompletedRows(cloneBoard).sort((a, b) => a - b);
    const updatedBoard = removeRowsFromBoard(cloneBoard, indexesOfCompleteRows);

    // Callback function to be executed on the last animation
    function updateStaticBoardCallback() {
      setStaticBoard(updatedBoard);
    }

    /*
     * Animate each complete row.
     */
    if (indexesOfCompleteRows.length > 0) {
      indexesOfCompleteRows.forEach((element) => {
        animateCompleteRow(element, updateStaticBoardCallback);
        setLines((current) => current + 1);
      });
      setScore(convertScore(score, indexesOfCompleteRows.length));
    }
  }, [staticBoard]);

  /*
   * If tetromino cannot move to position 0, 4 when the 'position' is updated that means the pieces have reached
   *  the top and it is game over.
   */
  useEffect(() => {
    const canMove = canTetrominoMoveToPosition(
      {
        r: 0,
        c: 4,
      },
      currentTetromino.matrix,
      staticBoard
    );

    if (!canMove) {
      setDelay(null);
      setSpeed(null);
      setGameStatus('Game Over');
    }
  }, [position]);

  /*
   * Updates 'displayBoard' every time the position or 'currentTertromino' changes. The position is updated
   * every interval. The 'currentTetromino' is updated either via 'rotate' or when the 'nextTetromino'
   * is put into play.
   */
  useEffect(() => {
    setDisplayBoard(
      addTetrominoToBoard(
        cloneArray(staticBoard),
        currentTetromino.matrix,
        position.r,
        position.c
      )
    );
  }, [position, staticBoard, currentTetromino]);

  /*
   * Increase 'level' display everytime the 'delay' for gamespeed is updated
   */
  useEffect(() => {
    setLevel((prev) => prev + 1);
  }, [delay]);

  /*
   * Event listeners for keypress
   */
  useEffect(() => {
    window.addEventListener('keydown', keyPress);
    return () => {
      window.removeEventListener('keydown', keyPress);
    };
  }, [keyPress]);

  /*
   * Interval to move tetrominos every 'delay' milliseconds
   */
  useInterval(() => {
    moveTetrominoInDirection();
  }, delay);

  /*
   * Interval to speed up gameplay every 30 seconds
   */
  useInterval(() => {
    setDelay((prev) => prev * 0.9);
  }, speed);

  return (
    <div className='main'>
      <div className='layout-wrapper'>
        <div className='layout-grid'>
          <p className='title'>TETRIS</p>
          <div className='game-board'>
            <div className='board-wrapper game-board-stack' data-animation='game-board'>
              <Board board={displayBoard} />
            </div>
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
          <Controls move={move} />
        </div>
      </div>
    </div>
  );
};

export default Tetris;

ReactDOM.render(<Tetris />, document.getElementById('root'));
