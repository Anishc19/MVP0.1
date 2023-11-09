const handleSearch = () => {
    const query = encodeURIComponent(searchTerm);
    const googleSearchUrl = `https://www.google.com/search?q=${query}`;
    window.open(googleSearchUrl, '_blank');
  };
  