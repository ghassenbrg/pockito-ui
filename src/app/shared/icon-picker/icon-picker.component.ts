import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Subject, takeUntil, debounceTime, distinctUntilChanged, switchMap, catchError, of } from 'rxjs';

export interface IconOption {
  id?: string;
  type: 'EMOJI' | 'URL';
  value: string;
  label?: string;
  tags?: string[];
}

export interface IconPickerConfig {
  showEmoji?: boolean;
  showUrl?: boolean;
  showSuggestions?: boolean;
  apiEndpoint?: string;
  placeholder?: string;
  maxSuggestions?: number;
}

@Component({
  selector: 'app-icon-picker',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './icon-picker.component.html',
  styleUrls: ['./icon-picker.component.scss']
})
export class IconPickerComponent implements OnInit, OnDestroy {
  @Input() config: IconPickerConfig = {
    showEmoji: true,
    showUrl: true,
    showSuggestions: true,
    maxSuggestions: 10
  };
  
  @Input() value: IconOption | null = null;
  @Input() placeholder = 'Choose an icon...';
  
  @Output() iconChange = new EventEmitter<IconOption | null>();
  @Output() iconSelect = new EventEmitter<IconOption>();

  iconForm: FormGroup;
  suggestions: IconOption[] = [];
  isLoading = false;
  showPicker = false;
  searchTerm = '';
  urlInputValue = '';
  urlInputInvalid = false;
  urlInputTouched = false;
  urlInputValid = false;
  
  // New UX flow properties
  currentStep: 'type-selection' | 'emoji-selection' | 'url-input' = 'type-selection';
  selectedType: 'EMOJI' | 'URL' | null = null;
  
  private destroy$ = new Subject<void>();
  private search$ = new Subject<string>();

  // Common emoji categories
  emojiCategories = [
    { name: 'Finance', emojis: ['💰', '💵', '💳', '🏦', '📊', '📈', '💎', '🪙'] },
    { name: 'Food', emojis: ['🍕', '🍔', '🍜', '🍣', '🍰', '☕', '🍺', '🍷'] },
    { name: 'Transport', emojis: ['🚗', '🚌', '🚇', '✈️', '🚲', '🛵', '🚢', '🚁'] },
    { name: 'Shopping', emojis: ['🛍️', '👕', '👖', '👟', '👜', '💄', '💍', '⌚'] },
    { name: 'Entertainment', emojis: ['🎬', '🎮', '🎵', '🎨', '🎭', '🎪', '🎯', '🎲'] },
    { name: 'Health', emojis: ['💊', '🏥', '💉', '🩺', '🦷', '👁️', '🫀', '🧠'] },
    { name: 'Home', emojis: ['🏠', '🛋️', '🛏️', '🚿', '🪑', '🖼️', '🪞', '🪟'] },
    { name: 'Nature', emojis: ['🌲', '🌺', '🌞', '🌙', '⭐', '🌈', '🌊', '🏔️'] }
  ];

  constructor(
    private fb: FormBuilder,
    private http: HttpClient
  ) {
    this.iconForm = this.fb.group({
      type: ['EMOJI', Validators.required],
      value: ['', Validators.required],
      label: [''],
      tags: [[]]
    });
  }

  ngOnInit(): void {
    if (this.value) {
      this.iconForm.patchValue(this.value);
      this.selectedType = this.value.type;
    }

    // Setup search with debouncing
    this.search$.pipe(
      takeUntil(this.destroy$),
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(term => {
        if (!term || !this.config.apiEndpoint) {
          return of([]);
        }
        this.isLoading = true;
        return this.http.get<IconOption[]>(`${this.config.apiEndpoint}?q=${encodeURIComponent(term)}&limit=${this.config.maxSuggestions}`).pipe(
          catchError(() => of([]))
        );
      })
    ).subscribe(suggestions => {
      this.suggestions = suggestions;
      this.isLoading = false;
    });

    // Watch form changes
    this.iconForm.valueChanges.pipe(
      takeUntil(this.destroy$)
    ).subscribe(value => {
      if (this.iconForm.valid) {
        this.iconChange.emit(value);
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  togglePicker(): void {
    this.showPicker = !this.showPicker;
    if (this.showPicker) {
      this.resetToTypeSelection();
      setTimeout(() => {
        const searchInput = document.querySelector('.icon-search input') as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
        }
      }, 100);
    }
  }

  // New UX flow methods
  resetToTypeSelection(): void {
    this.currentStep = 'type-selection';
    this.selectedType = null;
    this.searchTerm = '';
    this.urlInputValue = '';
    this.urlInputInvalid = false;
    this.urlInputTouched = false;
    this.urlInputValid = false;
  }

  selectIconType(type: 'EMOJI' | 'URL'): void {
    this.selectedType = type;
    this.currentStep = type === 'EMOJI' ? 'emoji-selection' : 'url-input';
    
    // Update form type
    this.iconForm.patchValue({ type });
    
    // Focus appropriate input
    setTimeout(() => {
      if (type === 'URL') {
        const urlInput = document.querySelector('.url-input') as HTMLInputElement;
        if (urlInput) {
          urlInput.focus();
        }
      }
    }, 100);
  }

  goBackToTypeSelection(): void {
    this.currentStep = 'type-selection';
    this.selectedType = null;
  }

  selectEmoji(emoji: string): void {
    const iconOption: IconOption = {
      type: 'EMOJI',
      value: emoji
    };
    this.selectIcon(iconOption);
  }

  selectUrl(url: string): void {
    const iconOption: IconOption = {
      type: 'URL',
      value: url
    };
    this.selectIcon(iconOption);
  }

  selectIcon(icon: IconOption): void {
    this.iconForm.patchValue(icon);
    this.iconSelect.emit(icon);
    this.showPicker = false;
    this.resetToTypeSelection();
  }

  searchIcons(term: string): void {
    this.searchTerm = term;
    this.search$.next(term);
  }

  onUrlInputChange(value: string): void {
    this.urlInputValue = value;
    this.urlInputTouched = true;
    
    // Simple URL validation
    try {
      new URL(value);
      this.urlInputValid = true;
      this.urlInputInvalid = false;
    } catch {
      this.urlInputValid = false;
      this.urlInputInvalid = true;
    }
  }

  onSearchInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchIcons(target.value);
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.searchIcons('');
  }

  clearIcon(): void {
    this.iconForm.patchValue({ value: '', label: '', tags: [] });
    this.iconChange.emit(null);
  }

  onBackdropClick(event: Event): void {
    if (event.target === event.currentTarget) {
      this.showPicker = false;
      this.resetToTypeSelection();
    }
  }

  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.showPicker = false;
      this.resetToTypeSelection();
    }
  }

  onImageError(event: Event): void {
    const imgElement = event.target as HTMLImageElement;
    if (imgElement) {
      imgElement.style.display = 'none';
    }
  }
}
