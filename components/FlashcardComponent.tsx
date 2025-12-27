import React, { useState } from 'react';
import type { Flashcard } from '../types';

interface FlashcardComponentProps {
  flashcards: Flashcard[];
}

const FlashcardComponent: React.FC<FlashcardComponentProps> = ({ flashcards }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  if (!flashcards || flashcards.length === 0) {
    return <p>No se encontraron flashcards para este tema.</p>;
  }

  const handleNext = () => {
    setIsFlipped(false);
    // Use a timeout to allow the card to flip back before changing content
    setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % flashcards.length);
    }, 300);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setTimeout(() => {
        setCurrentIndex((prev) => (prev - 1 + flashcards.length) % flashcards.length);
    }, 300);
  };
  
  const currentCard = flashcards[currentIndex];
  
  // Inline styles for robust 3D transform animations
  const cardContainerStyle: React.CSSProperties = {
    transformStyle: 'preserve-3d',
    transition: 'transform 0.7s',
    transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
  };

  const cardFaceStyle: React.CSSProperties = {
    backfaceVisibility: 'hidden',
    WebkitBackfaceVisibility: 'hidden', // For Safari compatibility
  };
  
  const cardBackStyle: React.CSSProperties = {
    ...cardFaceStyle,
    transform: 'rotateY(180deg)',
  };


  return (
    <div className="flashcard-wrapper">
      <div 
        className="flashcard-scene"
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <div 
          className="flashcard-card"
          style={cardContainerStyle}
        >
          {/* Front of card */}
          <div style={cardFaceStyle} className="flashcard-face flashcard-front">
            <p className="flashcard-text-term">{currentCard.term}</p>
          </div>
          {/* Back of card */}
          <div style={cardBackStyle} className="flashcard-face flashcard-back">
            <p className="flashcard-text-def">{currentCard.definition}</p>
          </div>
        </div>
      </div>

      <p className="flashcard-help-text">
        Haz clic en la tarjeta para voltearla.
      </p>

      <div className="flashcard-controls">
        <button
          onClick={handlePrev}
          className="btn-nav btn-nav-prev"
        >
          Anterior
        </button>
        <span className="flashcard-counter">
          {currentIndex + 1} / {flashcards.length}
        </span>
        <button
          onClick={handleNext}
          className="btn-nav btn-nav-next"
        >
          Siguiente
        </button>
      </div>
    </div>
  );
};

export default FlashcardComponent;