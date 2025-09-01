import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { EditWalletComponent } from './edit-wallet.component';
import { WalletService } from '../../../api/services/wallet.service';
import { Wallet } from '../../../api/model/wallet.model';

describe('EditWalletComponent', () => {
  let component: EditWalletComponent;
  let fixture: ComponentFixture<EditWalletComponent>;
  let mockWalletService: jasmine.SpyObj<WalletService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockActivatedRoute: jasmine.SpyObj<ActivatedRoute>;

  const mockWallet: Wallet = {
    id: 'test-id',
    name: 'Test Wallet',
    initialBalance: 100,
    balance: 150,
    currency: 'TND',
    type: 'BANK_ACCOUNT',
    isDefault: false,
    active: true,
    order: 1
  };

  beforeEach(async () => {
    const walletServiceSpy = jasmine.createSpyObj('WalletService', ['getAllWallets']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const activatedRouteSpy = jasmine.createSpyObj('ActivatedRoute', [], {
      params: of({ id: 'test-id' })
    });

    await TestBed.configureTestingModule({
      imports: [EditWalletComponent, ReactiveFormsModule],
      providers: [
        { provide: WalletService, useValue: walletServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: activatedRouteSpy }
      ]
    }).compileComponents();

    mockWalletService = TestBed.inject(WalletService) as jasmine.SpyObj<WalletService>;
    mockRouter = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    mockActivatedRoute = TestBed.inject(ActivatedRoute) as jasmine.SpyObj<ActivatedRoute>;
  });

  beforeEach(() => {
    mockWalletService.getAllWallets.and.returnValue(of([mockWallet]));
    fixture = TestBed.createComponent(EditWalletComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with default values', () => {
    component.ngOnInit();
    expect(component.editWalletForm).toBeDefined();
    expect(component.editWalletForm.get('name')?.value).toBe('');
    expect(component.editWalletForm.get('currency')?.value).toBe('TND');
    expect(component.editWalletForm.get('type')?.value).toBe('BANK_ACCOUNT');
  });

  it('should load existing wallet when in edit mode', () => {
    component.ngOnInit();
    expect(component.isEditMode).toBe(true);
    expect(component.wallet).toEqual(mockWallet);
  });

  it('should populate form with wallet data', () => {
    component.ngOnInit();
    expect(component.editWalletForm.get('name')?.value).toBe(mockWallet.name);
    expect(component.editWalletForm.get('balance')?.value).toBe(mockWallet.balance);
    expect(component.editWalletForm.get('currency')?.value).toBe(mockWallet.currency);
  });

  it('should validate required fields', () => {
    component.ngOnInit();
    const nameControl = component.editWalletForm.get('name');
    
    nameControl?.setValue('');
    expect(nameControl?.invalid).toBe(true);
    
    nameControl?.setValue('Valid Name');
    expect(nameControl?.valid).toBe(true);
  });

  it('should validate name length', () => {
    component.ngOnInit();
    const nameControl = component.editWalletForm.get('name');
    
    nameControl?.setValue('A');
    expect(nameControl?.invalid).toBe(true);
    
    nameControl?.setValue('Valid Name');
    expect(nameControl?.valid).toBe(true);
  });

  it('should validate minimum values for numeric fields', () => {
    component.ngOnInit();
    const initialBalanceControl = component.editWalletForm.get('initialBalance');
    
    initialBalanceControl?.setValue(-10);
    expect(initialBalanceControl?.invalid).toBe(true);
    
    initialBalanceControl?.setValue(0);
    expect(initialBalanceControl?.valid).toBe(true);
  });

  it('should handle form submission when valid', () => {
    component.ngOnInit();
    component.editWalletForm.patchValue({
      name: 'New Wallet',
      initialBalance: 200,
      balance: 200,
      currency: 'EUR',
      type: 'CASH'
    });

    spyOn(component, 'onSubmit');
    const form = fixture.debugElement.query(By.css('form'));
    form.triggerEventHandler('ngSubmit', null);

    expect(component.onSubmit).toHaveBeenCalled();
  });

  it('should navigate back to wallets on cancel', () => {
    component.onCancel();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/wallets']);
  });

  it('should show error messages for invalid fields', () => {
    component.ngOnInit();
    const nameControl = component.editWalletForm.get('name');
    nameControl?.setValue('');
    nameControl?.markAsTouched();

    expect(component.getFieldError('name')).toBe('This field is required');
  });

  it('should detect invalid fields', () => {
    component.ngOnInit();
    const nameControl = component.editWalletForm.get('name');
    nameControl?.setValue('');
    nameControl?.markAsTouched();

    expect(component.isFieldInvalid('name')).toBe(true);
  });

  it('should handle new wallet creation mode', () => {
    // Mock route params for new wallet
    (mockActivatedRoute.params as any) = of({ id: 'new' });
    
    component.ngOnInit();
    expect(component.isEditMode).toBe(false);
    expect(component.wallet).toBeNull();
  });

  it('should clean up subscriptions on destroy', () => {
    component.ngOnInit();
    spyOn(component['routeSubscription'], 'unsubscribe');
    
    component.ngOnDestroy();
    expect(component['routeSubscription'].unsubscribe).toHaveBeenCalled();
  });
});

// Helper function for testing
function By(selector: string) {
  return { selector };
}
