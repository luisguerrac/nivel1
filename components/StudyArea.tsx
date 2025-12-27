import React, { useState, useEffect, useCallback } from 'react';
import type { Quiz, StudyMode, StudyContext, Flashcard } from '../types';
import { generateLesson, generateQuiz, generateFlashcards } from '../services/geminiService';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';
import LessonContent from './LessonContent';
import QuizComponent from './QuizComponent';
import ChatComponent from './ChatComponent';
import ProgressLoader from './ProgressLoader';
import FlashcardComponent from './FlashcardComponent';

interface StudyAreaProps {
  context: StudyContext;
  mode: StudyMode;
  onBack: () => void;
}

const StudyArea: React.FC<StudyAreaProps> = ({ context, mode, onBack }) => {
  const [lesson, setLesson] = useState<string>('');
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [flashcards, setFlashcards] = useState<Flashcard[] | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  
  const [quizGenerationProgress, setQuizGenerationProgress] = useState({ current: 0, total: 0 });


  const fetchLesson = useCallback(async () => {
    setIsLoading(true);
    setError('');
    setLesson('');
    try {
      const stream = await generateLesson(context.subTopic.name);
      for await (const chunk of stream) {
        setLesson(prev => prev + chunk.text);
      }
    } catch (err) {
      setError('No se pudo cargar la lección. Revisa tu conexión o clave de API.');
    } finally {
      setIsLoading(false);
    }
  }, [context.subTopic.name]);

  const doFetchQuiz = useCallback(async () => {
    setIsLoading(true);
    setError('');
    setQuizGenerationProgress({ current: 0, total: 30 });
    try {
      const quizData = await generateQuiz(context.subTopic.name, (loaded, total) => {
        setQuizGenerationProgress({ current: loaded, total });
      });

      if (quizData) {
        setQuiz(quizData);
      } else {
        setError('No se pudo generar el quiz. Intenta de nuevo.');
      }
    } catch (err) {
      setError('Ocurrió un error al generar el quiz.');
    } finally {
      setIsLoading(false);
    }
  }, [context.subTopic.name]);

  const handleStartQuizFromLesson = useCallback(() => {
    doFetchQuiz();
  }, [doFetchQuiz]);

  const fetchFlashcards = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
        const flashcardData = await generateFlashcards(context.subTopic.name);
        setFlashcards(flashcardData);
    } catch (err) {
        setError('No se pudieron generar las flashcards.');
    } finally {
        setIsLoading(false);
    }
  }, [context.subTopic.name]);

  useEffect(() => {
    const initialize = async () => {
      setLesson('');
      setQuiz(null);
      setFlashcards(null);
      setError('');

      switch(mode) {
        case 'study':
          await fetchLesson();
          break;
        case 'exam':
          await doFetchQuiz();
          break;
        case 'flashcards':
          await fetchFlashcards();
          break;
      }
    };
    initialize();
  }, [context, mode, fetchLesson, doFetchQuiz, fetchFlashcards]);
  
  const renderContent = () => {
    if (error) {
        return <ErrorMessage message={error} />
    }

    if (quiz && !isLoading) {
        return <QuizComponent quiz={quiz} context={context} onFinish={onBack} finishButtonText={'Volver'} mode={'exam'} />;
    }
    
    if (isLoading) {
        if (quizGenerationProgress.total > 0) {
            return <ProgressLoader current={quizGenerationProgress.current} total={quizGenerationProgress.total} text="Generando Examen..." />;
        }
        if (mode === 'study') {
            return <LoadingSpinner messages={["Iniciando conexión con el tutor de IA..."]} />;
        }
        if (mode === 'flashcards') {
            return <LoadingSpinner messages={["Creando tarjetas de estudio..."]} />;
        }
    }

    switch(mode) {
        case 'study':
            return (
                <>
                    <LessonContent content={lesson} />
                    {!isLoading && lesson && (
                        <>
                            <ChatComponent lessonContent={lesson} />
                            <div className="cta-box">
                                <h3 className="cta-title">¡Pon a prueba tus conocimientos!</h3>
                                <p className="cta-text">Realiza un examen de 30 preguntas para afianzar lo que has aprendido.</p>
                                <button
                                    onClick={handleStartQuizFromLesson}
                                    className="btn-cta"
                                >
                                    Empezar Examen
                                </button>
                            </div>
                        </>
                    )}
                </>
            );
        case 'exam':
            // This case is now only hit while loading or if there's an error.
            return null;
        case 'flashcards':
            return flashcards && <FlashcardComponent flashcards={flashcards} />;
    }
  };


  return (
    <div className="study-card">
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={onBack}
          className="btn btn-gray"
        >
          <svg className="icon-sm mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          Volver
        </button>
      </div>

      <h2 className="text-3xl font-bold mb-1">{context.subTopic.name}</h2>
      <p className="text-sm text-gray-500 mb-6">{context.university} / {context.topic}</p>

      {renderContent()}
    </div>
  );
};

export default StudyArea;