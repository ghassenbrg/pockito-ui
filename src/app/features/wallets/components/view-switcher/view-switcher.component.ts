import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { TranslateModule } from '@ngx-translate/core';

export type ViewMode = 'cards' | 'list';

@Component({
  selector: 'app-view-switcher',
  standalone: true,
  imports: [CommonModule, ButtonModule, TooltipModule, TranslateModule],
  templateUrl: './view-switcher.component.html',
  styleUrl: './view-switcher.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ViewSwitcherComponent {
  @Input() currentView: ViewMode = 'cards';
  @Output() viewChange = new EventEmitter<ViewMode>();

  onViewModeChange(viewMode: ViewMode): void {
    this.viewChange.emit(viewMode);
  }

  isCardsView(): boolean {
    return this.currentView === 'cards';
  }

  isListView(): boolean {
    return this.currentView === 'list';
  }
}
