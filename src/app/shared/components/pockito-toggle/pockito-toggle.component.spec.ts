import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';

import { PockitoToggleComponent } from './pockito-toggle.component';

describe('PockitoToggleComponent', () => {
  let component: PockitoToggleComponent;
  let fixture: ComponentFixture<PockitoToggleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PockitoToggleComponent, FormsModule, ReactiveFormsModule]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PockitoToggleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should toggle value when clicked', () => {
    expect(component.value).toBe(false);
    component.toggle();
    expect(component.value).toBe(true);
    component.toggle();
    expect(component.value).toBe(false);
  });

  it('should not toggle when disabled', () => {
    component.disabled = true;
    fixture.detectChanges();
    
    expect(component.value).toBe(false);
    component.toggle();
    expect(component.value).toBe(false);
  });

  it('should work with form control', () => {
    const control = new FormControl(false);
    component.writeValue(true);
    expect(component.value).toBe(true);

    component.writeValue(false);
    expect(component.value).toBe(false);
  });

  it('should call onChange when value changes', () => {
    let newValue: boolean | undefined;
    component.registerOnChange((value: boolean) => {
      newValue = value;
    });

    component.value = true;
    component.toggle();
    expect(newValue).toBe(false);

    component.toggle();
    expect(newValue).toBe(true);
  });

  it('should call onTouched when toggled', () => {
    let touched = false;
    component.registerOnTouched(() => {
      touched = true;
    });

    component.toggle();
    expect(touched).toBe(true);
  });

  it('should set disabled state', () => {
    component.setDisabledState(true);
    expect(component.disabled).toBe(true);

    component.setDisabledState(false);
    expect(component.disabled).toBe(false);
  });
});
