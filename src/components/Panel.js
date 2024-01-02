import React from 'react';

const Panel = ({ additionalClasses, label, value }) => {
  return (
    <div className={`${additionalClasses}score data-wrapper shadow`}>
      <p className='data-title'>{label}</p>
      <p className='data-value'>{value}</p>
    </div>
  );
};

export default Panel;
