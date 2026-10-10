import { Component, output, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GeminiService } from '../../../core/services/gemini.service';

@Component({
  selector: 'app-audio-transcriber',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      type="button"
      (click)="toggleRecording()"
      [disabled]="isTranscribing()"
      [class]="
        isRecording()
          ? 'bg-rose-600 text-white animate-pulse'
          : isTranscribing()
          ? 'bg-amber-600/30 text-amber-300'
          : 'bg-[#1b1e2c] text-slate-300 hover:text-white hover:bg-[#25293d]'
      "
      class="p-2 rounded-xl border border-[#2a2e40] transition-all flex items-center justify-center disabled:opacity-50"
      [title]="isRecording() ? 'Detener grabación' : 'Dictar por voz'"
    >
      @if (isTranscribing()) {
        <svg class="w-4 h-4 animate-spin text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10" stroke-opacity="0.25" />
          <path d="M12 2a10 10 0 0 1 10 10" />
        </svg>
      } @else if (isRecording()) {
        <svg class="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="6" y="6" width="12" height="12" rx="2" />
        </svg>
      } @else {
        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
          <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
          <line x1="12" y1="19" x2="12" y2="22" />
        </svg>
      }
    </button>
  `,
})
export class AudioTranscriberComponent {
  private readonly geminiService = inject(GeminiService);

  readonly textTranscribed = output<string>();

  readonly isRecording = signal<boolean>(false);
  readonly isTranscribing = signal<boolean>(false);

  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];

  async toggleRecording(): Promise<void> {
    if (this.isRecording()) {
      this.stopRecording();
    } else {
      await this.startRecording();
    }
  }

  private async startRecording(): Promise<void> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.audioChunks = [];
      const mr = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4',
      });
      this.mediaRecorder = mr;

      mr.ondataavailable = (e) => {
        if (e.data.size > 0) this.audioChunks.push(e.data);
      };

      mr.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(this.audioChunks, { type: mr.mimeType || 'audio/webm' });
        this.isTranscribing.set(true);
        try {
          const text = await this.geminiService.transcribeAudio(blob);
          if (text) {
            this.textTranscribed.emit(text);
          }
        } catch (e) {
          console.error(e);
        } finally {
          this.isTranscribing.set(false);
        }
      };

      mr.start();
      this.isRecording.set(true);
    } catch (e) {
      console.warn('Mic permission error:', e);
    }
  }

  private stopRecording(): void {
    if (this.mediaRecorder && this.isRecording()) {
      this.mediaRecorder.stop();
      this.isRecording.set(false);
    }
  }
}
