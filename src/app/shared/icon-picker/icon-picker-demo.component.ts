import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconPickerComponent, IconOption, IconPickerConfig } from './icon-picker.component';

@Component({
  selector: 'app-icon-picker-demo',
  standalone: true,
  imports: [CommonModule, IconPickerComponent],
  template: `
    <div class="demo-container">
      <h2>Icon Picker Demo</h2>
      
      <div class="demo-section">
        <h3>Basic Icon Picker</h3>
        <app-icon-picker
          [value]="selectedIcon"
          (iconChange)="onIconChange($event)"
          (iconSelect)="onIconSelect($event)">
        </app-icon-picker>
        
        <div *ngIf="selectedIcon" class="selected-info">
          <p><strong>Selected:</strong> {{ selectedIcon.type }} - {{ selectedIcon.value }}</p>
          <p *ngIf="selectedIcon.label"><strong>Label:</strong> {{ selectedIcon.label }}</p>
        </div>
      </div>

      <div class="demo-section">
        <h3>Emoji Only</h3>
        <app-icon-picker
          [config]="emojiOnlyConfig"
          [value]="emojiIcon"
          (iconSelect)="onEmojiSelect($event)">
        </app-icon-picker>
      </div>

      <div class="demo-section">
        <h3>URL Only with API Suggestions</h3>
        <app-icon-picker
          [config]="urlOnlyConfig"
          [value]="urlIcon"
          (iconSelect)="onUrlSelect($event)">
        </app-icon-picker>
      </div>

      <div class="demo-section">
        <h3>Custom Configuration</h3>
        <app-icon-picker
          [config]="customConfig"
          [value]="customIcon"
          (iconSelect)="onCustomSelect($event)">
        </app-icon-picker>
      </div>
    </div>
  `,
  styles: [`
    .demo-container {
      max-width: 800px;
      margin: 0 auto;
      padding: 2rem;
      font-family: system-ui, -apple-system, sans-serif;
    }

    .demo-section {
      margin-bottom: 3rem;
      padding: 1.5rem;
      border: 1px solid #e5e7eb;
      border-radius: 0.5rem;
      background-color: #f9fafb;
    }

    .demo-section h3 {
      margin-top: 0;
      color: #374151;
      font-size: 1.125rem;
      font-weight: 600;
    }

    .selected-info {
      margin-top: 1rem;
      padding: 1rem;
      background-color: white;
      border-radius: 0.375rem;
      border: 1px solid #d1d5db;
    }

    .selected-info p {
      margin: 0.5rem 0;
      color: #374151;
    }
  `]
})
export class IconPickerDemoComponent {
  selectedIcon: IconOption | null = null;
  emojiIcon: IconOption | null = null;
  urlIcon: IconOption | null = null;
  customIcon: IconOption | null = null;

  emojiOnlyConfig: IconPickerConfig = {
    showEmoji: true,
    showUrl: false,
    showSuggestions: false
  };

  urlOnlyConfig: IconPickerConfig = {
    showEmoji: false,
    showUrl: true,
    showSuggestions: true,
    apiEndpoint: '/api/icons',
    maxSuggestions: 15
  };

  customConfig: IconPickerConfig = {
    showEmoji: true,
    showUrl: true,
    showSuggestions: true,
    apiEndpoint: '/api/icons',
    maxSuggestions: 20,
    placeholder: 'Select your favorite icon...'
  };

  onIconChange(_icon: IconOption | null): void {
    // console.log('Icon changed:', _icon);
  }

  onIconSelect(icon: IconOption): void {
    this.selectedIcon = icon;
    // console.log('Icon selected:', icon);
  }

  onEmojiSelect(icon: IconOption): void {
    this.emojiIcon = icon;
    // console.log('Emoji selected:', icon);
  }

  onUrlSelect(icon: IconOption): void {
    this.urlIcon = icon;
    // console.log('URL icon selected:', icon);
  }

  onCustomSelect(icon: IconOption): void {
    this.customIcon = icon;
    // console.log('Custom icon selected:', icon);
  }
}
