export interface ModalConfig {
  /** Unique identifier for the modal */
  id: string;
  /** Modal title for screen readers */
  title: string;
  /** Whether the modal can be closed by clicking outside */
  closeOnBackdropClick?: boolean;
  /** Whether the modal can be closed with the Escape key */
  closeOnEscape?: boolean;
  /** Whether to show the close button */
  showCloseButton?: boolean;
  /** CSS classes to apply to the modal */
  modalClass?: string;
  /** CSS classes to apply to the modal content */
  contentClass?: string;
  /** Whether to trap focus within the modal */
  trapFocus?: boolean;
  /** Whether to restore focus when modal closes */
  restoreFocus?: boolean;
  /** Element to restore focus to when modal closes */
  restoreFocusElement?: HTMLElement;
  /** Data to pass to the modal component */
  data?: any;
  /** Component type to render */
  component?: any;
  /** Template to render */
  template?: any;
}

export interface ModalInstance {
  /** Modal configuration */
  config: ModalConfig;
  /** Modal component instance */
  componentRef?: any;
  /** Whether the modal is currently open */
  isOpen: boolean;
  /** Timestamp when modal was opened */
  openedAt: number;
}

export interface ModalResult<T = any> {
  /** ID of the modal this result belongs to */
  modalId: string;
  /** Whether the modal was confirmed/approved */
  confirmed: boolean;
  /** Data returned from the modal */
  data?: T;
  /** Error if any occurred */
  error?: any;
}
