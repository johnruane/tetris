import React from 'react';

export default class Board extends React.Component {
  render() {
    const { numberColumns, numberRows } = this.props;

    const rows = Array.from({ length: numberRows }, (_, i) => (
      <div key={`row-${i}`} className='row'>
        {Array.from({ length: numberColumns }, (_, j) => (
          <div key={`cell-${i}-${j}`} className='background-cell'></div>
        ))}
      </div>
    ));

    return <>{rows}</>;
  }
}
