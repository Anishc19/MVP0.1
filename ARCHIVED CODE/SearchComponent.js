import React, { useState } from 'react';

const App = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  const handleSearch = async () => {
    const apiKey = 'YOUR_API_KEY';
    const cx = 'YOUR_CUSTOM_SEARCH_ENGINE_ID';
    const url = `https://www.googleapis.com/customsearch/v1?q=${encodeURIComponent(query)}&key=${apiKey}&cx=${cx}`;

    try {
      const response = await fetch(url);
      const data = await response.json();
      setResults(data.items);
    } catch (error) {
      console.error('Error during Google Custom Search API Request', error);
    }
  };

  return (
    <div>
      <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} />
      <button onClick={handleSearch}>Search</button>
      {results.map((result, index) => (
        <div key={index}>
          <a href={result.link} target="_blank" rel="noopener noreferrer">
            {result.title}
          </a>
        </div>
      ))}
    </div>
  );
};

export default App;
