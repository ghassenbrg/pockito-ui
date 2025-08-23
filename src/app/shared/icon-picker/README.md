# Icon Picker Component

A flexible and accessible icon picker component that supports both emoji and URL-based icons with optional API suggestions.

## Features

- **Dual Icon Types**: Support for both emoji and URL-based icons
- **Emoji Categories**: Pre-organized emoji categories (Finance, Food, Transport, etc.)
- **API Integration**: Optional integration with `/api/icons` endpoint for suggestions
- **Search Functionality**: Debounced search with loading states
- **Responsive Design**: Mobile-first design with dark mode support
- **Accessibility**: Keyboard navigation, focus management, and ARIA support
- **Customizable**: Configurable display options and behavior

## Quick Start

```typescript
import { IconPickerComponent, IconOption } from '@shared/icon-picker';

@Component({
  selector: 'app-example',
  template: `
    <app-icon-picker
      [value]="selectedIcon"
      (iconSelect)="onIconSelect($event)">
    </app-icon-picker>
  `
})
export class ExampleComponent {
  selectedIcon: IconOption | null = null;

  onIconSelect(icon: IconOption): void {
    this.selectedIcon = icon;
  }
}
```

## Configuration

### IconPickerConfig

```typescript
interface IconPickerConfig {
  showEmoji?: boolean;        // Show emoji picker (default: true)
  showUrl?: boolean;          // Show URL input (default: true)
  showSuggestions?: boolean;  // Show API suggestions (default: true)
  apiEndpoint?: string;       // API endpoint for suggestions
  placeholder?: string;       // Custom placeholder text
  maxSuggestions?: number;    // Max suggestions to show (default: 10)
}
```

### IconOption

```typescript
interface IconOption {
  id?: string;                // Optional unique identifier
  type: 'EMOJI' | 'URL';     // Icon type
  value: string;              // Icon value (emoji or URL)
  label?: string;             // Optional display label
  tags?: string[];            // Optional tags for search
}
```

## Usage Examples

### Basic Usage

```typescript
<app-icon-picker
  [value]="selectedIcon"
  (iconChange)="onIconChange($event)"
  (iconSelect)="onIconSelect($event)">
</app-icon-picker>
```

### Emoji Only

```typescript
<app-icon-picker
  [config]="{ showEmoji: true, showUrl: false, showSuggestions: false }"
  [value]="emojiIcon"
  (iconSelect)="onEmojiSelect($event)">
</app-icon-picker>
```

### URL Only with API

```typescript
<app-icon-picker
  [config]="{
    showEmoji: false,
    showUrl: true,
    showSuggestions: true,
    apiEndpoint: '/api/icons',
    maxSuggestions: 15
  }"
  [value]="urlIcon"
  (iconSelect)="onUrlSelect($event)">
</app-icon-picker>
```

### Custom Configuration

```typescript
<app-icon-picker
  [config]="customConfig"
  [placeholder]="'Choose your icon...'"
  [value]="customIcon"
  (iconSelect)="onCustomSelect($event)">
</app-icon-picker>
```

## Events

- **`iconChange`**: Emitted when the icon value changes (including form validation)
- **`iconSelect`**: Emitted when an icon is explicitly selected

## API Integration

The component can integrate with a backend API endpoint for icon suggestions:

```typescript
// Expected API response format
interface IconApiResponse {
  id: string;
  type: 'EMOJI' | 'URL';
  value: string;
  label?: string;
  tags?: string[];
}

// API endpoint: GET /api/icons?q={searchTerm}&limit={maxSuggestions}
```

## Styling

The component uses Tailwind CSS classes and includes:

- Responsive grid layouts
- Hover and focus states
- Dark mode support
- Smooth transitions and animations
- Mobile-optimized touch targets

## Accessibility Features

- **Keyboard Navigation**: Tab, Shift+Tab, Enter, Escape
- **Focus Management**: Proper focus trapping and restoration
- **Screen Reader Support**: ARIA labels and descriptions
- **High Contrast**: Visible focus indicators and hover states

## Emoji Categories

Pre-organized emoji categories include:

- **Finance**: 💰 💵 💳 🏦 📊 📈 💎 🪙
- **Food**: 🍕 🍔 🍜 🍣 🍰 ☕ 🍺 🍷
- **Transport**: 🚗 🚌 🚇 ✈️ 🚲 🛵 🚢 🚁
- **Shopping**: 🛍️ 👕 👖 👟 👜 💄 💍 ⌚
- **Entertainment**: 🎬 🎮 🎵 🎨 🎭 🎪 🎯 🎲
- **Health**: 💊 🏥 💉 🩺 🦷 👁️ 🫀 🧠
- **Home**: 🏠 🛋️ 🛏️ 🚿 🪑 🖼️ 🪞 🪟
- **Nature**: 🌲 🌺 🌞 🌙 ⭐ 🌈 🌊 🏔️

## Browser Support

- Modern browsers with ES2015+ support
- Responsive design for mobile and desktop
- Graceful degradation for older browsers

## Dependencies

- Angular 17+
- RxJS (for search debouncing and API calls)
- Tailwind CSS (for styling)

## Performance Considerations

- Debounced search (300ms delay)
- Lazy loading of API suggestions
- Efficient change detection
- Minimal DOM manipulation

## Troubleshooting

### Common Issues

1. **Icons not displaying**: Check if the icon type and value are correct
2. **API suggestions not working**: Verify the endpoint URL and response format
3. **Styling conflicts**: Ensure Tailwind CSS is properly imported

### Debug Mode

Enable console logging to debug component behavior:

```typescript
// The component logs all events to console by default
// Check browser console for detailed information
```

## Contributing

When contributing to the icon picker:

1. Maintain accessibility standards
2. Test on multiple devices and screen sizes
3. Ensure proper TypeScript typing
4. Add comprehensive tests
5. Update documentation for new features
