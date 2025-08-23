import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalService, ModalData } from './modal.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-modal-host',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Transaction Modal -->
    <div 
      *ngIf="currentModal?.type === 'transaction-modal'"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      (click)="closeModal()"
    >
      <div 
        class="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
        (click)="$event.stopPropagation()"
      >
        <div class="p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-gray-900">Add Transaction</h3>
            <button 
              (click)="closeModal()"
              class="text-gray-400 hover:text-gray-600 transition-colors duration-200"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          
          <!-- Transaction Form Placeholder -->
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="EXPENSE">Expense</option>
                <option value="INCOME">Income</option>
                <option value="TRANSFER">Transfer</option>
              </select>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Amount</label>
              <input 
                type="number" 
                step="0.01" 
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
              >
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Note</label>
              <input 
                type="text" 
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Transaction description"
              >
            </div>
            
            <div class="flex space-x-3 pt-4">
              <button 
                (click)="closeModal()"
                class="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors duration-200"
              >
                Cancel
              </button>
              <button 
                class="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
              >
                Save Transaction
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class ModalHostComponent implements OnInit, OnDestroy {
  currentModal: ModalData | null = null;
  private subscription = new Subscription();

  constructor(private modalService: ModalService) {}

  ngOnInit(): void {
    this.subscription.add(
      this.modalService.onOpen().subscribe(modal => {
        this.currentModal = modal;
      })
    );

    this.subscription.add(
      this.modalService.onClose().subscribe(() => {
        this.currentModal = null;
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  closeModal(): void {
    this.modalService.close();
  }
}
