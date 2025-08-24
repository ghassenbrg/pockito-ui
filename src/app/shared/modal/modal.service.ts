import { Injectable, ComponentRef, Type, TemplateRef, ViewContainerRef, Injector, EmbeddedViewRef } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { ModalConfig, ModalInstance, ModalResult } from './modal.interface';
import { FocusTrapService } from './focus-trap.service';

// Re-export interfaces for convenience
export { ModalConfig, ModalInstance, ModalResult } from './modal.interface';

@Injectable({
  providedIn: 'root'
})
export class ModalService {
  private modals$ = new BehaviorSubject<ModalInstance[]>([]);
  private modalResults$ = new Subject<ModalResult>();
  private activeModals: Map<string, ModalInstance> = new Map();
  private modalComponentRefs: Map<string, ComponentRef<any>> = new Map();

  constructor(
    private injector: Injector,
    private focusTrapService: FocusTrapService
  ) {}

  /**
   * Opens a modal with the specified configuration
   */
  open(config: ModalConfig): Observable<ModalResult> {
    // Set default values
    const modalConfig: ModalConfig = {
      closeOnBackdropClick: true,
      closeOnEscape: true,
      showCloseButton: true,
      trapFocus: true,
      restoreFocus: true,
      ...config
    };

    // Create modal instance
    const modalInstance: ModalInstance = {
      config: modalConfig,
      isOpen: true,
      openedAt: Date.now()
    };

    // Store modal instance
    this.activeModals.set(modalConfig.id, modalInstance);
    this.updateModalsSubject();

    // Return observable for modal result
    return new Observable<ModalResult>(observer => {
      const subscription = this.modalResults$.subscribe(result => {
        // Check if this result is for this specific modal
        if (result && result.modalId === modalConfig.id) {
          observer.next(result);
          observer.complete();
          subscription.unsubscribe();
        }
      });

      // Return cleanup function
      return () => subscription.unsubscribe();
    });
  }

  /**
   * Opens a modal with a component
   */
  openComponent<T = any>(
    component: Type<T>,
    config: Omit<ModalConfig, 'component'>
  ): Observable<ModalResult> {
    // Close any existing modal with the same ID to prevent conflicts
    if (config.id && this.activeModals.has(config.id)) {
      this.close(config.id);
    }
    
    return this.open({
      ...config,
      component
    });
  }

  /**
   * Opens a modal with a template
   */
  openTemplate<T = any>(
    template: TemplateRef<T>,
    config: Omit<ModalConfig, 'template'>
  ): Observable<ModalResult> {
    return this.open({
      ...config,
      template
    });
  }

  /**
   * Closes a specific modal
   */
  close(modalId: string, result?: ModalResult): void {
    const modalInstance = this.activeModals.get(modalId);
    if (!modalInstance) return;

    // Deactivate focus trap
    if (modalInstance.config.trapFocus) {
      this.focusTrapService.deactivate();
    }

    // Clean up component reference
    const componentRef = this.modalComponentRefs.get(modalId);
    if (componentRef) {
      componentRef.destroy();
      this.modalComponentRefs.delete(modalId);
    }

    // Remove modal instance
    this.activeModals.delete(modalId);
    this.updateModalsSubject();

    // Emit result
    if (result) {
      this.modalResults$.next({
        ...result,
        modalId: modalId
      });
    }
  }

  /**
   * Closes all open modals
   */
  closeAll(): void {
    this.activeModals.forEach((modal, id) => {
      this.close(id);
    });
  }

  /**
   * Gets all active modals
   */
  getActiveModals(): Observable<ModalInstance[]> {
    return this.modals$.asObservable();
  }

  /**
   * Checks if a modal is open
   */
  isModalOpen(modalId: string): boolean {
    return this.activeModals.has(modalId);
  }

  /**
   * Gets the count of open modals
   */
  getOpenModalCount(): number {
    return this.activeModals.size;
  }

  /**
   * Registers a modal component reference
   */
  registerModalComponent(modalId: string, componentRef: ComponentRef<any>): void {
    this.modalComponentRefs.set(modalId, componentRef);
  }

  /**
   * Gets a modal component reference
   */
  getModalComponent(modalId: string): ComponentRef<any> | undefined {
    return this.modalComponentRefs.get(modalId);
  }

  /**
   * Activates focus trap for a modal
   */
  activateFocusTrap(element: HTMLElement): void {
    this.focusTrapService.activate(element);
  }

  /**
   * Deactivates focus trap
   */
  deactivateFocusTrap(): void {
    this.focusTrapService.deactivate();
  }

  /**
   * Refreshes focus trap (useful when modal content changes)
   */
  refreshFocusTrap(): void {
    this.focusTrapService.refresh();
  }

  /**
   * Updates the modals subject
   */
  private updateModalsSubject(): void {
    this.modals$.next(Array.from(this.activeModals.values()));
  }

  /**
   * Legacy method for backward compatibility
   */
  openLegacy(type: string, data?: any): void {
    this.open({
      id: `legacy-${Date.now()}`,
      title: type,
      data
    });
  }

  /**
   * Legacy method for backward compatibility
   */
  closeLegacy(): void {
    // Close the most recently opened modal
    const modals = Array.from(this.activeModals.entries());
    if (modals.length > 0) {
      const [modalId] = modals[modals.length - 1];
      this.close(modalId);
    }
  }

  /**
   * Legacy method for backward compatibility
   */
  onOpen() {
    return this.modals$.asObservable();
  }

  /**
   * Legacy method for backward compatibility
   */
  onClose() {
    return this.modalResults$.asObservable();
  }
}
