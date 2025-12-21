import React, { useState, useRef, useEffect } from 'react';
import '../styles/VoiceInput.css';

const VoiceInput = ({ onVoiceInput, disabled = false }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      setIsSupported(true);
      recognitionRef.current = new SpeechRecognition();
      
      const recognition = recognitionRef.current;
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        setError('');
        setTranscript('');
      };

      recognition.onresult = (event) => {
        let interimTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcriptSegment = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            setTranscript((prev) => prev + transcriptSegment + ' ');
          } else {
            interimTranscript += transcriptSegment;
          }
        }
      };

      recognition.onerror = (event) => {
        setError(`Error: ${event.error}`);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      return () => {
        if (recognition) {
          recognition.abort();
        }
      };
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
      if (transcript.trim()) {
        onVoiceInput(transcript.trim());
        setTranscript('');
      }
    } else {
      recognitionRef.current.start();
    }
  };

  if (!isSupported) {
    return null;
  }

  return (
    <div className="voice-input-wrapper">
      <button
        className={`voice-input-button ${isListening ? 'listening' : ''}`}
        onClick={toggleListening}
        disabled={disabled}
        title={isListening ? 'Stop listening' : 'Start voice input'}
        aria-label="Voice input"
      >
        <i className={`fas fa-${isListening ? 'stop-circle' : 'microphone'}`}></i>
      </button>
      {isListening && (
        <div className="voice-indicator">
          <span className="pulse"></span>
          <span className="voice-text">Listening...</span>
        </div>
      )}
      {error && <div className="voice-error">{error}</div>}
    </div>
  );
};

export default VoiceInput;
