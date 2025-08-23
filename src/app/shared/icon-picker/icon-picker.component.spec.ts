import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IconPickerComponent, IconOption, IconPickerConfig } from './icon-picker.component';

/* eslint-disable @typescript-eslint/no-unused-vars */
declare const describe: any;
declare const it: any;
declare const beforeEach: any;
declare const expect: any;
declare const jasmine: any;

describe('IconPickerComponent', () => {
  let component: IconPickerComponent;
  let fixture: ComponentFixture<IconPickerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        FormsModule,
        ReactiveFormsModule,
        IconPickerComponent
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(IconPickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default config', () => {
    expect(component.config.showEmoji).toBe(true);
    expect(component.config.showUrl).toBe(true);
    expect(component.config.showSuggestions).toBe(true);
    expect(component.config.maxSuggestions).toBe(10);
  });

  it('should initialize form with default values', () => {
    expect(component.iconForm.get('type')?.value).toBe('EMOJI');
    expect(component.iconForm.get('value')?.value).toBe('');
    expect(component.iconForm.get('label')?.value).toBe('');
    expect(component.iconForm.get('tags')?.value).toEqual([]);
  });

  it('should patch form when value input changes', () => {
    const testIcon: IconOption = {
      type: 'URL',
      value: 'https://example.com/icon.png',
      label: 'Test Icon',
      tags: ['test', 'icon']
    };

    component.value = testIcon;
    component.ngOnInit();

    expect(component.iconForm.get('type')?.value).toBe('URL');
    expect(component.iconForm.get('value')?.value).toBe('https://example.com/icon.png');
    expect(component.iconForm.get('label')?.value).toBe('Test Icon');
    expect(component.iconForm.get('tags')?.value).toEqual(['test', 'icon']);
  });

  it('should toggle picker visibility', () => {
    expect(component.showPicker).toBe(false);
    
    component.togglePicker();
    expect(component.showPicker).toBe(true);
    
    component.togglePicker();
    expect(component.showPicker).toBe(false);
  });

  it('should select emoji icon', () => {
    const emoji = '💰';
    spyOn(component.iconSelect, 'emit');
    
    component.selectEmoji(emoji);
    
    expect(component.iconForm.get('type')?.value).toBe('EMOJI');
    expect(component.iconForm.get('value')?.value).toBe(emoji);
    expect(component.iconSelect.emit).toHaveBeenCalledWith({
      type: 'EMOJI',
      value: emoji
    });
    expect(component.showPicker).toBe(false);
  });

  it('should select URL icon', () => {
    const url = 'https://example.com/icon.png';
    spyOn(component.iconSelect, 'emit');
    
    component.selectUrl(url);
    
    expect(component.iconForm.get('type')?.value).toBe('URL');
    expect(component.iconForm.get('value')?.value).toBe(url);
    expect(component.iconSelect.emit).toHaveBeenCalledWith({
      type: 'URL',
      value: url
    });
    expect(component.showPicker).toBe(false);
  });

  it('should select icon with full data', () => {
    const icon: IconOption = {
      id: 'test-id',
      type: 'EMOJI',
      value: '💎',
      label: 'Diamond',
      tags: ['precious', 'stone']
    };
    spyOn(component.iconSelect, 'emit');
    
    component.selectIcon(icon);
    
    expect(component.iconForm.get('type')?.value).toBe('EMOJI');
    expect(component.iconForm.get('value')?.value).toBe('💎');
    expect(component.iconForm.get('label')?.value).toBe('Diamond');
    expect(component.iconForm.get('tags')?.value).toEqual(['precious', 'stone']);
    expect(component.iconSelect.emit).toHaveBeenCalledWith(icon);
    expect(component.showPicker).toBe(false);
  });

  it('should clear icon', () => {
    // Set initial values
    component.iconForm.patchValue({
      type: 'EMOJI',
      value: '💰',
      label: 'Money',
      tags: ['finance']
    });
    
    spyOn(component.iconChange, 'emit');
    
    component.clearIcon();
    
    expect(component.iconForm.get('value')?.value).toBe('');
    expect(component.iconForm.get('label')?.value).toBe('');
    expect(component.iconForm.get('tags')?.value).toEqual([]);
    expect(component.iconChange.emit).toHaveBeenCalledWith(null);
  });

  it('should handle backdrop click', () => {
    component.showPicker = true;
    
    const event = new Event('click');
    Object.defineProperty(event, 'target', { value: event.currentTarget });
    
    component.onBackdropClick(event);
    
    expect(component.showPicker).toBe(false);
  });

  it('should not close picker on non-backdrop click', () => {
    component.showPicker = true;
    
    const event = new Event('click');
    const mockTarget = document.createElement('div');
    Object.defineProperty(event, 'target', { value: mockTarget });
    Object.defineProperty(event, 'currentTarget', { value: document.createElement('div') });
    
    component.onBackdropClick(event);
    
    expect(component.showPicker).toBe(true);
  });

  it('should handle escape key', () => {
    component.showPicker = true;
    
    const event = new KeyboardEvent('keydown', { key: 'Escape' });
    component.onKeyDown(event);
    
    expect(component.showPicker).toBe(false);
  });

  it('should not close picker on other keys', () => {
    component.showPicker = true;
    
    const event = new KeyboardEvent('keydown', { key: 'Enter' });
    component.onKeyDown(event);
    
    expect(component.showPicker).toBe(true);
  });

  it('should have emoji categories', () => {
    expect(component.emojiCategories).toBeDefined();
    expect(component.emojiCategories.length).toBeGreaterThan(0);
    
    const financeCategory = component.emojiCategories.find(cat => cat.name === 'Finance');
    expect(financeCategory).toBeDefined();
    expect(financeCategory?.emojis).toContain('💰');
  });

  it('should emit iconChange on form value changes', () => {
    spyOn(component.iconChange, 'emit');
    
    component.iconForm.patchValue({ value: '💰' });
    
    expect(component.iconChange.emit).toHaveBeenCalled();
  });

  it('should handle search term changes', () => {
    const searchTerm = 'money';
    component.searchIcons(searchTerm);
    
    expect(component.searchTerm).toBe(searchTerm);
  });

  it('should close picker when icon is selected', () => {
    component.showPicker = true;
    
    component.selectEmoji('💰');
    
    expect(component.showPicker).toBe(false);
  });

  it('should maintain form validation state', () => {
    const form = component.iconForm;
    
    // Initially should be invalid (no value)
    expect(form.valid).toBe(false);
    
    // Set required value
    form.patchValue({ value: '💰' });
    expect(form.valid).toBe(true);
    
    // Clear value
    form.patchValue({ value: '' });
    expect(form.valid).toBe(false);
  });

  it('should handle custom config overrides', () => {
    const customConfig: IconPickerConfig = {
      showEmoji: false,
      showUrl: true,
      showSuggestions: false,
      maxSuggestions: 25,
      placeholder: 'Custom placeholder'
    };
    
    component.config = customConfig;
    
    expect(component.config.showEmoji).toBe(false);
    expect(component.config.showUrl).toBe(true);
    expect(component.config.showSuggestions).toBe(false);
    expect(component.config.maxSuggestions).toBe(25);
    expect(component.config.placeholder).toBe('Custom placeholder');
  });

  it('should handle null value input gracefully', () => {
    component.value = null;
    component.ngOnInit();
    
    expect(component.iconForm.get('value')?.value).toBe('');
    expect(component.iconForm.get('label')?.value).toBe('');
    expect(component.iconForm.get('tags')?.value).toEqual([]);
  });

  it('should destroy subscriptions on component destroy', () => {
    spyOn(component['destroy$'], 'next');
    spyOn(component['destroy$'], 'complete');
    
    component.ngOnDestroy();
    
    expect(component['destroy$'].next).toHaveBeenCalled();
    expect(component['destroy$'].complete).toHaveBeenCalled();
  });
});
