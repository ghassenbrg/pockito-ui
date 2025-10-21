import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';

import { WalletDetailComponent } from './wallet-detail.component';
import { WalletService, TransactionService } from '@api/services';
import { LoadingService, ToastService } from '@shared/services';
import { Currency, WalletType } from '@api/models';

describe('WalletDetailComponent', () => {
  let component: WalletDetailComponent;
  let fixture: ComponentFixture<WalletDetailComponent>;
  let mockWalletService: jasmine.SpyObj<WalletService>;
  let mockTransactionService: jasmine.SpyObj<TransactionService>;
  let mockLoadingService: jasmine.SpyObj<LoadingService>;
  let mockToastService: jasmine.SpyObj<ToastService>;
  let mockTranslateService: jasmine.SpyObj<TranslateService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockActivatedRoute: jasmine.SpyObj<ActivatedRoute>;

  beforeEach(async () => {
    // Create spies for all services
    mockWalletService = jasmine.createSpyObj('WalletService', ['getWallet', 'deleteWallet']);
    mockTransactionService = jasmine.createSpyObj('TransactionService', ['getTransactionsByWallet']);
    mockLoadingService = jasmine.createSpyObj('LoadingService', ['show', 'hide']);
    mockToastService = jasmine.createSpyObj('ToastService', ['showSuccess', 'showError']);
    mockTranslateService = jasmine.createSpyObj('TranslateService', ['instant', 'get']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockActivatedRoute = jasmine.createSpyObj('ActivatedRoute', [], {
      snapshot: { params: { id: 'test-wallet-id' } }
    });

    // Setup default return values
    mockTranslateService.instant.and.returnValue('Test Translation');
    mockTranslateService.get.and.returnValue(of('Test Translation'));
    mockLoadingService.show.and.returnValue('mock-loading-id');
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
    }));
    mockTransactionService.getTransactionsByWallet.and.returnValue(of({
      totalPages: 1,
      totalElements: 0,
      size: 10,
      content: [],
      number: 0,
      first: true,
      last: true,
      numberOfElements: 0,
      empty: true
    }));

    await TestBed.configureTestingModule({
      imports: [
        WalletDetailComponent,
        TranslateModule.forRoot()
      ],
      providers: [
        { provide: WalletService, useValue: mockWalletService },
        { provide: TransactionService, useValue: mockTransactionService },
        { provide: LoadingService, useValue: mockLoadingService },
        { provide: ToastService, useValue: mockToastService },
        { provide: TranslateService, useValue: mockTranslateService },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(WalletDetailComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with wallet ID from route', () => {
    component.ngOnInit();
    expect(component.walletId).toBe('test-wallet-id');
  });

  it('should load wallet and transactions on init', () => {
    component.ngOnInit();
    expect(mockWalletService.getWallet).toHaveBeenCalledWith('test-wallet-id');
    expect(mockTransactionService.getTransactionsByWallet).toHaveBeenCalledWith('test-wallet-id', { page: 0, size: 10 });
  });

  it('should handle load more correctly', () => {
    component.ngOnInit(); // Initialize walletId first
    
    // Set up existing pageable transactions
    component.pageableTransactions = {
      totalPages: 2,
      totalElements: 20,
      size: 10,
      content: [],
      number: 0,
      first: true,
      last: false,
      numberOfElements: 10,
      empty: false
    };
    
    // Clear previous calls
    mockTransactionService.getTransactionsByWallet.calls.reset();
    
    component.onLoadMore();
    
    // Check that the API was called with next page (0 + 1 = 1)
    expect(mockTransactionService.getTransactionsByWallet).toHaveBeenCalledWith('test-wallet-id', { page: 1, size: 10 });
  });

  it('should show edit dialog when showEditWalletDialog is called', () => {
    component.showEditWalletDialog();
    expect(component.displayEditWalletDialog).toBeTrue();
  });

  it('should hide edit dialog when onFormCancelled is called', () => {
    component.displayEditWalletDialog = true;
    component.onFormCancelled();
    expect(component.displayEditWalletDialog).toBeFalse();
  });

  it('should update wallet when onWalletSaved is called', () => {
    const updatedWallet = {
      id: 'test-wallet-id',
      name: 'Updated Wallet',
      balance: 2000,
      currency: Currency.USD,
      type: WalletType.CASH,
      initialBalance: 0,
      description: 'Updated Description',
      color: '#1d4ed8',
      iconUrl: '',
      isDefault: false,
      goalAmount: 0
    };
    
    component.onWalletSaved(updatedWallet);
    expect(component.wallet).toEqual(updatedWallet);
  });
});
