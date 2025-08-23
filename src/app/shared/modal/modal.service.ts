import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface ModalData {
  type: string;
  data?: any;
}

@Injectable({
  providedIn: 'root'
})
export class ModalService {
  private open$ = new Subject<ModalData>();
  private close$ = new Subject<void>();

  open(type: string, data?: any): void {
    this.open$.next({ type, data });
  }

  close(): void {
    this.close$.next();
  }

  onOpen() {
    return this.open$.asObservable();
  }

  onClose() {
    return this.close$.asObservable();
  }
}
