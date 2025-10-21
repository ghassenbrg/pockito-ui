import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class TranslationService {
  private currentLangSubject = new BehaviorSubject<string>('en');
  currentLang$ = this.currentLangSubject.asObservable();

  constructor(private translate: TranslateService) {
    const saved = localStorage.getItem('preferredLanguage');
    const browser = (navigator.language || 'en').split('-')[0];

    const lang = saved || browser || 'en';
    this.translate.setFallbackLang('en');
    this.translate.use(lang);
    this.currentLangSubject.next(lang);
  }

  setLanguage(lang: string): void {
    this.translate.use(lang);
    this.currentLangSubject.next(lang);
    localStorage.setItem('preferredLanguage', lang);
  }

  getCurrentLang(): string {
    return this.currentLangSubject.value;
  }

  getAvailableLanguages(): Array<{ code: string; name: string; flag: string }> {
    return [
      { code: 'en', name: 'English',  flag: '/assets/flags/en.svg' },
      { code: 'fr', name: 'Français', flag: '/assets/flags/fr.svg' },
      { code: 'ja', name: '日本語',     flag: '/assets/flags/ja.svg' }
    ];
  }
}
