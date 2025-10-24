import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { DialogSelectorComponent, DialogOption } from './dialog-selector.component';

describe('DialogSelectorComponent', () => {
  let component: DialogSelectorComponent;
  let fixture: ComponentFixture<DialogSelectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        DialogSelectorComponent,
        TranslateModule.forRoot()
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DialogSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit optionSelected when selectOption is called', () => {
    spyOn(component.optionSelected, 'emit');
    const optionId = 'test-option-id';
    
    component.selectOption(optionId);
    
    expect(component.optionSelected.emit).toHaveBeenCalledWith(optionId);
  });

  it('should emit dialogClosed when closeDialog is called', () => {
    spyOn(component.dialogClosed, 'emit');
    
    component.closeDialog();
    
    expect(component.dialogClosed.emit).toHaveBeenCalled();
  });


  it('should return correct selected option', () => {
    const options: DialogOption[] = [
      { id: '1', name: 'Option 1' },
      { id: '2', name: 'Option 2' }
    ];
    component.options = options;
    component.selectedOptionId = '2';
    
    const selectedOption = component.getSelectedOption();
    
    expect(selectedOption).toEqual(options[1]);
  });

  it('should return undefined when no option is selected', () => {
    const options: DialogOption[] = [
      { id: '1', name: 'Option 1' },
      { id: '2', name: 'Option 2' }
    ];
    component.options = options;
    component.selectedOptionId = undefined;
    
    const selectedOption = component.getSelectedOption();
    
    expect(selectedOption).toBeUndefined();
  });

  it('should return iconUrl when available', () => {
    const option: DialogOption = {
      id: '1',
      name: 'Option 1',
      iconUrl: 'test-icon.png'
    };
    
    const icon = component.getOptionIcon(option);
    
    expect(icon).toBe('test-icon.png');
  });

  it('should return fallbackIcon when iconUrl is not available', () => {
    const option: DialogOption = {
      id: '1',
      name: 'Option 1',
      fallbackIcon: 'pi pi-test'
    };
    
    const icon = component.getOptionIcon(option);
    
    expect(icon).toBe('pi pi-test');
  });

  it('should return default icon when neither iconUrl nor fallbackIcon is available', () => {
    const option: DialogOption = {
      id: '1',
      name: 'Option 1'
    };
    
    const icon = component.getOptionIcon(option);
    
    expect(icon).toBe('pi pi-circle');
  });

  it('should filter options based on search term', fakeAsync(() => {
    const options: DialogOption[] = [
      { id: '1', name: 'Apple' },
      { id: '2', name: 'Banana' },
      { id: '3', name: 'Orange' }
    ];
    component.options = options;
    component.ngOnInit();
    
    component.onSearchChange('app');
    tick(300); // Advance time to trigger debounced search
    
    expect(component.getDisplayOptions()).toEqual([options[0]]);
  }));

  it('should clear search and show all options', () => {
    const options: DialogOption[] = [
      { id: '1', name: 'Apple' },
      { id: '2', name: 'Banana' }
    ];
    component.options = options;
    component.ngOnInit();
    component.searchTerm = 'app';
    component.filteredOptions = [options[0]];
    
    component.clearSearch();
    
    expect(component.searchTerm).toBe('');
    expect(component.getDisplayOptions()).toEqual(options);
  });

  it('should filter by typeLabel when available', fakeAsync(() => {
    const options: DialogOption[] = [
      { id: '1', name: 'Option 1', typeLabel: 'Income' },
      { id: '2', name: 'Option 2', typeLabel: 'Expense' }
    ];
    component.options = options;
    component.ngOnInit();
    
    component.onSearchChange('income');
    tick(300); // Advance time to trigger debounced search
    
    expect(component.getDisplayOptions()).toEqual([options[0]]);
  }));
});
