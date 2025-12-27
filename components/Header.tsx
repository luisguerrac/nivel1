import React from 'react';

interface HeaderProps {
    onShowProgress: () => void;
    onShowPlan: () => void;
    onShowSyllabus: () => void;
    hasPlan: boolean;
    onOpenImageSolver: () => void;
}

const Header: React.FC<HeaderProps> = ({ onShowProgress, onShowPlan, onShowSyllabus, hasPlan, onOpenImageSolver }) => {
  return (
    <header className="app-header">
      <div className="header-inner">
        <div className="logo-section" onClick={onShowSyllabus}>
           <svg className="logo-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
           <h1 className="logo-text sm:block hidden">
             Nivelapp
           </h1>
           <h1 className="logo-text sm:hidden">
             Nivelapp
           </h1>
        </div>

        <div className="nav-actions">
          <button
            onClick={onOpenImageSolver}
            className="btn btn-icon"
            title="Cámara IA - Resolver dudas con foto"
            aria-label="Cámara IA"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="icon-md" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="md:inline hidden" style={{ marginLeft: '0.5rem', fontWeight: 600 }}>Cámara IA</span>
          </button>

          {hasPlan && (
            <button
              onClick={onShowPlan}
              className="btn btn-text"
            >
              Mi Plan
            </button>
          )}

          <button
             onClick={onShowSyllabus}
             className="btn btn-text sm:block hidden"
          >
            Temario
          </button>

          <button
            onClick={onShowProgress}
            className="btn btn-primary"
          >
            <svg className="icon-sm" style={{ marginRight: '0.25rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
            <span className="md:inline hidden">Mi Progreso</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;