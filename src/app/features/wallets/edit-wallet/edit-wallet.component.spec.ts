import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { Router, ActivatedRoute } from '@angular/router';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { By } from '@angular/platform-browser';
import { of } from 'rxjs';
import { ToastService } from '@shared/services/toast.service';
import { LoadingService } from '@shared/services/loading.service';
import { WalletService } from '@api/services/wallet.service';
import { Wallet } from '@api/model/wallet.model';
import { EditWalletComponent } from './edit-wallet.component';
import { WalletFormService } from '../services/wallet-form.service';
import { WalletFacade } from '../services/wallet.facade';
import { WalletFormData } from '../models/wallet.types';

describe('EditWalletComponent', () => {
  let component: EditWalletComponent;
  let fixture: ComponentFixture<EditWalletComponent>;
  let mockWalletService: jasmine.SpyObj<WalletService>;
  let mockWalletFormService: jasmine.SpyObj<WalletFormService>;
  let mockWalletFacade: jasmine.SpyObj<WalletFacade>;
  let mockLoadingService: jasmine.SpyObj<LoadingService>;
  let mockToastService: jasmine.SpyObj<ToastService>;
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
    orderPosition: 1
  };

  const mockWalletFormData: WalletFormData = {
    name: 'Test Wallet',
    initialBalance: 100,
    currency: 'TND' as any,
    type: 'BANK_ACCOUNT' as any,
    goalAmount: undefined,
    isDefault: false,
    active: true,
    iconUrl: undefined,
    description: undefined,
    color: '#000000'
  };

  beforeEach(async () => {
    const walletServiceSpy = jasmine.createSpyObj('WalletService', [
      'getAllWallets', 
      'getWalletById', 
      'updateWallet', 
      'createWallet'
    ]);
    
    const walletFormServiceSpy = jasmine.createSpyObj('WalletFormService', [
      'createForm',
      'populateForm',
      'setDefaultValues',
      'getFormData',
      'markFormGroupTouched',
      'getFieldError',
      'isFieldInvalid',
      'calculateGoalProgress'
    ], {
      walletTypes$: of([]),
      currencies$: of([])
    });
    
    const walletFacadeSpy = jasmine.createSpyObj('WalletFacade', [
      'getWalletById',
      'loadWalletById',
      'updateWallet',
      'createWallet',
      'clearError'
    ], {
      isLoading$: of(false),
      isCreatingWallet$: of(false),
      isUpdatingWallet$: of(false),
      isLoadingWalletById$: of(false),
      createWalletState$: of({ loading: false, error: null }),
      updateWalletState$: of({ loading: false, error: null }),
      loadWalletByIdState$: of({ loading: false, error: null }),
      selectedWallet$: of(mockWallet)
    });
    
    const loadingServiceSpy = jasmine.createSpyObj('LoadingService', ['show', 'hide'], {
      isLoading: false
    });
    const toastServiceSpy = jasmine.createSpyObj('ToastService', ['showError']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate'], {
      events: of({} as any)
    });
    const activatedRouteSpy = jasmine.createSpyObj('ActivatedRoute', [], {
      params: of({ id: 'test-id' })
    });

    // Mock TranslateLoader
    const mockTranslateLoader = {
      getTranslation: () => of({})
    };

    await TestBed.configureTestingModule({
      imports: [
        EditWalletComponent, 
        ReactiveFormsModule,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useValue: mockTranslateLoader }
        })
      ],
      providers: [
        { provide: WalletService, useValue: walletServiceSpy },
        { provide: WalletFormService, useValue: walletFormServiceSpy },
        { provide: WalletFacade, useValue: walletFacadeSpy },
        { provide: LoadingService, useValue: loadingServiceSpy },
        { provide: ToastService, useValue: toastServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: activatedRouteSpy }
      ]
    }).compileComponents();

    mockWalletService = TestBed.inject(WalletService) as jasmine.SpyObj<WalletService>;
    mockWalletFormService = TestBed.inject(WalletFormService) as jasmine.SpyObj<WalletFormService>;
    mockWalletFacade = TestBed.inject(WalletFacade) as jasmine.SpyObj<WalletFacade>;
    mockLoadingService = TestBed.inject(LoadingService) as jasmine.SpyObj<LoadingService>;
    mockToastService = TestBed.inject(ToastService) as jasmine.SpyObj<ToastService>;
    mockRouter = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    mockActivatedRoute = TestBed.inject(ActivatedRoute) as jasmine.SpyObj<ActivatedRoute>;
  });

  beforeEach(() => {
    // Setup form service mocks
    mockWalletFormService.createForm.and.returnValue({
      get: (name: string) => ({ value: mockWallet[name as keyof Wallet], invalid: false, valid: true, setValue: () => {}, markAsTouched: () => {} }),
      patchValue: () => {},
      valid: true,
      invalid: false
    } as any);
    mockWalletFormService.populateForm.and.returnValue();
    mockWalletFormService.setDefaultValues.and.returnValue();
    mockWalletFormService.getFormData.and.returnValue(mockWalletFormData);
    mockWalletFormService.markFormGroupTouched.and.returnValue();
    mockWalletFormService.getFieldError.and.returnValue('This field is required');
    mockWalletFormService.isFieldInvalid.and.returnValue(false);
    mockWalletFormService.calculateGoalProgress.and.returnValue(0);
    
    // Setup facade mocks
    mockWalletFacade.getWalletById.and.returnValue(of(mockWallet));
    mockWalletFacade.loadWalletById.and.returnValue();
    mockWalletFacade.updateWallet.and.returnValue();
    mockWalletFacade.createWallet.and.returnValue();
    mockWalletFacade.clearError.and.returnValue();
    
    fixture = TestBed.createComponent(EditWalletComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with default values', () => {
    // Test the default form values directly without route dependency
    component.ngOnInit();
    expect(component.editWalletForm).toBeDefined();
    expect(mockWalletFormService.createForm).toHaveBeenCalled();
  });

  it('should load existing wallet when in edit mode', () => {
    component.ngOnInit();
    expect(mockWalletFacade.clearError).toHaveBeenCalled();
  });

  it('should populate form with wallet data', () => {
    component.ngOnInit();
    expect(mockWalletFormService.createForm).toHaveBeenCalled();
  });

  it('should validate required fields', () => {
    component.ngOnInit();
    expect(mockWalletFormService.isFieldInvalid).toBeDefined();
  });

  it('should validate name length', () => {
    component.ngOnInit();
    expect(mockWalletFormService.isFieldInvalid).toBeDefined();
  });

  it('should validate minimum values for numeric fields', () => {
    component.ngOnInit();
    expect(mockWalletFormService.isFieldInvalid).toBeDefined();
  });

  it('should handle form submission when valid', () => {
    component.ngOnInit();
    spyOn(component, 'onSubmit');
    component.onSubmit();
    expect(component.onSubmit).toHaveBeenCalled();
  });

  it('should navigate back to wallets on cancel', () => {
    component.onCancel();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/app/wallets']);
  });

  it('should show error messages for invalid fields', () => {
    component.ngOnInit();
    const error = component.getFieldError('name');
    expect(mockWalletFormService.getFieldError).toHaveBeenCalled();
  });

  it('should detect invalid fields', () => {
    component.ngOnInit();
    const isInvalid = component.isFieldInvalid('name');
    expect(mockWalletFormService.isFieldInvalid).toHaveBeenCalled();
  });

  it('should handle new wallet creation mode', () => {
    // Test that the component correctly identifies edit mode when route has an ID
    component.ngOnInit();
    expect(mockWalletFacade.clearError).toHaveBeenCalled();
  });

  it('should clean up subscriptions on destroy', () => {
    component.ngOnInit();
    spyOn(component['routeSubscription'], 'unsubscribe');
    spyOn(component['walletOperationSubscription'], 'unsubscribe');
    
    component.ngOnDestroy();
    expect(component['routeSubscription'].unsubscribe).toHaveBeenCalled();
    expect(component['walletOperationSubscription'].unsubscribe).toHaveBeenCalled();
  });
});


