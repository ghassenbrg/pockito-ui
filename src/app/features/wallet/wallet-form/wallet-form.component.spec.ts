import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';

import { WalletFormComponent } from './wallet-form.component';
import { WalletService, UserService } from '@api/services';
import { ToastService } from '@shared/services';
import { Currency, WalletType, UserDto, WalletDto } from '@api/models';

describe('WalletFormComponent', () => {
  let component: WalletFormComponent;
  let fixture: ComponentFixture<WalletFormComponent>;
  let mockWalletService: jasmine.SpyObj<WalletService>;
  let mockUserService: jasmine.SpyObj<UserService>;
  let mockTranslateService: jasmine.SpyObj<TranslateService>;
  let mockToastService: jasmine.SpyObj<ToastService>;

  beforeEach(async () => {
    // Create spies for all services
    mockWalletService = jasmine.createSpyObj('WalletService', ['getWallet', 'createWallet', 'updateWallet']);
    mockUserService = jasmine.createSpyObj('UserService', [], {
      currentUser$: of({
        id: 'test-user-id',
        username: 'testuser',
        email: 'test@example.com',
        defaultCurrency: Currency.USD,
        firstName: 'Test',
        lastName: 'User',
        active: true,
        createdAt: new Date('2023-01-01T00:00:00Z'),
        updatedAt: new Date('2023-01-01T00:00:00Z')
      } as any)
    });
    mockTranslateService = jasmine.createSpyObj('TranslateService', ['instant']);
    mockToastService = jasmine.createSpyObj('ToastService', ['showSuccess', 'showError']);

    // Setup default return values
    mockTranslateService.instant.and.returnValue('Test Translation');
    mockWalletService.getWallet.and.returnValue(of({
      id: 'test-wallet-id',
      name: 'Test Wallet',
      balance: 1000,
      currency: Currency.USD,
      type: WalletType.CASH,
      initialBalance: 0,
      description: 'Test Description',
      color: '#1d4ed8',
      iconUrl: '',
      isDefault: false,
      goalAmount: 0
    } as WalletDto));
    mockWalletService.createWallet.and.returnValue(of({
      id: 'new-wallet-id',
      name: 'New Wallet',
      balance: 0,
      currency: Currency.USD,
      type: WalletType.CASH,
      initialBalance: 0,
      description: 'New Description',
      color: '#1d4ed8',
      iconUrl: '',
      isDefault: false,
      goalAmount: 0
    } as WalletDto));
    mockWalletService.updateWallet.and.returnValue(of({
      id: 'test-wallet-id',
      name: 'Updated Wallet',
      balance: 1000,
      currency: Currency.USD,
      type: WalletType.CASH,
      initialBalance: 0,
      description: 'Updated Description',
      color: '#1d4ed8',
      iconUrl: '',
      isDefault: false,
      goalAmount: 0
    } as WalletDto));

    await TestBed.configureTestingModule({
      imports: [
        WalletFormComponent,
        ReactiveFormsModule,
        TranslateModule.forRoot()
      ],
      providers: [
        FormBuilder,
        { provide: WalletService, useValue: mockWalletService },
        { provide: UserService, useValue: mockUserService },
        { provide: TranslateService, useValue: mockTranslateService },
        { provide: ToastService, useValue: mockToastService }
      ]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(WalletFormComponent);
    component = fixture.componentInstance;
    // Don't call detectChanges() initially to avoid template rendering issues
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with default values', () => {
    expect(component.walletForm).toBeDefined();
    expect(component.walletForm.get('name')?.value).toBeNull();
    expect(component.walletForm.get('currency')?.value).toBeNull();
    expect(component.walletForm.get('type')?.value).toBeNull();
    expect(component.walletForm.get('initialBalance')?.value).toBe(0);
    expect(component.walletForm.get('description')?.value).toBeNull();
    expect(component.walletForm.get('color')?.value).toBe('#1d4ed8');
    expect(component.walletForm.get('iconUrl')?.value).toBeNull();
    expect(component.walletForm.get('isDefault')?.value).toBe(false);
  });

  it('should set edit mode when walletId is provided', () => {
    component.walletId = 'test-wallet-id';
    component.ngOnInit();
    expect(component.isEditMode).toBeTrue();
  });

  it('should not set edit mode when walletId is not provided', () => {
    component.walletId = undefined;
    component.ngOnInit();
    expect(component.isEditMode).toBeFalse();
  });

  it('should disable currency field in edit mode', () => {
    component.walletId = 'test-wallet-id';
    component.ngOnInit();
    expect(component.walletForm.get('currency')?.disabled).toBeTrue();
  });

  it('should enable currency field in create mode', () => {
    component.walletId = undefined;
    component.ngOnInit();
    expect(component.walletForm.get('currency')?.disabled).toBeFalse();
  });

  it('should load wallet data in edit mode', () => {
    component.walletId = 'test-wallet-id';
    component.ngOnInit();
    
    expect(mockWalletService.getWallet).toHaveBeenCalledWith('test-wallet-id');
  });

  it('should set user default currency in create mode', (done) => {
    component.walletId = undefined;
    component.ngOnInit();
    
    // Wait for user service subscription
    setTimeout(() => {
      expect(component.walletForm.get('currency')?.value).toBe(Currency.USD);
      done();
    }, 100);
  });

  it('should validate required fields', () => {
    component.walletForm.patchValue({
      name: '',
      currency: '',
      type: ''
    });
    
    expect(component.walletForm.get('name')?.invalid).toBeTrue();
    expect(component.walletForm.get('currency')?.invalid).toBeTrue();
    expect(component.walletForm.get('type')?.invalid).toBeTrue();
  });

  it('should validate name length', () => {
    component.walletForm.patchValue({
      name: 'a'.repeat(101) // Exceeds max length
    });
    
    expect(component.walletForm.get('name')?.invalid).toBeTrue();
  });

  it('should validate description length', () => {
    component.walletForm.patchValue({
      description: 'a'.repeat(501) // Exceeds max length
    });
    
    expect(component.walletForm.get('description')?.invalid).toBeTrue();
  });

  it('should validate initial balance minimum', () => {
    component.walletForm.patchValue({
      initialBalance: -1
    });
    
    expect(component.walletForm.get('initialBalance')?.invalid).toBeTrue();
  });

  it('should validate icon URL pattern', () => {
    component.walletForm.patchValue({
      iconUrl: 'invalid-url'
    });
    
    expect(component.walletForm.get('iconUrl')?.invalid).toBeTrue();
  });

  it('should accept valid icon URL', () => {
    component.walletForm.patchValue({
      iconUrl: 'https://example.com/image.png'
    });
    
    expect(component.walletForm.get('iconUrl')?.valid).toBeTrue();
  });

  it('should create wallet when form is valid in create mode', () => {
    spyOn(component.walletSaved, 'emit');
    component.walletId = undefined;
    component.walletForm.patchValue({
      name: 'Test Wallet',
      currency: Currency.USD,
      type: WalletType.CASH,
      initialBalance: 100,
      description: 'Test Description',
      color: '#1d4ed8',
      iconUrl: 'https://example.com/icon.png',
      isDefault: false
    });
    
    component.onSubmit();
    
    expect(mockWalletService.createWallet).toHaveBeenCalled();
    expect(component.walletSaved.emit).toHaveBeenCalled();
  });

  it('should update wallet when form is valid in edit mode', () => {
    spyOn(component.walletSaved, 'emit');
    component.walletId = 'test-wallet-id';
    component.ngOnInit(); // This will disable the currency field
    
    // Set the currency value directly since it's disabled
    component.walletForm.get('currency')?.setValue(Currency.USD);
    component.walletForm.patchValue({
      name: 'Updated Wallet',
      type: WalletType.CASH,
      initialBalance: 200,
      description: 'Updated Description',
      color: '#1d4ed8',
      iconUrl: 'https://example.com/icon.png',
      isDefault: false
    });
    
    component.onSubmit();
    
    expect(mockWalletService.updateWallet).toHaveBeenCalled();
    expect(component.walletSaved.emit).toHaveBeenCalled();
  });

  it('should not submit when form is invalid', () => {
    component.walletForm.patchValue({
      name: '', // Invalid - required
      currency: '', // Invalid - required
      type: '' // Invalid - required
    });
    
    component.onSubmit();
    
    expect(mockWalletService.createWallet).not.toHaveBeenCalled();
    expect(mockWalletService.updateWallet).not.toHaveBeenCalled();
  });

  it('should emit form cancelled event when cancel is clicked', () => {
    spyOn(component.formCancelled, 'emit');
    component.onCancel();
    expect(component.formCancelled.emit).toHaveBeenCalled();
  });

  it('should mark all fields as touched when form is invalid', () => {
    component.walletForm.patchValue({
      name: '',
      currency: '',
      type: ''
    });
    
    component.onSubmit();
    
    expect(component.walletForm.get('name')?.touched).toBeTrue();
    expect(component.walletForm.get('currency')?.touched).toBeTrue();
    expect(component.walletForm.get('type')?.touched).toBeTrue();
  });

  it('should get field error for required field', () => {
    component.walletForm.get('name')?.setValue('');
    component.walletForm.get('name')?.markAsTouched();
    component.walletForm.get('name')?.setErrors({ required: true });
    
    const error = component.getFieldError('name');
    expect(error).toBeDefined();
  });

  it('should get field error for minlength', () => {
    component.walletForm.get('name')?.setValue('a');
    component.walletForm.get('name')?.markAsTouched();
    component.walletForm.get('name')?.setErrors({ minlength: { requiredLength: 2 } });
    
    const error = component.getFieldError('name');
    expect(error).toBeDefined();
  });

  it('should get field error for maxlength', () => {
    component.walletForm.get('name')?.setValue('a'.repeat(101));
    component.walletForm.get('name')?.markAsTouched();
    component.walletForm.get('name')?.setErrors({ maxlength: { requiredLength: 100 } });
    
    const error = component.getFieldError('name');
    expect(error).toBeDefined();
  });

  it('should get field error for min value', () => {
    component.walletForm.get('initialBalance')?.setValue(-1);
    component.walletForm.get('initialBalance')?.markAsTouched();
    component.walletForm.get('initialBalance')?.setErrors({ min: { min: 0 } });
    
    const error = component.getFieldError('initialBalance');
    expect(error).toBeDefined();
  });

  it('should get field error for pattern', () => {
    component.walletForm.get('iconUrl')?.setValue('invalid-url');
    component.walletForm.get('iconUrl')?.markAsTouched();
    component.walletForm.get('iconUrl')?.setErrors({ pattern: true });
    
    const error = component.getFieldError('iconUrl');
    expect(error).toBeDefined();
  });

  it('should return empty string for field without errors', () => {
    component.walletForm.get('name')?.setValue('Valid Name');
    component.walletForm.get('name')?.markAsTouched();
    component.walletForm.get('name')?.setErrors(null);
    
    const error = component.getFieldError('name');
    expect(error).toBe('');
  });

  it('should get wallet type label', () => {
    const label = component.getWalletTypeLabel(WalletType.CASH);
    expect(label).toBeDefined();
  });

  it('should get currency label', () => {
    const label = component.getCurrencyLabel(Currency.USD);
    expect(label).toBeDefined();
  });

  it('should get icon URL', () => {
    component.walletForm.patchValue({ iconUrl: 'https://example.com/icon.png' });
    const iconUrl = component.getIconUrl();
    expect(iconUrl).toBe('https://example.com/icon.png');
  });

  it('should validate image URL', () => {
    expect(component.isValidImageUrl('https://example.com/image.png')).toBeTrue();
    expect(component.isValidImageUrl('https://example.com/image.jpg')).toBeTrue();
    expect(component.isValidImageUrl('https://example.com/image.jpeg')).toBeTrue();
    expect(component.isValidImageUrl('https://example.com/image.gif')).toBeTrue();
    expect(component.isValidImageUrl('https://example.com/image.svg')).toBeTrue();
    expect(component.isValidImageUrl('https://example.com/image.webp')).toBeTrue();
    expect(component.isValidImageUrl('invalid-url')).toBeFalse();
    expect(component.isValidImageUrl('')).toBeFalse();
  });

  it('should handle image error', () => {
    const mockEvent = {
      target: {
        style: {}
      }
    } as any;
    
    component.onImageError(mockEvent);
    expect(mockEvent.target.style.display).toBe('none');
  });
});
