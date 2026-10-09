import React, { useState, useRef } from 'react';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { ApiService } from '../../services/apiService';

interface AudioTranscriberButtonProps {
  onTranscription: (text: string) => void;
  className?: string;
  size?: 'sm' | 'md';
}

export const AudioTranscriberButton: React.FC<AudioTranscriberButtonProps> = ({
  onTranscription,
  className = '',
  size = 'md',
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4',
      });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        // Stop all tracks
        stream.getTracks().forEach((track) => track.stop());

        const audioBlob = new Blob(audioChunksRef.current, {
          type: mediaRecorder.mimeType || 'audio/webm',
        });

        setIsTranscribing(true);
        try {
          const transcribedText = await ApiService.transcribeAudio(audioBlob);
          if (transcribedText) {
            onTranscription(transcribedText);
          }
        } catch (error) {
          console.error('Transcription error:', error);
        } finally {
          setIsTranscribing(false);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.warn('Microphone permission denied or not available:', err);
      alert('Por favor concede permisos de micrófono en tu navegador para dictar por voz.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  if (isTranscribing) {
    return (
      <button
        type="button"
        disabled
        title="Transcribiendo audio con gemini-3.5-transcribe..."
        className={`inline-flex items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 p-2.5 transition-all ${className}`}
      >
        <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={isRecording ? stopRecording : startRecording}
      title={isRecording ? 'Detener grabación y transcribir' : 'Dictar por voz (gemini-3.5-transcribe)'}
      className={`inline-flex items-center justify-center rounded-xl transition-all ${
        isRecording
          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/50 animate-pulse p-2.5'
          : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/80 hover:text-white p-2.5'
      } ${className}`}
    >
      {isRecording ? (
        <MicOff className="w-4 h-4 text-rose-400" />
      ) : (
        <Mic className="w-4 h-4 text-slate-300 hover:text-indigo-300" />
      )}
    </button>
  );
};
