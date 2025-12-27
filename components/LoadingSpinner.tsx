import React, { useState, useEffect } from 'react';

interface LoadingSpinnerProps {
  messages: string[];
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ messages }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!messages || messages.length === 0) return;

    const intervalId = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % messages.length);
    }, 3000); 

    return () => clearInterval(intervalId);
  }, [messages]);

  const defaultMessage = "Generando contenido con IA...";
  const currentMessage = messages && messages.length > 0 ? messages[currentIndex] : defaultMessage;

  return (
    <div className="spinner-container">
      <div className="spinner"></div>
       <p className="spinner-text">{currentMessage}</p>
    </div>
  );
};

export default LoadingSpinner;