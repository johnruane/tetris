import React from 'react';
import Button from './Button';

export default class Controls extends React.Component {
  render() {
    const { canMove, rotateTetromino } = this.props;
    return (
      <>
        <Button classname={'button left'} onClick={() => canMove('ArrowLeft')} />
        <Button classname={'button down'} onClick={() => canMove('ArrowDown')} />
        <Button classname={'button rotate'} onClick={rotateTetromino} />
        <Button classname={'button right'} onClick={() => canMove('ArrowRight')} />
      </>
    );
  }
}
