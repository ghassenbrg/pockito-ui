import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';

export interface PageHeaderConfig {
  title: string;
  subtitle?: string;
  icon?: string;
  buttonText?: string;
  buttonIcon?: string;
  showButton?: boolean;
  buttonClass?: string;
  // Additional button configurations
  secondaryButtonText?: string;
  secondaryButtonIcon?: string;
  secondaryButtonClass?: string;
  showSecondaryButton?: boolean;
  // Custom actions
  customActions?: PageHeaderAction[];
}

export interface PageHeaderAction {
  label: string;
  icon?: string;
  styleClass?: string;
  disabled?: boolean;
  loading?: boolean;
}

@Component({
  selector: 'app-page-header',
  standalone: true,
  imports: [CommonModule, ButtonModule],
  template: `
    <div class="page-header">
      <div class="header-content">
        <div class="header-icon" *ngIf="config?.icon">
          <i [class]="config?.icon"></i>
        </div>
        <div class="header-text">
          <h1 class="page-title">{{ config?.title }}</h1>
          <p class="page-subtitle" *ngIf="config?.subtitle">{{ config?.subtitle }}</p>
        </div>
      </div>
      <div class="header-actions" *ngIf="hasActions">
        <!-- Custom actions -->
        <ng-container *ngIf="config && config.customActions && config.customActions.length > 0">
          <p-button 
            *ngFor="let action of config!.customActions; let i = index"
            [label]="action.label"
            [icon]="action.icon"
            [styleClass]="action.styleClass || 'p-button-outlined'"
            [disabled]="action.disabled || false"
            [loading]="action.loading || false"
            (onClick)="onCustomActionClick(i)"
          ></p-button>
        </ng-container>
        
        <!-- Secondary button -->
        <p-button 
          *ngIf="config?.showSecondaryButton"
          [label]="config?.secondaryButtonText"
          [icon]="config?.secondaryButtonIcon"
          [styleClass]="config?.secondaryButtonClass || 'p-button-text'"
          (onClick)="onSecondaryButtonClick()"
        ></p-button>
        
        <!-- Primary button -->
        <p-button 
          *ngIf="config?.showButton"
          [label]="config?.buttonText"
          [icon]="config?.buttonIcon"
          [styleClass]="config?.buttonClass || 'p-button-text'"
          (onClick)="onButtonClick()"
        ></p-button>
      </div>
    </div>
  `,
  styleUrls: ['./page-header.component.scss']
})
export class PageHeaderComponent {
  @Input() config?: PageHeaderConfig;
  @Output() buttonClick = new EventEmitter<void>();
  @Output() secondaryButtonClick = new EventEmitter<void>();
  @Output() customActionClick = new EventEmitter<{ action: PageHeaderAction; index: number }>();

  get hasActions(): boolean {
    if (!this.config) return false;
    return !!(this.config.showButton || 
              this.config.showSecondaryButton || 
              (this.config.customActions && this.config.customActions.length > 0));
  }

  onButtonClick(): void {
    this.buttonClick.emit();
  }

  onSecondaryButtonClick(): void {
    this.secondaryButtonClick.emit();
  }

  onCustomActionClick(index: number): void {
    if (this.config?.customActions && this.config.customActions[index]) {
      this.customActionClick.emit({
        action: this.config.customActions[index],
        index
      });
    }
  }
}
