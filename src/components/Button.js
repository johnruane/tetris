import React from 'react';

export default class Button extends React.Component {
  render() {
    const { classname, onClick } = this.props;
    return (
      <button className={`button ${classname}`} type="button" onClick={onClick}></button>
    )
  }
}
