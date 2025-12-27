import React, { useState, useEffect, useMemo } from 'react';
import { getQuizResults, clearAllResults } from '../services/progressService';
import type { QuizResult } from '../types';

interface ProgressDashboardProps {
  onClose: () => void;
}

// FIX: Define types for progress data to avoid 'unknown' type from Object.entries
type TopicProgress = {
  totalScore: number;
  totalQuestions: number;
  count: number;
};

type UniversityProgress = {
  totalScore: number;
  totalQuestions: number;
  topics: Record<string, TopicProgress>;
};

const ProgressDashboard: React.FC<ProgressDashboardProps> = ({ onClose }) => {
  const [results, setResults] = useState<QuizResult[]>([]);

  useEffect(() => {
    setResults(getQuizResults());
  }, []);
  
  const handleClearProgress = () => {
      if (window.confirm("¿Estás seguro de que quieres borrar todo tu progreso? Esta acción no se puede deshacer.")) {
          clearAllResults();
          setResults([]);
      }
  }

  const progressData = useMemo(() => {
    if (results.length === 0) return null;

    const overall = results.reduce(
      (acc, r) => {
        acc.totalScore += r.score;
        acc.totalQuestions += r.totalQuestions;
        return acc;
      },
      { totalScore: 0, totalQuestions: 0 }
    );
    
    const byUniversity: Record<string, UniversityProgress> = {};

    results.forEach(r => {
        if (!byUniversity[r.university]) {
            byUniversity[r.university] = { totalScore: 0, totalQuestions: 0, topics: {} };
        }
        byUniversity[r.university].totalScore += r.score;
        byUniversity[r.university].totalQuestions += r.totalQuestions;

        if (!byUniversity[r.university].topics[r.topic]) {
            byUniversity[r.university].topics[r.topic] = { totalScore: 0, totalQuestions: 0, count: 0 };
        }
        byUniversity[r.university].topics[r.topic].totalScore += r.score;
        byUniversity[r.university].topics[r.topic].totalQuestions += r.totalQuestions;
        byUniversity[r.university].topics[r.topic].count += 1;
    });

    return {
      overall: {
        accuracy: overall.totalQuestions > 0 ? (overall.totalScore / overall.totalQuestions) * 100 : 0,
        completed: results.length
      },
      byUniversity
    };
  }, [results]);

  const ProgressBar: React.FC<{ accuracy: number }> = ({ accuracy }) => {
    const colorClass = accuracy >= 70 ? 'bg-green' : accuracy >= 40 ? 'bg-yellow' : 'bg-red';
    return (
        <div className="progress-bar-bg">
            <div className={`progress-bar-fill ${colorClass}`} style={{ width: `${accuracy}%` }}></div>
        </div>
    );
  }

  return (
    <div 
      className="modal-overlay"
      onClick={onClose}
    >
      <div 
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold">
            Mi Progreso
          </h2>
          <button
            onClick={onClose}
            className="btn-close"
            aria-label="Cerrar progreso"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="icon-md" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {!progressData && (
            <div className="text-center" style={{ padding: '4rem 0' }}>
                <p className="text-lg" style={{ color: '#6b7280' }}>Aún no has completado ningún examen.</p>
                <p style={{ color: '#9ca3af', marginTop: '0.5rem' }}>¡Completa un quiz en 'Modo Examen' para ver tu progreso aquí!</p>
            </div>
        )}

        {progressData && (
          <div className="space-y-6">
            <div className="summary-card">
                <h3 className="text-xl font-bold mb-4">Resumen General</h3>
                <div className="summary-grid">
                    <div>
                        <p className="stat-value">{progressData.overall.accuracy.toFixed(1)}%</p>
                        <p className="stat-label">Precisión General</p>
                    </div>
                     <div>
                        <p className="stat-value">{progressData.overall.completed}</p>
                        <p className="stat-label">Exámenes Completados</p>
                    </div>
                </div>
            </div>

            <div className="progress-list">
                {Object.entries(progressData.byUniversity).map(([university, uData]) => {
                    const universityData = uData as UniversityProgress;
                    const uniAccuracy = universityData.totalQuestions > 0 ? (universityData.totalScore / universityData.totalQuestions) * 100 : 0;
                    return (
                        <div key={university} className="progress-card">
                            <h4 className="progress-card-title">{university} - <span style={{ color: 'var(--primary-color)' }}>{uniAccuracy.toFixed(1)}%</span></h4>
                             <div>
                                {Object.entries(universityData.topics).map(([topic, tData]) => {
                                    const topicData = tData as TopicProgress;
                                    const topicAccuracy = topicData.totalQuestions > 0 ? (topicData.totalScore / topicData.totalQuestions) * 100 : 0;
                                    return (
                                        <div key={topic} className="topic-item">
                                            <div className="topic-header">
                                                <span className="topic-name">{topic} ({topicData.count} {topicData.count > 1 ? 'intentos' : 'intento'})</span>
                                                <span className="topic-score">{topicAccuracy.toFixed(1)}%</span>
                                            </div>
                                            <ProgressBar accuracy={topicAccuracy} />
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )
                })}
            </div>
             <div className="modal-footer">
                <button
                    onClick={handleClearProgress}
                    className="btn btn-red btn-lg"
                >
                    Borrar Todo el Progreso
                </button>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProgressDashboard;