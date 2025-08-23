import { Injectable, NgZone } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class FocusTrapService {
  private focusableElements: HTMLElement[] = [];
  private firstFocusableElement: HTMLElement | null = null;
  private lastFocusableElement: HTMLElement | null = null;
  private previouslyFocusedElement: HTMLElement | null = null;
  private focusTrapElement: HTMLElement | null = null;

  constructor(private ngZone: NgZone) {}

  /**
   * Activates focus trap on the specified element
   */
  activate(element: HTMLElement): void {
    this.focusTrapElement = element;
    this.previouslyFocusedElement = document.activeElement as HTMLElement;
    
    // Get all focusable elements within the modal
    this.updateFocusableElements();
    
    // Focus the first focusable element
    if (this.firstFocusableElement) {
      this.firstFocusableElement.focus();
    }

    // Add event listeners
    this.addEventListeners();
  }

  /**
   * Deactivates focus trap and restores focus
   */
  deactivate(): void {
    this.removeEventListeners();
    
    // Restore focus to previously focused element
    if (this.previouslyFocusedElement && this.isElementVisible(this.previouslyFocusedElement)) {
      this.previouslyFocusedElement.focus();
    }
    
    // Clean up
    this.focusableElements = [];
    this.firstFocusableElement = null;
    this.lastFocusableElement = null;
    this.previouslyFocusedElement = null;
    this.focusTrapElement = null;
  }

  /**
   * Updates the list of focusable elements
   */
  private updateFocusableElements(): void {
    if (!this.focusTrapElement) return;

    const selector = [
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      'a[href]',
      'area[href]',
      'iframe',
      'object',
      'embed',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]'
    ].join(', ');

    this.focusableElements = Array.from(
      this.focusTrapElement.querySelectorAll(selector)
    ).filter((el): el is HTMLElement => {
      return this.isElementVisible(el as HTMLElement);
    });

    if (this.focusableElements.length > 0) {
      this.firstFocusableElement = this.focusableElements[0];
      this.lastFocusableElement = this.focusableElements[this.focusableElements.length - 1];
    }
  }

  /**
   * Checks if an element is visible
   */
  private isElementVisible(element: HTMLElement): boolean {
    const style = window.getComputedStyle(element);
    return style.display !== 'none' && 
           style.visibility !== 'hidden' && 
           element.offsetParent !== null;
  }

  /**
   * Adds event listeners for keyboard navigation
   */
  private addEventListeners(): void {
    this.ngZone.runOutsideAngular(() => {
      document.addEventListener('keydown', this.handleKeyDown);
    });
  }

  /**
   * Removes event listeners
   */
  private removeEventListeners(): void {
    document.removeEventListener('keydown', this.handleKeyDown);
  }

  /**
   * Handles keyboard navigation
   */
  private handleKeyDown = (event: KeyboardEvent): void => {
    if (!this.focusTrapElement || !this.focusableElements.length) return;

    // Handle Tab key for focus cycling
    if (event.key === 'Tab') {
      event.preventDefault();
      
      if (event.shiftKey) {
        // Shift + Tab: move to previous element
        if (document.activeElement === this.firstFocusableElement) {
          this.lastFocusableElement?.focus();
        } else {
          const currentIndex = this.focusableElements.indexOf(document.activeElement as HTMLElement);
          const previousIndex = currentIndex > 0 ? currentIndex - 1 : this.focusableElements.length - 1;
          this.focusableElements[previousIndex]?.focus();
        }
      } else {
        // Tab: move to next element
        if (document.activeElement === this.lastFocusableElement) {
          this.firstFocusableElement?.focus();
        } else {
          const currentIndex = this.focusableElements.indexOf(document.activeElement as HTMLElement);
          const nextIndex = currentIndex < this.focusableElements.length - 1 ? currentIndex + 1 : 0;
          this.focusableElements[nextIndex]?.focus();
        }
      }
    }
  };

  /**
   * Refreshes the focus trap (useful when modal content changes)
   */
  refresh(): void {
    if (this.focusTrapElement) {
      this.updateFocusableElements();
    }
  }
}
