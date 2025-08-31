# Translation System for Pockito UI

This document explains how the translation system is set up and how to use it in the Pockito UI application.

## Overview

The application uses `@ngx-translate` for internationalization (i18n) support. Currently, the following languages are supported:

- **English (en)** - Default language
- **French (fr)** - Français
- **Japanese (jp)** - 日本語

## File Structure

```
src/
├── assets/
│   └── i18n/
│       ├── en.json      # English translations
│       ├── fr.json      # French translations
│       └── jp.json      # Japanese translations
├── app/
│   ├── core/
│   │   ├── services/
│   │   │   └── translation.service.ts    # Translation service
│   │   └── translation.module.ts         # Translation module
│   └── shared/
│       └── components/
│           └── language-switcher/        # Language switcher component
```

## How to Use

### 1. Basic Translation in Templates

Use the `translate` pipe in your HTML templates:

```html
<!-- Simple translation -->
<h1>{{ 'appLayout.navigation.dashboard' | translate }}</h1>

<!-- Translation with parameters -->
<p>{{ 'welcome.message' | translate: { name: userName } }}</p>
```

### 2. Translation in Components

Use the `TranslateService` in your component classes:

```typescript
import { TranslateService } from '@ngx-translate/core';

export class MyComponent {
  constructor(private translate: TranslateService) {}
  
  ngOnInit() {
    // Get translation
    const message = this.translate.instant('appLayout.navigation.dashboard');
    
    // Subscribe to language changes
    this.translate.onLangChange.subscribe((event) => {
      console.log('Language changed to:', event.lang);
    });
  }
}
```

### 3. Language Switching

The application includes a language switcher component that allows users to change languages:

```html
<app-language-switcher></app-language-switcher>
```

## Adding New Translations

### 1. Add Translation Keys

Add new translation keys to all language files:

**en.json:**
```json
{
  "newSection": {
    "title": "New Section Title",
    "description": "This is a new section"
  }
}
```

**fr.json:**
```json
{
  "newSection": {
    "title": "Titre de la Nouvelle Section",
    "description": "Ceci est une nouvelle section"
  }
}
```

**jp.json:**
```json
{
  "newSection": {
    "title": "新しいセクションのタイトル",
    "description": "これは新しいセクションです"
  }
}
```

### 2. Use in Templates

```html
<h2>{{ 'newSection.title' | translate }}</h2>
<p>{{ 'newSection.description' | translate }}</p>
```

## Translation Keys Structure

The translation keys are organized hierarchically:

- `appLayout.*` - Application layout related translations
- `terminal.*` - Terminal component translations
- `navigation.*` - Navigation menu translations
- `dialogs.*` - Dialog and modal translations

## Best Practices

1. **Use descriptive keys**: Make keys self-explanatory
2. **Group related translations**: Use hierarchical structure
3. **Keep translations consistent**: Ensure all languages have the same keys
4. **Test all languages**: Verify translations work in all supported languages
5. **Use translation service**: For dynamic content, use the service instead of pipes

## Current Translation Coverage

- ✅ App Layout Component
- ✅ Terminal Component (UI only, not commands)
- ✅ Navigation Menu
- ✅ Dialog Headers
- ✅ Language Switcher

## Future Enhancements

- Add more languages
- Implement translation memory
- Add translation validation
- Support for RTL languages
- Automatic language detection based on user preferences

## Troubleshooting

### Common Issues

1. **Translation not showing**: Check if the key exists in all language files
2. **Language not switching**: Verify the translation service is properly injected
3. **Missing translations**: Ensure all language files have the same structure

### Debug Mode

Enable debug mode to see missing translations:

```typescript
// In your component
this.translate.setDefaultLang('en');
this.translate.use('en');
```

## Dependencies

- `@ngx-translate/core`: Core translation functionality
- `@ngx-translate/http-loader`: HTTP loader for translation files
- Angular HttpClient: For loading translation files

## Notes

- The terminal commands themselves are not translated, only the UI elements
- Language preference is stored in localStorage
- Default language is English if no preference is set
- Browser language detection is supported but not enabled by default
