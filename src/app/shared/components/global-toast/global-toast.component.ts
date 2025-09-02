import { Component } from '@angular/core';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-global-toast',
  standalone: true,
  imports: [ToastModule],
  template: `
    <p-toast
      position="top-right"
      [baseZIndex]="10000"
      [life]="5000"
      [preventDuplicates]="true"
      [preventOpenDuplicates]="true"
      [showTransformOptions]="'translateY(100%)'"
      [hideTransformOptions]="'translateY(-100%)'"
      [showTransitionOptions]="'300ms ease-out'"
      [hideTransitionOptions]="'250ms ease-in'"
      [breakpoints]="{ '920px': { width: '100%', right: '0', left: '0' } }"
    />
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class GlobalToastComponent {
  constructor() {}
}
