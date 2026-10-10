import { Component, output, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GeminiService } from '../../core/services/gemini.service';
import { NotificationService } from '../../core/services/notification.service';
import { AudioTranscriberComponent } from '../../shared/components/audio-transcriber/audio-transcriber.component';

@Component({
  selector: 'app-quick-demo',
  standalone: true,
  imports: [CommonModule, FormsModule, AudioTranscriberComponent],
  templateUrl: './quick-demo.component.html',
})
export class QuickDemoComponent {
  private readonly geminiService = inject(GeminiService);
  private readonly notificationService = inject(NotificationService);

  readonly switchToFullApp = output<void>();
  readonly openTimer = output<void>();
  readonly openNotifications = output<void>();

  demoHours = 8;
  milestones = signal([
    { id: 1, title: 'Lógica Estructural & JSON Schema', hours: 10, done: true },
    { id: 2, title: 'HTTP/REST & Flujos OAuth2', hours: 10, done: false },
    { id: 3, title: 'Ingeniería de Prompts & CoT', hours: 12, done: false },
  ]);

  aiQuestion = '';
  useSearchInDemo = false;
  aiResponse = signal<string>(
    '¡Hola! Soy tu mentor IA. Puedes preguntarme cómo organizar tus 8h semanales, activar búsqueda en Google, o usar el micrófono para dictarme tu duda.'
  );
  aiLoading = signal<boolean>(false);

  get completedCount(): number {
    return this.milestones().filter((m) => m.done).length;
  }

  toggleMilestone(id: number): void {
    this.milestones.update((list) =>
      list.map((m) => (m.id === id ? { ...m, done: !m.done } : m))
    );
  }

  simulateReminder(): void {
    this.notificationService.simulateStudyReminder();
    this.openNotifications.emit();
  }

  async askMiniMentor(): Promise<void> {
    if (!this.aiQuestion.trim() || this.aiLoading()) return;

    this.aiLoading.set(true);
    const q = this.aiQuestion;
    this.aiQuestion = '';

    try {
      const res = await this.geminiService.sendChatMessage({
        messages: [{ role: 'user', text: q }],
        useGoogleSearch: this.useSearchInDemo,
        systemInstruction:
          'Eres un mentor de estudio técnico conciso y alentador. Responde en máximo 3 oraciones orientadas a la acción.',
      });
      this.aiResponse.set(res.response);
    } catch (e: any) {
      this.aiResponse.set(`Error conectando con Gemini: ${e.message}`);
    } finally {
      this.aiLoading.set(false);
    }
  }

  onVoiceTranscribed(text: string): void {
    this.aiQuestion = text;
    this.askMiniMentor();
  }
}
