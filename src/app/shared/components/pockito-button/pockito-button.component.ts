import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export enum PockitoButtonType {
  SUBMIT = 'submit',
  CANCEL = 'cancel',
  DEFAULT = 'default',
  PRIMARY = 'primary',
  SECONDARY = 'secondary',
  SUCCESS = 'success',
  WARNING = 'warning',
  DANGER = 'danger',
  INFO = 'info'
}

export enum PockitoButtonSize {
  SMALL = 'small',
  MEDIUM = 'medium',
  LARGE = 'large'
}

@Component({
  selector: 'pockito-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pockito-button.component.html',
  styleUrls: ['./pockito-button.component.scss']
})
export class PockitoButtonComponent {
  @Input() type: PockitoButtonType = PockitoButtonType.DEFAULT;
  @Input() size: PockitoButtonSize = PockitoButtonSize.MEDIUM;
  @Input() disabled: boolean = false;
  @Input() loading: boolean = false;
  @Input() fullWidth: boolean = false;
  @Input() icon: string = '';
  @Input() iconPosition: 'left' | 'right' = 'left';
  @Input() buttonType: 'button' | 'submit' | 'reset' = 'button';
  @Input() ariaLabel: string = '';
  @Input() title: string = '';

  @Output() click = new EventEmitter<MouseEvent>();

  get buttonClasses(): string {
    const classes = [
      'pockito-button',
      `pockito-button--${this.type}`,
      `pockito-button--${this.size}`,
    ];

    if (this.disabled) {
      classes.push('pockito-button--disabled');
    }

    if (this.loading) {
      classes.push('pockito-button--loading');
    }

    if (this.fullWidth) {
      classes.push('pockito-button--full-width');
    }

    if (this.icon && !this.loading) {
      classes.push(`pockito-button--icon-${this.iconPosition}`);
    }

    return classes.join(' ');
  }

  onClick(event: MouseEvent | KeyboardEvent): void {    
    if (this.disabled || this.loading) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }

    // Prevent default behavior for keyboard events
    if (event instanceof KeyboardEvent) {
      event.preventDefault();
    }

    // Stop event propagation to prevent double triggers
    event.stopPropagation();
    
    this.click.emit(event as MouseEvent);
  }

  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' || event.key === ' ') {
      this.onClick(event);
    }
  }
}
