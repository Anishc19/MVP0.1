import React from 'react';
import IframeComponent from './IframeComponent';

const Layout = () => {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-around' }}>
      <IframeComponent src="https://chat.openai.com/" />
      <IframeComponent src="https://www.w3schools.com/js/" />
      <IframeComponent src="https://www.google.com/" />
    </div>
  );
};

export default Layout;
