import React, { useState, useEffect } from 'react';

const YouTubeVideo = ({ videoId }) => {
  const [videoTitle, setVideoTitle] = useState('');
  const [videoDescription, setVideoDescription] = useState('');

  useEffect(() => {
    const fetchVideoDetails = async () => {
      const YOUTUBE_API_KEY = process.env.REACT_APP_YOUTUBE_API_KEY;
      const apiUrl = `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&key=${YOUTUBE_API_KEY}&part=snippet`;

      try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        setVideoTitle(data.items[0].snippet.title);
        setVideoDescription(data.items[0].snippet.description);
      } catch (error) {
        console.error('Error fetching video details:', error);
      }
    };

    fetchVideoDetails();
  }, [videoId]);

  return (
    <div>
      <h1>{videoTitle}</h1>
      <p>{videoDescription}</p>
      <iframe
        width="560"
        height="315"
        src={`https://www.youtube.com/embed/${videoId}`}
        title="YouTube video player"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      ></iframe>
    </div>
  );
};

export default YouTubeVideo;
