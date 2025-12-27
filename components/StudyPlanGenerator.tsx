import React, { useState } from 'react';
import { SYLLABUS } from '../constants';
import { generateStudyPlan, generateStudyPlanFromPDF, generateSimulationFromPDF } from '../services/geminiService';
import { saveStudyPlan } from '../services/studyPlanService';
import type { StudyPlan, Quiz } from '../types';
import LoadingSpinner from './LoadingSpinner';
import ProgressLoader from './ProgressLoader';

interface StudyPlanGeneratorProps {
  onPlanGenerated: (plan: StudyPlan) => void;
  onStartPdfSimulator?: (quiz: Quiz) => void;
}

const StudyPlanGenerator: React.FC<StudyPlanGeneratorProps> = ({ onPlanGenerated, onStartPdfSimulator }) => {
  const [mode, setMode] = useState<'manual' | 'pdf'>('manual');
  const [university, setUniversity] = useState(SYLLABUS[0].name);
  const [weeks, setWeeks] = useState('4');
  const [hoursPerWeek, setHoursPerWeek] = useState('5');
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingType, setLoadingType] = useState<'plan' | 'simulator'>('plan');
  const [error, setError] = useState('');
  const [simProgress, setSimProgress] = useState({ current: 0, total: 0 });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type === 'application/pdf') {
        setPdfFile(file);
        setError('');
      } else {
        setError('Por favor, sube un archivo PDF válido.');
        setPdfFile(null);
      }
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        // Remove the Data-URL prefix (e.g., "data:application/pdf;base64,")
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = error => reject(error);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setLoadingType('plan');
    setError('');

    const weeksNum = parseInt(weeks, 10);
    const hoursNum = parseInt(hoursPerWeek, 10);

    if (isNaN(weeksNum) || weeksNum <= 0 || isNaN(hoursNum) || hoursNum <= 0) {
      setError('Por favor, ingresa números válidos y positivos.');
      setIsLoading(false);
      return;
    }

    try {
      let plan: StudyPlan;

      if (mode === 'manual') {
        const selectedSyllabus = SYLLABUS.find(s => s.name === university);
        if (!selectedSyllabus) {
          setError('Universidad no encontrada.');
          setIsLoading(false);
          return;
        }
        plan = await generateStudyPlan(university, weeksNum, hoursNum, selectedSyllabus);
      } else {
        // PDF Mode
        if (!pdfFile) {
          setError('Por favor, selecciona un archivo PDF.');
          setIsLoading(false);
          return;
        }
        const base64 = await fileToBase64(pdfFile);
        plan = await generateStudyPlanFromPDF(base64, weeksNum, hoursNum);
      }

      saveStudyPlan(plan);
      onPlanGenerated(plan);
    } catch (err) {
      console.error(err);
      setError('Ocurrió un error al generar el plan. Asegúrate de que el PDF sea legible o revisa tu conexión.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGeneratePdfSimulator = async () => {
    if (!pdfFile) {
        setError('Por favor, selecciona un archivo PDF primero.');
        return;
    }
    setIsLoading(true);
    setLoadingType('simulator');
    setSimProgress({ current: 0, total: 80 });
    setError('');

    try {
        const base64 = await fileToBase64(pdfFile);
        const quiz = await generateSimulationFromPDF(base64, (loaded, total) => {
            setSimProgress({ current: loaded, total });
        });

        if (quiz && onStartPdfSimulator) {
            onStartPdfSimulator(quiz);
        } else {
            setError("No se pudo generar el simulador.");
        }
    } catch (err) {
        console.error(err);
        setError('Error al generar el simulador del PDF.');
    } finally {
        setIsLoading(false);
    }
  };

  if (isLoading) {
    if (loadingType === 'simulator') {
        return <ProgressLoader current={simProgress.current} total={simProgress.total} text="Generando simulador de 80 preguntas desde tu PDF..." />;
    }

    const loadingMessages = mode === 'pdf' 
      ? ["Leyendo tu documento PDF...", "Analizando el temario con IA...", "Estructurando tu plan de estudio personalizado..."]
      : ["Diseñando tu plan de estudio...", "Distribuyendo temas de manera equilibrada...", "Optimizando tu calendario..."];
      
    return (
      <div className="loading-wrapper">
        <LoadingSpinner messages={loadingMessages} />
      </div>
    );
  }

  return (
    <div className="card generator-card">
      <h2 className="generator-title">Crea tu Plan de Estudio</h2>
      
      <div className="toggle-container">
        <div className="toggle-wrapper">
          <button
            onClick={() => setMode('manual')}
            className={`toggle-btn ${mode === 'manual' ? 'active' : ''}`}
          >
            Temario Predefinido
          </button>
          <button
            onClick={() => setMode('pdf')}
            className={`toggle-btn ${mode === 'pdf' ? 'active' : ''}`}
          >
            Subir PDF
          </button>
        </div>
      </div>

      {error && <p className="alert-error">{error}</p>}

      <form onSubmit={handleSubmit} className="generator-form">
        {mode === 'manual' ? (
          <div className="form-group">
            <label htmlFor="university" className="form-label">
              1. ¿Para qué universidad te estás preparando?
            </label>
            <select
              id="university"
              value={university}
              onChange={(e) => setUniversity(e.target.value)}
              className="form-select"
            >
              {SYLLABUS.map(s => <option key={s.name} value={s.name}>{s.name}</option>)}
            </select>
          </div>
        ) : (
          <div className="form-group dashed-upload-box">
            <label htmlFor="pdfUpload" className="form-label">
              1. Sube el temario en PDF
            </label>
            <input
              type="file"
              id="pdfUpload"
              accept="application/pdf"
              onChange={handleFileChange}
              className="file-input"
            />
            <p className="upload-help-text">
              La IA analizará el documento para crear tu plan. Máximo 10MB.
            </p>
          </div>
        )}

        <div className="grid-cols-1-2">
            <div className="form-group">
            <label htmlFor="weeks" className="form-label">
                2. Semanas disponibles
            </label>
            <input
                type="number"
                id="weeks"
                value={weeks}
                onChange={(e) => setWeeks(e.target.value)}
                className="form-input"
                placeholder="Ej: 8"
                min="1"
                max="52"
            />
            </div>

            <div className="form-group">
            <label htmlFor="hoursPerWeek" className="form-label">
                3. Horas por semana
            </label>
            <input
                type="number"
                id="hoursPerWeek"
                value={hoursPerWeek}
                onChange={(e) => setHoursPerWeek(e.target.value)}
                className="form-input"
                placeholder="Ej: 10"
                min="1"
                max="40"
            />
            </div>
        </div>

        <div className="generator-actions">
            <button
            type="submit"
            className="btn btn-gradient btn-full btn-lg btn-transform"
            disabled={isLoading || (mode === 'pdf' && !pdfFile)}
            style={{ opacity: (isLoading || (mode === 'pdf' && !pdfFile)) ? 0.7 : 1, cursor: (isLoading || (mode === 'pdf' && !pdfFile)) ? 'not-allowed' : 'pointer' }}
            >
            {isLoading ? 'Generando...' : (mode === 'pdf' ? 'Analizar PDF y Crear Plan' : 'Generar Plan Automático')}
            </button>

            {mode === 'pdf' && (
                <button
                    type="button"
                    onClick={handleGeneratePdfSimulator}
                    disabled={isLoading || !pdfFile}
                    className="btn btn-green btn-full btn-lg btn-transform"
                    style={{ opacity: (isLoading || !pdfFile) ? 0.7 : 1, cursor: (isLoading || !pdfFile) ? 'not-allowed' : 'pointer' }}
                >
                    Generar Simulador del PDF (80 preguntas)
                </button>
            )}
        </div>
      </form>
    </div>
  );
};

export default StudyPlanGenerator;