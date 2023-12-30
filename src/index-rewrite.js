/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';

/* Utils */
import { canTetrominoMoveToPosition } from './lib/utils/canTetrominoMoveToPosition.js';
import { addTetrominoToBoard } from './lib/utils/addTetrominoToBoard.js';
import { cloneArray } from './lib/utils/cloneArray.js';
import { rotateMatrix } from './lib/utils/rotateMatrix.js';
import { findCompletedRows } from './lib/utils/findCompletedRows';
import { removeRowsFromBoard } from './lib/utils/removeRowsFromBoard.js';

/* Lib */
import { gameBoard2 } from './lib/board.js';
import { getRandomTetromino } from './lib/randomTetromino.js';

/* Components */
import Board from './components/Board.js';
import SidePanel from './components/SidePanel.js';

/* Hooks */
import { useInterval } from './hooks/useInterval.js';

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

  const endCurrentTetrominoPlay = () => {
    setPosition({ r: 0, c: 4 });
    setCurrentTetromino(nextTetromino);
    setNextTetromino(getRandomTetromino());
  };

  /*
   * Function to progress the active tetromino downwards on interval. If the
   * tetromino can no longer move down, the position is reset and play moves to the next tetromino.
   */
  const moveTetrominoDown = () => {
    let newR = position.r + 1;

    const canMove = canTetrominoMoveToPosition(
      {
        r: newR,
        c: position.c,
      },
      currentTetromino.matrix,
      staticBoard
    );

    if (canMove) {
      setPosition({
        r: newR,
        c: position.c,
      });
    } else {
      setStaticBoard(
        addTetrominoToBoard(
          cloneArray(staticBoard),
          currentTetromino.matrix,
          position.r,
          position.c
        )
      );
      endCurrentTetrominoPlay();
    }
  };

  /*
   * Update the 'displayBoard' either via 'useInterval', in which case 'direction' is
   * 'undefined' or via 'keyPress'.
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
        newR = position.r + 1;
        break;
      default:
        return;
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
  };

  /*
   * Keypress events. Either the 'displayBoard' is updated with the new direction, or 'currentTetromino'
   * is rotated.
   */
  const keyPress = (event) => {
    event.preventDefault();
    const key = event.code;

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
   * Gets the DOM row pased as an index, loops though each cell performing the animation. If onFinishCallback is passed
   * then this is executed when animation finishes.
   * The cancel() call removes the effects of the animation, restoring the cell scale.
   */
  const animateCompleteRow = (index, onFinishCallback) => {
    // Gets the DOM row passed as an index
    const rowDOM = document
      .querySelectorAll('[data-animation="game-board"]')[0]
      .children.item(index);

    /*
     * Iterate through each element in the row and perform scale & rotate transform on the ::after element. We don't animate
     * the DOM element itself as that would effect the layout of the board. The ::after element is what contains the block colours.
     */
    Array.from(rowDOM.children).forEach((element, index, array) => {
      const rabbitDownKeyframes = new KeyframeEffect(
        element,
        [
          { transform: 'scale(1) rotate(0deg)' },
          { transform: 'scale(0) rotate(-360deg)', offset: 1 },
        ],
        { duration: 550, fill: 'forwards', pseudoElement: '::after' }
      );
      const rabbitDownAnimation = new Animation(rabbitDownKeyframes, document.timeline);
      rabbitDownAnimation.onfinish = () => {
        rabbitDownAnimation.cancel();
        // Only execute onFinishCallback once on the last element in the array
        if (onFinishCallback && index === array.length - 1) {
          // onFinishCallback();
        }
      };
      rabbitDownAnimation.play();
    });
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
     * Animate each complete row. Only pass callback function for the last row to be animated as updating the static
     * board when there are multiple rows to be animated causes index issues. If no compplete rows are found we reset
     * gameplay for the next playing tetromino.
     */
    if (indexesOfCompleteRows.length > 0) {
      indexesOfCompleteRows.forEach((element, index, array) => {
        animateCompleteRow(
          element,
          index === array.length - 1 ? updateStaticBoardCallback : null
        );
      });
      // setTimeout(() => {
      //   setStaticBoard(updatedBoard);
      // }, 250);
    } else {
      endCurrentTetrominoPlay();
    }
  }, [staticBoard]);

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
  }, [position, currentTetromino]);

  /* Event listeners for keypress */
  useEffect(() => {
    window.addEventListener('keydown', keyPress);
    return () => {
      window.removeEventListener('keydown', keyPress);
    };
  }, [keyPress]);

  /* Start interval to update the 'displayBoard' */
  useInterval(moveTetrominoDown, 1000);

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
