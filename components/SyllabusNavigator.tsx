import React, { useState } from 'react';
import { SYLLABUS } from '../constants';
import type { Topic, StudyMode, StudyContext, Subject } from '../types';

interface SyllabusNavigatorProps {
  onSelectSubTopic: (context: StudyContext, mode: StudyMode) => void;
  onStartSimulator: (syllabus: Subject) => void;
  onCreatePlan: () => void;
}

const SyllabusNavigator: React.FC<SyllabusNavigatorProps> = ({ onSelectSubTopic, onStartSimulator, onCreatePlan }) => {
  const [openTopic, setOpenTopic] = useState<string | null>(null);
  const [openUniversity, setOpenUniversity] = useState<string | null>(SYLLABUS.length > 0 ? SYLLABUS[0].name : null);

  const toggleTopic = (topicName: string) => {
    setOpenTopic(openTopic === topicName ? null : topicName);
  };

  const toggleUniversity = (universityName: string) => {
    setOpenUniversity(openUniversity === universityName ? null : universityName);
  };

  return (
    <div className="card">
      <h2 className="text-center" style={{ marginBottom: '2rem', fontSize: '1.875rem', fontWeight: 700 }}>Temario Completo</h2>

      <div className="card-highlight-green">
        <h3 className="font-bold" style={{ fontSize: '1.5rem', marginBottom: '0.75rem', color: '#166534' }}>¡Organiza tu Estudio!</h3>
        <p style={{ color: '#4b5563', marginBottom: '1.25rem' }}>Crea un plan de estudio personalizado adaptado a tu tiempo y objetivos.</p>
        <button
            onClick={onCreatePlan}
            className="btn btn-green btn-lg"
            style={{ boxShadow: 'var(--shadow-lg)' }}
        >
            Generar Mi Plan de Estudio
        </button>
      </div>
      
      <div className="card-highlight-blue">
        <h3 className="font-bold text-center" style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#1e40af' }}>Simuladores Generales de Examen</h3>
        <p className="text-center" style={{ color: '#4b5563', marginBottom: '1.5rem' }}>Pon a prueba tus conocimientos con un examen completo de 100 preguntas.</p>
        <div className="syllabus-grid">
          {SYLLABUS.map((university) => (
            <button
              key={university.name}
              onClick={() => onStartSimulator(university)}
              className="btn btn-primary btn-full btn-lg"
              style={{ boxShadow: 'var(--shadow-lg)' }}
              aria-label={`Iniciar simulador para ${university.name}`}
            >
              Iniciar Simulador: {university.name.split(' - ')[1] || university.name}
            </button>
          ))}
        </div>
      </div>
      
      <div className="space-y-4">
        {SYLLABUS.map((university) => (
          <div key={university.name} className="accordion-item">
            <button
              onClick={() => toggleUniversity(university.name)}
              className="accordion-header"
              aria-expanded={openUniversity === university.name}
            >
              {university.name}
              <svg className={`icon-md ${openUniversity === university.name ? 'rotate-180' : 'rotate-0'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </button>
            {openUniversity === university.name && (
              <div className="accordion-content">
                {university.topics.map((topic: Topic) => (
                  <div key={topic.name}>
                    <button
                      onClick={() => toggleTopic(`${university.name}-${topic.name}`)}
                      className="topic-btn"
                      aria-expanded={openTopic === `${university.name}-${topic.name}`}
                    >
                      {topic.name}
                       <svg className={`icon-sm ${openTopic === `${university.name}-${topic.name}` ? 'rotate-180' : 'rotate-0'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </button>
                    {openTopic === `${university.name}-${topic.name}` && (
                      <ul className="subtopic-list">
                        {topic.subTopics.map((subTopic) => (
                          <li key={subTopic.name} className="subtopic-item">
                            <span className="subtopic-text">{subTopic.name}</span>
                            <div className="tag-actions">
                               <button
                                onClick={() => onSelectSubTopic({ university: university.name, topic: topic.name, subTopic }, 'flashcards')}
                                className="tag-btn tag-purple"
                                aria-label={`Ver flashcards de ${subTopic.name}`}
                              >
                                Flashcards
                              </button>
                              <button
                                onClick={() => onSelectSubTopic({ university: university.name, topic: topic.name, subTopic }, 'study')}
                                className="tag-btn tag-blue"
                                aria-label={`Estudiar ${subTopic.name}`}
                              >
                                Estudiar
                              </button>
                              <button
                                onClick={() => onSelectSubTopic({ university: university.name, topic: topic.name, subTopic }, 'exam')}
                                className="tag-btn tag-green"
                                aria-label={`Tomar examen de ${subTopic.name}`}
                              >
                                Examen
                              </button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SyllabusNavigator;