import React from 'react';
import Button from './Button';

const Controls = ({ move }) => {
  return (
    <>
      <Button classname={'button left'} onClick={() => move('ArrowLeft')} />
      <Button classname={'button down'} onClick={() => move('ArrowDown')} />
      <Button classname={'button rotate'} onClick={() => move('Space')} />
      <Button classname={'button right'} onClick={() => move('ArrowRight')} />
    </>
  );
};

export default Controls;
