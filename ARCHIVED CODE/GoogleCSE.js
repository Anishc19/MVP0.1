import React, { useEffect } from 'react';

const GoogleCSE = ({ cx }) => {
  useEffect(() => {
    const cxParam = `?cx=${cx}`;
    const scriptUrl = `https://cse.google.com/cse.js${cxParam}`;

    // Function to load the CSE script
    const loadCSE = () => {
      const script = document.createElement('script');
      script.src = scriptUrl;
      script.async = true;
      document.body.appendChild(script);
    };

    // Load the script when the component mounts
    loadCSE();

    // Optional: Clean up the script when the component unmounts
    return () => {
      // Find the script element by its src attribute
      const existingScript = document.querySelector(`script[src="${scriptUrl}"]`);
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, [cx]); // Only re-run if cx changes

  return <div className="gcse-search"></div>;
};

export default GoogleCSE;

