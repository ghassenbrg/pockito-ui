import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { TranslationService } from '../../../core/services/translation.service';

@Component({
  selector: 'app-language-switcher',
  standalone: true,
  imports: [CommonModule, TranslateModule, ButtonModule],
  templateUrl: './language-switcher.component.html',
  styleUrls: ['./language-switcher.component.scss']
})
export class LanguageSwitcherComponent implements OnInit {
  @Output() languageChanged = new EventEmitter<string>();
  
  availableLanguages: Array<{code: string, name: string, flag: string}> = [];
  currentLang: string = 'en';
  isChangingLanguage: boolean = false;

  constructor(private translationService: TranslationService) {}

  ngOnInit(): void {
    this.availableLanguages = this.translationService.getAvailableLanguages();
    this.currentLang = this.translationService.getCurrentLang();
  }

  switchLanguage(langCode: string): void {
    if (this.isChangingLanguage || langCode === this.currentLang) {
      return; // Prevent multiple clicks or changing to same language
    }
    
    this.isChangingLanguage = true;
    this.translationService.setLanguage(langCode);
    this.currentLang = langCode;
    
    // Add a small delay to show visual feedback, then emit event
    setTimeout(() => {
      this.isChangingLanguage = false;
      this.languageChanged.emit(langCode);
    }, 300);
  }

  isCurrentLanguage(langCode: string): boolean {
    return this.currentLang === langCode;
  }
}
