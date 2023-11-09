import React from 'react';

const IframeComponent = ({ src }) => {
  return (
    <iframe
      src={src}
      width="100%"
      height="500px"
      style={{ border: 'none' }}
      title="iframe"
    />
  );
};

export default IframeComponent;
