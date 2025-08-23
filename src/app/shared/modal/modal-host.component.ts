import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ComponentRef,
  HostListener,
  OnDestroy,
  OnInit,
  SimpleChanges,
  ViewChild,
  ViewContainerRef
} from '@angular/core';
import { Subscription } from 'rxjs';
import { FocusTrapService } from './focus-trap.service';
import { ModalInstance, ModalService } from './modal.service';

@Component({
  selector: 'app-modal-host',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      *ngFor="let modal of activeModals; trackBy: trackByModalId"
      class="modal-overlay"
      [class]="modal.config.modalClass || ''"
      [attr.aria-modal]="true"
      [attr.aria-labelledby]="'modal-title-' + modal.config.id"
      [attr.aria-describedby]="'modal-content-' + modal.config.id"
      role="dialog"
      tabindex="-1"
      (click)="onBackdropClick($event, modal)"
      (keydown)="onKeyDown($event)"
    >
      <div
        #modalContent
        class="modal-content"
        [class]="modal.config.contentClass || ''"
        (click)="$event.stopPropagation()"
        role="document"
        [attr.id]="'modal-content-' + modal.config.id"
      >
        <!-- Modal Header -->
        <div
          class="modal-header"
          *ngIf="modal.config.title || modal.config.showCloseButton"
        >
          <h2
            *ngIf="modal.config.title"
            class="modal-title"
            [id]="'modal-title-' + modal.config.id"
          >
            {{ modal.config.title }}
          </h2>

          <button
            *ngIf="modal.config.showCloseButton"
            type="button"
            class="modal-close-btn"
            (click)="closeModal(modal.config.id)"
            [attr.aria-label]="'Close ' + (modal.config.title || 'modal')"
            tabindex="0"
          >
            <svg
              class="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              ></path>
            </svg>
          </button>
        </div>

        <!-- Modal Body -->
        <div class="modal-body">
          <!-- Component-based modal -->
          <ng-container *ngIf="modal.config.component">
            <ng-container #componentContainer></ng-container>
          </ng-container>

          <!-- Template-based modal -->
          <ng-container *ngIf="modal.config.template">
            <ng-container
              [ngTemplateOutlet]="modal.config.template"
              [ngTemplateOutletContext]="modal.config.data"
            ></ng-container>
          </ng-container>

          <!-- Legacy type-based modal -->
          <ng-container
            *ngIf="!modal.config.component && !modal.config.template"
          >
            <div class="legacy-modal-content">
              <p class="text-gray-600">{{ modal.config.title }}</p>
              <div *ngIf="modal.config.data" class="mt-4">
                <pre class="text-sm bg-gray-100 p-2 rounded">{{
                  modal.config.data | json
                }}</pre>
              </div>
            </div>
          </ng-container>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1050;
        padding: 1rem;
      }

      .modal-content {
        background: white;
        border-radius: 0.5rem;
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1),
          0 10px 10px -5px rgba(0, 0, 0, 0.04);
        max-width: 90vw;
        max-height: 90vh;
        overflow-y: auto;
        position: relative;
        outline: none;
      }

      .modal-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 1.5rem 1.5rem 0 1.5rem;
        border-bottom: 1px solid #e5e7eb;
        margin-bottom: 1rem;
      }

      .modal-title {
        font-size: 1.125rem;
        font-weight: 600;
        color: #111827;
        margin: 0;
      }

      .modal-close-btn {
        background: none;
        border: none;
        color: #6b7280;
        cursor: pointer;
        padding: 0.25rem;
        border-radius: 0.25rem;
        transition: all 0.2s;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .modal-close-btn:hover {
        color: #374151;
        background-color: #f3f4f6;
      }

      .modal-close-btn:focus {
        outline: 2px solid #3b82f6;
        outline-offset: 2px;
      }

      .modal-body {
        padding: 0 1.5rem 1.5rem 1.5rem;
      }

      .legacy-modal-content {
        min-width: 300px;
      }

      /* Responsive adjustments */
      @media (max-width: 640px) {
        .modal-overlay {
          padding: 0.5rem;
        }

        .modal-content {
          max-width: 95vw;
          max-height: 95vh;
        }

        .modal-header,
        .modal-body {
          padding-left: 1rem;
          padding-right: 1rem;
        }
      }

      /* Focus styles for accessibility */
      .modal-content:focus {
        outline: 2px solid #3b82f6;
        outline-offset: 2px;
      }
    `,
  ],
})
export class ModalHostComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('componentContainer', { read: ViewContainerRef, static: false })
  componentContainer!: ViewContainerRef;

  activeModals: ModalInstance[] = [];
  private subscription = new Subscription();
  private modalComponentRefs = new Map<string, ComponentRef<any>>();

  constructor(
    private modalService: ModalService,
    private focusTrapService: FocusTrapService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.subscription.add(
      this.modalService.getActiveModals().subscribe((modals) => {
        this.activeModals = modals;
        this.cdr.detectChanges();
      })
    );
  }

  ngAfterViewInit(): void {
    // Process any modals that were already active
    this.processActiveModals();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();

    // Clean up component references
    this.modalComponentRefs.forEach((ref) => ref.destroy());
    this.modalComponentRefs.clear();
  }

  /**
   * Process active modals and create component instances
   */
  private processActiveModals(): void {
    this.activeModals.forEach((modal) => {
      if (
        modal.config.component &&
        !this.modalComponentRefs.has(modal.config.id)
      ) {
        this.createModalComponent(modal);
      }
    });
  }

  /**
   * Create a component instance for a modal
   */
  private createModalComponent(modal: ModalInstance): void {
    if (!modal.config.component || !this.componentContainer) return;

    try {
      const componentRef = this.componentContainer.createComponent(
        modal.config.component
      );

      // Pass data to component if it has an input
      if (modal.config.data && componentRef.instance) {
        Object.assign(componentRef.instance, modal.config.data);
      }

      // Store component reference
      this.modalComponentRefs.set(modal.config.id, componentRef);
      this.modalService.registerModalComponent(modal.config.id, componentRef);

      // Activate focus trap if enabled
      if (modal.config.trapFocus) {
        setTimeout(() => {
          const modalElement = this.getModalElement(modal.config.id);
          if (modalElement) {
            this.modalService.activateFocusTrap(modalElement);
          }
        }, 100);
      }
    } catch (error) {
      console.error('Error creating modal component:', error);
    }
  }

  /**
   * Get modal element by ID
   */
  private getModalElement(modalId: string): HTMLElement | null {
    return document.querySelector(`[id="modal-content-${modalId}"]`);
  }

  /**
   * Handle backdrop click
   */
  onBackdropClick(event: MouseEvent, modal: ModalInstance): void {
    if (
      modal.config.closeOnBackdropClick &&
      event.target === event.currentTarget
    ) {
      this.closeModal(modal.config.id);
    }
  }

  /**
   * Handle keyboard events
   */
  @HostListener('document:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    // Handle Escape key for closing modals
    if (event.key === 'Escape' && this.activeModals.length > 0) {
      const topModal = this.activeModals[this.activeModals.length - 1];
      if (topModal.config.closeOnEscape) {
        this.closeModal(topModal.config.id);
      }
    }
  }

  /**
   * Close a specific modal
   */
  closeModal(modalId: string): void {
    this.modalService.close(modalId);
  }

  /**
   * Track modal by ID for ngFor
   */
  trackByModalId(index: number, modal: ModalInstance): string {
    return modal.config.id;
  }

  /**
   * Handle changes in modal configuration
   */
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['activeModals']) {
      this.processActiveModals();
    }
  }
}
