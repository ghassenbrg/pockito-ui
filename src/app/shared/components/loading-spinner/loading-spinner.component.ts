import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="isLoading" class="loading-overlay" [class.fullscreen]="fullscreen">
      <div class="loading-spinner">
        <i class="pi pi-spin pi-spinner"></i>
        <div *ngIf="messages && messages.length > 0" class="loading-messages">
          <span *ngFor="let message of distinctMessages" class="loading-message">{{ message }}</span>
        </div>
        <span *ngIf="message && (!messages || messages.length === 0)" class="loading-message">{{ message }}</span>
      </div>
    </div>
  `,
  styles: [`
    .loading-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 9999;
    }

    .loading-overlay:not(.fullscreen) {
      position: absolute;
      background: rgba(0, 0, 0, 0.3);
    }

    .loading-spinner {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
      padding: 24px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
      min-width: 200px;
    }

    .loading-spinner i {
      font-size: 2rem;
      color: #3b82f6;
    }

    .loading-messages {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
    }

    .loading-message {
      font-size: 1rem;
      color: #374151;
      text-align: center;
      font-weight: 500;
    }

    @media (max-width: 768px) {
      .loading-spinner {
        min-width: 160px;
        padding: 20px;
      }
      
      .loading-spinner i {
        font-size: 1.5rem;
      }
      
      .loading-message {
        font-size: 0.9rem;
      }
    }
  `]
})
export class LoadingSpinnerComponent implements OnChanges {
  @Input() isLoading: boolean = false;
  @Input() message: string = '';
  @Input() messages: string[] = [];
  @Input() fullscreen: boolean = true;

  distinctMessages: string[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['messages']) {
      this.updateDistinctMessages();
    }
  }

  private updateDistinctMessages(): void {
    if (!this.messages || this.messages.length === 0) {
      this.distinctMessages = [];
    } else {
      this.distinctMessages = [...new Set(this.messages)];
    }
  }
}
