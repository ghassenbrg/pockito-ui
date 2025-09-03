export interface ToastMessage {
  severity: 'success' | 'info' | 'warn' | 'error';
  summary: string;
  detail: string;
  life?: number;
}
