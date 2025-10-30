import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { Subscription } from 'rxjs';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule, ToastModule],
  template: `
    <p-toast
      position="top-right"
      [baseZIndex]="2147483648"
      [showTransformOptions]="'translateX(100%)'"
      [hideTransformOptions]="'translateX(100%)'"
    ></p-toast>
  `,
  providers: [MessageService],
})
export class ToastComponent implements OnInit, OnDestroy {
  private subscription = new Subscription();

  constructor(
    private toastService: ToastService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    // Subscribe to toast messages from the service
    this.subscription.add(
      this.toastService.toastMessages$.subscribe((toasts) => {
        // Get the latest toast (the one just added)
        if (toasts.length > 0) {
          const latestToast = toasts[toasts.length - 1];
          this.messageService.add(latestToast);
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
