import React from 'react';

function App() {
  const board = [
    [0,0,0],
    [0,0,0],
    [0,0,0]
  ]

  const piece1 = [
    [0,0,0],
    [0,1,0],
    [1,1,1]
  ]

  return (
    <div className="App">
      <div className="board">
        {
          board.map((row) => (
            <div className="row">
              {
                row.map((value) => (
                  <div className="cell"></div>
                ))
              }
            </div>
          ))
        }
      </div>
    </div>
  );
}

export default App;
