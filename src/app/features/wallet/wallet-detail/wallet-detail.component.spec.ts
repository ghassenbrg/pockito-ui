import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';

import { WalletDetailComponent } from './wallet-detail.component';
import { LoadingService, ToastService } from '@shared/services';
import { Currency, PageTransactionDto, Wallet, WalletType } from '@api/models';
import { WalletStateService } from '../../../state/wallet/wallet-state.service';
import { TransactionsStateService } from '../../../state/transaction/transactions-state.service';

describe('WalletDetailComponent', () => {
  let component: WalletDetailComponent;
  let fixture: ComponentFixture<WalletDetailComponent>;
  let mockWalletStateService: jasmine.SpyObj<WalletStateService>;
  let mockTransactionsStateService: jasmine.SpyObj<TransactionsStateService>;
  let mockLoadingService: jasmine.SpyObj<LoadingService>;
  let mockToastService: jasmine.SpyObj<ToastService>;
  let mockTranslateService: jasmine.SpyObj<TranslateService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockActivatedRoute: jasmine.SpyObj<ActivatedRoute>;
  
  const mockWallet: Wallet = {
    id: 'test-wallet-id',
    username: 'testuser',
    name: 'Test Wallet',
    balance: 1000,
    currency: Currency.USD,
    type: WalletType.CASH,
    initialBalance: 0,
    description: 'Test Description',
    color: '#1d4ed8',
    iconUrl: '',
    isDefault: false,
    goalAmount: 0,
    orderPosition: 0,
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-01T00:00:00Z'),
    active: true
  };
  
  const mockPageableTransactions: PageTransactionDto = {
    totalPages: 1,
    totalElements: 0,
    size: 10,
    content: [],
    number: 0,
    first: true,
    last: true,
    numberOfElements: 0,
    empty: true,
    sort: { empty: false, unsorted: false, sorted: true },
    pageable: {
      offset: 0,
      sort: { empty: false, unsorted: false, sorted: true },
      unpaged: false,
      paged: true,
      pageNumber: 0,
      pageSize: 10
    }
  };

  beforeEach(async () => {
    // Create spies for all services
    mockWalletStateService = jasmine.createSpyObj('WalletStateService', 
      ['loadWallet'], 
      ['currentWallet$', 'isLoading$']
    );
    mockTransactionsStateService = jasmine.createSpyObj('TransactionsStateService', 
      ['loadFirstPage', 'loadNextPage'], 
      ['pageable$', 'isLoading$']
    );
    mockLoadingService = jasmine.createSpyObj('LoadingService', ['showWithId', 'hide', 'hideAll']);
    mockToastService = jasmine.createSpyObj('ToastService', ['showSuccess', 'showError']);
    mockTranslateService = jasmine.createSpyObj('TranslateService', ['instant', 'get']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockActivatedRoute = jasmine.createSpyObj('ActivatedRoute', [], {
      snapshot: { params: { id: 'test-wallet-id' } }
    });

    // Setup default return values
    mockTranslateService.instant.and.returnValue('Test Translation');
    mockTranslateService.get.and.returnValue(of('Test Translation'));
    
    // Setup observables
    Object.defineProperty(mockWalletStateService, 'currentWallet$', {
      value: of(mockWallet),
      writable: true
    });
    Object.defineProperty(mockWalletStateService, 'isLoading$', {
      value: of(false),
      writable: true
    });
    Object.defineProperty(mockTransactionsStateService, 'pageable$', {
      value: of(mockPageableTransactions),
      writable: true
    });
    Object.defineProperty(mockTransactionsStateService, 'isLoading$', {
      value: of(false),
      writable: true
    });

    await TestBed.configureTestingModule({
      imports: [
        WalletDetailComponent,
        TranslateModule.forRoot()
      ],
      providers: [
        { provide: WalletStateService, useValue: mockWalletStateService },
        { provide: TransactionsStateService, useValue: mockTransactionsStateService },
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
    expect(mockWalletStateService.loadWallet).toHaveBeenCalledWith('test-wallet-id');
    expect(mockTransactionsStateService.loadFirstPage).toHaveBeenCalledWith(
      { page: 0, size: 10, sort: ['effectiveDate,desc'] },
      { walletId: 'test-wallet-id' }
    );
  });

  it('should handle load more correctly', () => {
    component.ngOnInit(); // Initialize walletId first
    
    // Clear previous calls
    mockTransactionsStateService.loadNextPage.calls.reset();
    
    component.onLoadMore();
    
    // Check that loadNextPage was called
    expect(mockTransactionsStateService.loadNextPage).toHaveBeenCalled();
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
      username: 'testuser',
      name: 'Updated Wallet',
      balance: 2000,
      currency: Currency.USD,
      type: WalletType.CASH,
      initialBalance: 0,
      description: 'Updated Description',
      color: '#1d4ed8',
      iconUrl: '',
      isDefault: false,
      goalAmount: 0,
      orderPosition: 0,
      createdAt: new Date('2024-01-01T00:00:00Z'),
      updatedAt: new Date('2024-01-01T00:00:00Z'),
      active: true
    };
    
    component.onWalletSaved(updatedWallet);
    expect(component.wallet).toEqual(updatedWallet);
  });
});
