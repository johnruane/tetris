import React from 'react';
import rotate from './lib/rotate.js'

export default class Piece extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      matrix: this.props.pieceMatrix
    }
    document.addEventListener('keydown', this.rotateShape);
  }

  rotateShape = (e) => {
    if (e.code === 'Space') {
      this.setState({
        matrix: rotate(this.state.matrix),
      })
    }
  }

  render() {

    return (
      <div className="board">
        {
          this.state.matrix.map((row) => (
            <div className="row">
              {
                row.map((value) => (
                  <div className="cell" data-value={value}></div>
                ))
              }
            </div>
          ))
        }
      </div>
    )
  }
}