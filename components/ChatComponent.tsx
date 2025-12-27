import React, { useState, useEffect, useRef } from 'react';
import { Chat } from '@google/genai';
import { startChatSession, explainSimpler } from '../services/geminiService';
import type { ChatMessage } from '../types';
import InlineContent from './InlineContent';

interface ChatComponentProps {
  lessonContent: string;
}

const ChatComponent: React.FC<ChatComponentProps> = ({ lessonContent }) => {
  const [chat, setChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSimplifying, setIsSimplifying] = useState(false);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const chatSession = startChatSession(lessonContent);
    setChat(chatSession);
    setMessages([
      {
        role: 'model',
        content: '¡Hola! Soy tu tutor de IA. He leído la lección. ¿Tienes alguna pregunta o hay algo que no quedó claro?'
      }
    ]);
  }, [lessonContent]);

  useEffect(() => {
    // Scroll to the bottom
    messagesContainerRef.current?.lastElementChild?.scrollIntoView({ behavior: 'smooth' });
    
    // Run MathJax on the container after messages update
    if (messagesContainerRef.current && typeof (window as any).MathJax?.typesetPromise === 'function') {
        (window as any).MathJax.typesetPromise([messagesContainerRef.current]).catch((err: any) => console.error('MathJax typeset error in chat:', err));
    }
  }, [messages, isLoading, isSimplifying]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || !chat || isLoading || isSimplifying) return;

    const newUserMessage: ChatMessage = { role: 'user', content: userInput };
    setMessages(prev => [...prev, newUserMessage]);
    setUserInput('');
    setIsLoading(true);

    try {
      const stream = await chat.sendMessageStream({ message: userInput });
      
      let modelResponse = '';
      setMessages(prev => [...prev, { role: 'model', content: '' }]);

      for await (const chunk of stream) {
        modelResponse += chunk.text;
        setMessages(prev => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1].content = modelResponse;
          return newMessages;
        });
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, { role: 'model', content: 'Lo siento, he encontrado un error. Por favor, intenta de nuevo.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExplainSimpler = async () => {
    const lastModelMessage = [...messages].reverse().find(m => m.role === 'model');
    if (!lastModelMessage || !lastModelMessage.content || isLoading || isSimplifying) return;
    
    setIsSimplifying(true);
    try {
        const simplifiedText = await explainSimpler(lastModelMessage.content);
        setMessages(prev => [...prev, {role: 'model', content: `**En términos más sencillos:**\n\n${simplifiedText}`}]);
    } catch (error) {
        console.error("Error simplifying text:", error);
        setMessages(prev => [...prev, { role: 'model', content: 'Lo siento, no pude simplificar esa explicación en este momento.' }]);
    } finally {
        setIsSimplifying(false);
    }
  };

  const lastMessageWasFromModel = messages.length > 0 && messages[messages.length - 1].role === 'model' && !isLoading;

  return (
    <div className="chat-container">
      <h3 className="text-xl font-bold text-center mb-4">¿Tienes alguna duda?</h3>
      <div ref={messagesContainerRef} className="chat-messages">
        {messages.map((msg, index) => (
          <div key={index} className={`chat-row ${msg.role}`}>
            <div className={`chat-bubble ${msg.role}`}>
              <InlineContent text={msg.content} />
            </div>
          </div>
        ))}
        {(isLoading || isSimplifying) && (
          <div className="chat-row model">
            <div className="chat-loading">
                <span className="chat-dot"></span>
                <span className="chat-dot"></span>
                <span className="chat-dot"></span>
            </div>
          </div>
        )}
      </div>
       <div className="chat-input-form">
            <form onSubmit={handleSendMessage} className="flex-grow flex items-center gap-2">
                <input
                  type="text"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  placeholder="Escribe tu pregunta aquí..."
                  className="chat-input"
                  disabled={isLoading || isSimplifying}
                />
                <button
                  type="submit"
                  disabled={isLoading || isSimplifying || !userInput.trim()}
                  className="chat-send-btn"
                  aria-label="Enviar mensaje"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                  </svg>
                </button>
            </form>
             <button
                onClick={handleExplainSimpler}
                disabled={!lastMessageWasFromModel || isSimplifying}
                className="btn-simplify"
                aria-label="Explícamelo fácil"
                title="Explícamelo Fácil"
             >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 7a1 1 0 100 2h6a1 1 0 100-2H7zM7 11a1 1 0 100 2h2a1 1 0 100-2H7z" clipRule="evenodd" />
                </svg>
             </button>
       </div>
    </div>
  );
};

export default ChatComponent;