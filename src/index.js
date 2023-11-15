/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useCallback, useReducer } from 'react';
import ReactDOM from 'react-dom';
import { bindActionCreators } from '@reduxjs/toolkit';
import {
  convertScore,
  cloneArray,
  addTetrominoToBoard,
  compareBoards,
  rotateMatrix,
} from './lib/helpers.js';
import { useBoardReducer } from './store/index.js';
import { tetrominos } from './lib/matrices.js';
import { gameBoard } from './lib/board.js';
import { useInterval } from './hooks/useInterval.js';
import Board from './components/Board.js';
import Controls from './components/Controls.js';
import SidePanel from './components/SidePanel.js';
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
  const tetro = getRandomTetromino();
  const nextTetro = getRandomTetromino();

  // const [nextTetromino, setNextTetromino] = useState({
  //   matrix: nextTetro.matrix,
  //   value: nextTetro.value,
  // });
  // const [activeTetromino, setActiveTetromino] = useState({
  //   matrix: tetro.matrix,
  //   value: tetro.value,
  // });
  const [level, setLevel] = useState(1);
  const [lines, setLines] = useState(0);
  const [score, setScore] = useState('0000000');
  const [gameStatus, setGameStatus] = useState('');

  const { getInitialState, reducer, actions } = useBoardReducer;
  const [state, dispatch] = useReducer(reducer, getInitialState());

  const {
    setBoard,
    setPreviousBoard,
    setPosition,
    setActiveTetromino,
    setNextTetromino,
  } = bindActionCreators(actions, dispatch);
  const { board, previousBoard, position, activeTetromino, nextTetromino } = state;

  const setStartingPiece = () => {
    const mBoard = addTetrominoToBoard(cloneArray(board), activeTetromino.matrix, 0, 4);
    const canAddTetromino = compareBoards(board, mBoard);

    // Ends game
    if (!canAddTetromino) {
      setBoard(mBoard);
      setGameStatus('Game Over');
      return;
    }
    setBoard(mBoard);
    setPosition({ r: 0, c: 4 });
  };

  const resetGame = () => {
    setBoard(gameBoard);
    setPreviousBoard(gameBoard);
    setActiveTetromino(getRandomTetromino());
    setNextTetromino(getRandomTetromino());
    setPosition({ row: 0, column: 4 });
    setLevel(1);
    setLines(0);
    setScore('0000000');
    setGameStatus('');
    setStartingPiece();
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
        setStartingPiece();
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
      setStartingPiece();
    }
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

  /*
   * Places piece in new position on a clean board and compares new board with current board. If piece
   * can move to new position then updates state with new board.
   */
  const moveTetromino = (activeTetromino, newDirection) => {
    const newBoard = addTetrominoToBoard(
      cloneArray(previousBoard),
      activeTetromino.matrix,
      newDirection[0],
      newDirection[1]
    );

    setBoard(newBoard);
    setPosition({ row: newDirection[0], column: newDirection[1] });
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
      position.row,
      position.column
    );

    if (compareBoards(board, mBoard)) {
      setBoard(mBoard);
      setActiveTetromino({ matrix: rotatedTetromino, value: activeTetromino.value });
    }
  };

  const canMove = (direction) => {
    let newDirection;
    switch (direction) {
      case 'ArrowLeft':
        newDirection = [position.row, position.column - 1];
        break;
      case 'ArrowRight':
        newDirection = [position.row, position.column + 1];
        break;
      case 'ArrowDown':
      default:
        newDirection = [position.row + 1, position.column];
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
   * Will try move activeTetromino 'Down'. If it cannot move 'Down' that piece is set to be static
   * and the next tetromino is added at the starting position.
   */
  const runCycle = () => {
    let canTetrominoMove = canMove('ArrowDown');
    const tetro = getRandomTetromino();

    if (canTetrominoMove === false) {
      setActiveTetromino({
        matrix: nextTetromino.matrix,
        value: nextTetromino.value,
      });
      setNextTetromino({ matrix: tetro.matrix, value: tetro.value });
      freezeTetromino();
      checkForCompleteRow();
    }
  };

  useEffect(() => {
    setStartingPiece();
  }, []);

  /*
   * Keypress events
   */
  const keyPress = (event) => {
    event.preventDefault();
    const key = event.code;
    if (['Space', 'ArrowRight', 'ArrowLeft', 'ArrowDown'].includes(key)) {
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

  useEffect(() => {
    window.addEventListener('keydown', keyPress);
    return () => {
      window.removeEventListener('keydown', keyPress);
    };
  }, [keyPress]);

  useEffect(() => {
    runCycle();
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
