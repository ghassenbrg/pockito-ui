# Unified Modal System

A comprehensive, accessible modal system for Angular applications with focus trap, keyboard navigation, and ARIA compliance.

## Features

- ✅ **Accessibility First**: ARIA attributes, focus trap, keyboard navigation
- ✅ **Multiple Modal Types**: Component-based, template-based, and legacy type-based
- ✅ **Focus Management**: Automatic focus trap and restoration
- ✅ **Keyboard Support**: Escape key, Tab navigation, Shift+Tab
- ✅ **Responsive Design**: Mobile-first approach with Tailwind CSS
- ✅ **TypeScript Support**: Full type safety with interfaces
- ✅ **Multiple Modals**: Support for stacking multiple modals
- ✅ **Customizable**: Configurable behavior and styling

## Quick Start

### 1. Import the Modal System

```typescript
import { ModalService, ModalHostComponent } from '@shared/modal';
```

### 2. Add Modal Host to Your App

```html
<!-- In your app.component.html or main layout -->
<app-modal-host></app-modal-host>
```

### 3. Use the Modal Service

```typescript
constructor(private modalService: ModalService) {}

// Open a simple modal
openSimpleModal() {
  this.modalService.open({
    id: 'simple-modal',
    title: 'Simple Modal',
    data: { message: 'Hello World!' }
  });
}

// Open a component-based modal
openComponentModal() {
  this.modalService.openComponent(ExampleModalComponent, {
    id: 'example-modal',
    title: 'Example Modal',
    data: { 
      title: 'Confirm Action',
      message: 'Are you sure you want to proceed?',
      confirmText: 'Yes, proceed',
      cancelText: 'Cancel'
    }
  }).subscribe(result => {
    if (result.confirmed) {
      console.log('User confirmed:', result.data);
    }
  });
}
```

## Modal Configuration

### ModalConfig Interface

```typescript
interface ModalConfig {
  id: string;                    // Unique identifier
  title: string;                 // Modal title for screen readers
  closeOnBackdropClick?: boolean; // Close on backdrop click (default: true)
  closeOnEscape?: boolean;       // Close on Escape key (default: true)
  showCloseButton?: boolean;     // Show close button (default: true)
  modalClass?: string;           // CSS classes for modal overlay
  contentClass?: string;         // CSS classes for modal content
  trapFocus?: boolean;           // Enable focus trap (default: true)
  restoreFocus?: boolean;        // Restore focus on close (default: true)
  restoreFocusElement?: HTMLElement; // Element to restore focus to
  data?: any;                    // Data to pass to modal
  component?: Type<any>;         // Component to render
  template?: TemplateRef<any>;   // Template to render
}
```

## Modal Types

### 1. Component-Based Modals

```typescript
// Create a modal component
@Component({
  selector: 'app-confirm-modal',
  standalone: true,
  template: `
    <div class="confirm-modal">
      <h3>{{ data.title }}</h3>
      <p>{{ data.message }}</p>
      <div class="actions">
        <button (click)="confirm()">Confirm</button>
        <button (click)="cancel()">Cancel</button>
      </div>
    </div>
  `
})
export class ConfirmModalComponent {
  @Input() data: any;
  @Output() result = new EventEmitter<ModalResult>();

  confirm() {
    this.result.emit({ confirmed: true });
  }

  cancel() {
    this.result.emit({ confirmed: false });
  }
}

// Use the modal
this.modalService.openComponent(ConfirmModalComponent, {
  id: 'confirm-action',
  title: 'Confirm Action',
  data: { title: 'Delete Item', message: 'Are you sure?' }
}).subscribe(result => {
  if (result.confirmed) {
    // Handle confirmation
  }
});
```

### 2. Template-Based Modals

```typescript
// In your component
@ViewChild('confirmTemplate') confirmTemplate!: TemplateRef<any>;

openTemplateModal() {
  this.modalService.openTemplate(this.confirmTemplate, {
    id: 'template-modal',
    title: 'Template Modal',
    data: { message: 'This is a template modal' }
  });
}

// In your template
<ng-template #confirmTemplate let-data>
  <div class="template-modal">
    <p>{{ data.message }}</p>
    <button (click)="closeModal()">Close</button>
  </div>
</ng-template>
```

### 3. Legacy Type-Based Modals

```typescript
// For backward compatibility
this.modalService.openLegacy('transaction-modal', { amount: 100 });
```

## Accessibility Features

### Focus Trap

The modal system automatically manages focus to ensure keyboard users can navigate within the modal and cannot accidentally tab outside of it.

### ARIA Attributes

- `role="dialog"` - Identifies the modal as a dialog
- `aria-modal="true"` - Indicates this is a modal dialog
- `aria-labelledby` - Links to the modal title
- `aria-describedby` - Links to the modal content

### Keyboard Navigation

- **Tab**: Move to next focusable element
- **Shift + Tab**: Move to previous focusable element
- **Escape**: Close modal (if enabled)

## Styling

### Custom CSS Classes

```typescript
this.modalService.open({
  id: 'custom-modal',
  title: 'Custom Modal',
  modalClass: 'custom-overlay',
  contentClass: 'custom-content'
});
```

### Responsive Design

The modal system is built with mobile-first responsive design using Tailwind CSS classes. Modals automatically adjust for different screen sizes.

## Advanced Usage

### Multiple Modals

```typescript
// Open multiple modals
this.modalService.open({ id: 'modal1', title: 'First Modal' });
this.modalService.open({ id: 'modal2', title: 'Second Modal' });

// Check modal status
const isOpen = this.modalService.isModalOpen('modal1');
const count = this.modalService.getOpenModalCount();
```

### Custom Focus Management

```typescript
// Custom focus restoration
const button = document.querySelector('#my-button');
this.modalService.open({
  id: 'custom-focus',
  title: 'Custom Focus',
  restoreFocusElement: button
});
```

### Modal Results

```typescript
interface CustomResult {
  action: 'save' | 'delete' | 'cancel';
  data?: any;
}

this.modalService.openComponent(MyModalComponent, {
  id: 'custom-modal',
  title: 'Custom Modal'
}).subscribe((result: CustomResult) => {
  switch (result.action) {
    case 'save':
      this.saveData(result.data);
      break;
    case 'delete':
      this.deleteItem(result.data);
      break;
    case 'cancel':
      // Handle cancellation
      break;
  }
});
```

## Migration from Legacy System

The new modal system maintains backward compatibility with the legacy methods:

```typescript
// Old way (still works)
this.modalService.openLegacy('type', data);
this.modalService.closeLegacy();

// New way (recommended)
this.modalService.open({ id: 'unique-id', title: 'Title', data });
this.modalService.close('unique-id');
```

## Best Practices

1. **Always provide unique IDs** for modals to avoid conflicts
2. **Use descriptive titles** for screen readers
3. **Handle modal results** properly in your components
4. **Test keyboard navigation** to ensure accessibility
5. **Keep modal content focused** and avoid unnecessary complexity
6. **Use appropriate ARIA labels** for custom elements

## Troubleshooting

### Modal not opening

- Check that `ModalHostComponent` is included in your app
- Verify the modal service is properly injected
- Check browser console for errors

### Focus trap not working

- Ensure `trapFocus: true` is set in modal config
- Check that focusable elements exist within the modal
- Verify no CSS is hiding focusable elements

### Styling issues

- Check that Tailwind CSS is properly configured
- Verify custom CSS classes are defined
- Ensure responsive breakpoints are correct

## Examples

See `example-modal.component.ts` for a complete working example of a modal component.
