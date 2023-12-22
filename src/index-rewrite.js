/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';

/* Helpers */
import {
  convertScore,
  cloneArray,
  addTetrominoToBoard,
  compareBoards,
  rotateMatrix,
} from './lib/helpers.js';

/* Lib */
import { tetrominos } from './lib/matrices.js';
import { gameBoard } from './lib/board.js';

/* Components */
import Board from './components/Board.js';
import SidePanel from './components/SidePanel.js';

/* Hooks */
import { useInterval } from './hooks/useInterval.js';

/* Styles */
import './index.css';

const getRandomTetromino = () => {
  const tetro = tetrominos[Math.floor(Math.random() * Math.floor(tetrominos.length))];
  return { matrix: tetro.matrix, value: tetro.value };
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
  const numberOfRows = gameBoard.length;
  const currentTetro = getRandomTetromino();
  const nextTetro = getRandomTetromino();

  const [position, setPosition] = useState({ r: 0, c: 4 });

  const [displayBoard, setDisplayBoard] = useState(gameBoard);
  const [staticBoard, setStaticBoard] = useState(gameBoard);

  const [currentTetromino, setCurrentTetromino] = useState(currentTetro);
  const [nextTetromino, setNextTetromino] = useState(nextTetro);

  /* A function to update the 'displayBoard' either via ''useInterval', in which case 'direction' is
   * 'undefined', or via 'keyPress'.
   */
  const updateDisplayBoard = (direction) => {
    let newR = position.r;
    let newC = position.c;

    if (!direction || direction === 'ArrowDown') {
      newR = position.r + 1;
    }

    if (direction === 'ArrowLeft') {
      newC = position.c - 1;
    } else if (direction === 'ArrowRight') {
      newC = position.c + 1;
    }

    const mBoard = addTetrominoToBoard(cloneArray(staticBoard), currentTetro.matrix, {
      r: newR,
      c: newC,
    });

    if (compareBoards(staticBoard, mBoard)) {
      setPosition({
        r: newR,
        c: newC,
      });
    }
  };

  /*
   * Keypress events. Either the 'displayBoard' is updated with the new direction, or 'currentTetromino'
   * is rotated.
   */
  const keyPress = (event) => {
    event.preventDefault();
    const key = event.code;
    if (['ArrowRight', 'ArrowLeft', 'ArrowDown'].includes(key)) {
      updateDisplayBoard(key);
    }
    if (key === 'Space') {
      setCurrentTetromino((current) => ({
        matrix: rotateMatrix(current.matrix),
        value: current.value,
      }));
    }
  };

  /* Updates 'displayBoard' every time the position or 'currentTertromino' changes. The position is updated
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
  }, [position, currentTetromino]);

  /* Event listeners for keypress */
  useEffect(() => {
    window.addEventListener('keydown', keyPress);
    return () => {
      window.removeEventListener('keydown', keyPress);
    };
  }, [keyPress]);

  /* Start interval to update the 'displayBoard' */
  useInterval(updateDisplayBoard, 1000);

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
            score={null}
            level={null}
            lines={null}
            nextTetromino={nextTetromino.matrix}
            gameStatus={null}
          />
        </div>
      </div>
    </div>
  );
};

export default Tetris;

ReactDOM.render(<Tetris />, document.getElementById('root'));
