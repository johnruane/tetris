import React from 'react';

const Button = ({ classname, onClick }) => {
  return <button className={classname} type='button' onClick={() => onClick()}></button>;
};

export default Button;
