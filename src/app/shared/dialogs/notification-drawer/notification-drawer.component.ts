import { Component, output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StorageService } from '../../../core/services/storage.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-notification-drawer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notification-drawer.component.html',
})
export class NotificationDrawerComponent {
  readonly storage = inject(StorageService);
  private readonly notificationService = inject(NotificationService);

  readonly close = output<void>();

  markAllRead(): void {
    this.storage.markAllNotificationsRead();
  }

  clearAll(): void {
    this.storage.clearNotifications();
  }

  simulateReminder(): void {
    this.notificationService.simulateStudyReminder();
  }
}
