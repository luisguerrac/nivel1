import React, { useState } from 'react';

interface FigureComponentProps {
  description: string; // Will be used as a search query
}

const FigureComponent: React.FC<FigureComponentProps> = ({ description: query }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(query);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSearch = () => {
    const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}&tbm=isch`;
    window.open(searchUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="component-wrapper figure-container">
      <h4 className="font-semibold text-lg mb-2">Asistente de Búsqueda Visual con IA</h4>
      <p className="mb-4 text-gray-600">
        La IA ha generado la siguiente consulta optimizada para encontrar la mejor imagen educativa en la web.
      </p>
      <div className="figure-prompt-box">
        "{query}"
      </div>
      <div className="figure-actions">
        <button
          onClick={handleCopy}
          className="btn btn-gray"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="icon-sm mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          {copied ? '¡Copiado!' : 'Copiar Prompt'}
        </button>
        <button
          onClick={handleSearch}
          className="btn btn-primary"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="icon-sm mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          Buscar en Google Images
        </button>
      </div>
    </div>
  );
};

export default FigureComponent;