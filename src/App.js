import React from 'react';
import GoogleCSE from './GoogleCSE';

const App = () => {
  const cseId = 'c780d0e0a72ae4d69'; // Replace with your actual Custom Search Engine ID

  return (
    <div>
      <h1>My Custom Search</h1>
      <GoogleCSE cx={cseId} />
    </div>
  );
};

export default App;
