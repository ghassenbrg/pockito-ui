import { Component, forwardRef, Input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pockito-toggle',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pockito-toggle.component.html',
  styleUrl: './pockito-toggle.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => PockitoToggleComponent),
      multi: true
    }
  ]
})
export class PockitoToggleComponent implements ControlValueAccessor {
  @Input() label: string = '';
  @Input() disabled: boolean = false;

  value: boolean = false;
  private onChange = (_value: boolean) => {};
  private onTouched = () => {};

  toggle(): void {
    if (this.disabled) {
      return;
    }
    this.value = !this.value;
    this.onChange(this.value);
    this.onTouched();
  }

  // ControlValueAccessor implementation
  writeValue(_value: boolean): void {
    this.value = _value || false;
  }

  registerOnChange(fn: (_value: boolean) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}
