import React, { useState, useRef } from 'react';
import { analyzeImageForSolution, generateAudioFromText } from '../services/geminiService';
import InlineContent from './InlineContent';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';

// Helper to decode base64 to bytes
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

// Helper to decode PCM data from Gemini API
async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number = 24000,
  numChannels: number = 1,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

interface ImageSolverProps {
    onBack: () => void;
}

const ImageSolver: React.FC<ImageSolverProps> = ({ onBack }) => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState<string>('');
  const [error, setError] = useState('');
  
  // Audio State
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
      
      // Reset states
      setExplanation(null);
      setAudioBuffer(null);
      setError('');
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = error => reject(error);
    });
  };

  const handleAnalyze = async () => {
    if (!imageFile) return;

    setIsLoading(true);
    setError('');
    setExplanation(null);
    setAudioBuffer(null);

    try {
      // 1. Analyze Image (Vision)
      setLoadingStage('Analizando imagen y resolviendo...');
      const base64 = await fileToBase64(imageFile);
      const solution = await analyzeImageForSolution(base64);
      
      setExplanation(solution.textExplanation);

      // 2. Generate Audio (TTS)
      setLoadingStage('Generando explicación de voz...');
      const audioBase64 = await generateAudioFromText(solution.audioScript);
      
      if (audioBase64) {
        // 3. Decode Audio
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        audioContextRef.current = audioCtx;
        
        const pcmBytes = decode(audioBase64);
        const buffer = await decodeAudioData(pcmBytes, audioCtx);
        setAudioBuffer(buffer);
      }

    } catch (err) {
      console.error(err);
      setError('Hubo un problema al procesar la imagen. Intenta nuevamente.');
    } finally {
      setIsLoading(false);
      setLoadingStage('');
    }
  };

  const toggleAudio = () => {
    if (!audioBuffer || !audioContextRef.current) return;

    if (isPlaying) {
      // Stop
      if (sourceNodeRef.current) {
        sourceNodeRef.current.stop();
        sourceNodeRef.current = null;
      }
      setIsPlaying(false);
    } else {
      // Play
      const source = audioContextRef.current.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContextRef.current.destination);
      source.onended = () => setIsPlaying(false);
      source.start();
      sourceNodeRef.current = source;
      setIsPlaying(true);
    }
  };

  return (
    <div className="card solver-container">
      <div className="header-row">
         <button
          onClick={onBack}
          className="btn btn-gray"
        >
          <svg className="icon-sm mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          Volver
        </button>
        <h2 className="text-2xl font-bold">
           Resolver con Foto
        </h2>
      </div>

      {!explanation && !isLoading && (
          <div className="upload-area">
            <input
                type="file"
                accept="image/*"
                capture="environment" // Opens camera on mobile
                onChange={handleFileChange}
                className="hidden"
                id="cameraInput"
            />
            <label htmlFor="cameraInput" className="upload-placeholder" style={{ cursor: 'pointer' }}>
                {previewUrl ? (
                    <img src={previewUrl} alt="Preview" className="preview-img" />
                ) : (
                    <>
                         <div className="icon-circle">
                             <svg xmlns="http://www.w3.org/2000/svg" className="icon-lg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                         </div>
                        <span className="text-xl font-semibold text-center" style={{ color: '#374151' }}>Toca aquí para tomar una foto o subir imagen</span>
                        <p className="mt-2 text-center" style={{ color: '#6b7280' }}>Resolvemos matemáticas, explicamos diagramas o resumimos textos.</p>
                    </>
                )}
            </label>
          </div>
      )}

      {/* Actions */}
      {!explanation && !isLoading && previewUrl && (
          <button
            onClick={handleAnalyze}
            className="btn btn-primary btn-xl"
          >
             <svg xmlns="http://www.w3.org/2000/svg" className="icon-md mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Analizar y Explicar
          </button>
      )}

      {isLoading && (
          <div className="mt-8 mb-8">
             <LoadingSpinner messages={[loadingStage || "Procesando..."]} />
          </div>
      )}

      {error && <ErrorMessage message={error} />}

      {explanation && (
        <div className="solution-container">
            <div className="solution-grid">
                <div className="col-image">
                     <img src={previewUrl!} alt="Source" className="source-img" />
                </div>
                <div className="col-content">
                    {audioBuffer ? (
                        <div className="audio-card">
                            <div>
                                <h3 className="font-bold text-lg" style={{ margin: 0 }}>Explicación de Audio</h3>
                                <p style={{ fontSize: '0.875rem', opacity: 0.9, margin: 0 }}>Escucha la solución paso a paso</p>
                            </div>
                            <button
                                onClick={toggleAudio}
                                className="audio-play-btn"
                            >
                                {isPlaying ? (
                                     <svg xmlns="http://www.w3.org/2000/svg" className="icon-md" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="icon-md" style={{ marginLeft: '2px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    ) : (
                        <div className="mb-4 p-4 bg-gray-100 rounded text-center text-gray-500">
                            No se pudo generar el audio.
                        </div>
                    )}
                    
                    <div className="explanation-box">
                         <h3 className="explanation-header">Solución Detallada</h3>
                         <div style={{ lineHeight: '1.6' }}>
                             <InlineContent text={explanation} />
                         </div>
                    </div>
                </div>
            </div>
            
            <div className="text-center mt-8">
                 <button
                    onClick={() => {
                        setExplanation(null);
                        setAudioBuffer(null);
                        setImageFile(null);
                        setPreviewUrl(null);
                    }}
                    className="btn btn-gray btn-lg"
                  >
                    Resolver Otro Problema
                  </button>
            </div>
        </div>
      )}
    </div>
  );
};

export default ImageSolver;