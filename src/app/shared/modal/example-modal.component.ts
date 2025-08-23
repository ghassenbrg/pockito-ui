import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface ExampleModalData {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
}

export interface ExampleModalResult {
  confirmed: boolean;
  data?: any;
}

@Component({
  selector: 'app-example-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="example-modal">
      <div class="modal-header">
        <h3 class="text-lg font-semibold text-gray-900">{{ data.title }}</h3>
      </div>
      
      <div class="modal-body">
        <p class="text-gray-600 mb-4">{{ data.message }}</p>
        
        <div class="form-group" *ngIf="showInput">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Additional Information
          </label>
          <input 
            type="text" 
            [(ngModel)]="inputValue"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter additional information..."
          >
        </div>
      </div>
      
      <div class="modal-footer">
        <button 
          type="button"
          (click)="onCancel()"
          class="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors duration-200"
        >
          {{ data.cancelText || 'Cancel' }}
        </button>
        
        <button 
          type="button"
          (click)="onConfirm()"
          class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 ml-3"
        >
          {{ data.confirmText || 'Confirm' }}
        </button>
      </div>
    </div>
  `,
  styles: [`
    .example-modal {
      min-width: 400px;
    }
    
    .modal-header {
      border-bottom: 1px solid #e5e7eb;
      padding-bottom: 1rem;
      margin-bottom: 1rem;
    }
    
    .modal-body {
      margin-bottom: 1.5rem;
    }
    
    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
    }
    
    .form-group {
      margin-bottom: 1rem;
    }
    
    @media (max-width: 640px) {
      .example-modal {
        min-width: 300px;
      }
    }
  `]
})
export class ExampleModalComponent {
  @Input() data: ExampleModalData = {
    title: 'Example Modal',
    message: 'This is an example modal component.'
  };
  
  @Input() showInput = false;
  
  @Output() result = new EventEmitter<ExampleModalResult>();
  
  inputValue = '';

  onConfirm(): void {
    this.result.emit({
      confirmed: true,
      data: this.showInput ? this.inputValue : undefined
    });
  }

  onCancel(): void {
    this.result.emit({
      confirmed: false
    });
  }
}
