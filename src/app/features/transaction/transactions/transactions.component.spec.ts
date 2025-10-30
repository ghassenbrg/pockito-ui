import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { TransactionsComponent } from './transactions.component';
import { TransactionService } from '@api/services';
import { LoadingService, ToastService } from '@shared/services';
import { PageTransactionDto, TransactionDto, TransactionType } from '@api/models';
import { TransactionsStateService } from '../../../state/transaction/transactions-state.service';

describe('TransactionsComponent', () => {
  let component: TransactionsComponent;
  let fixture: ComponentFixture<TransactionsComponent>;
  let transactionService: jasmine.SpyObj<TransactionService>;
  let transactionsStateService: jasmine.SpyObj<TransactionsStateService>;
  let loadingService: jasmine.SpyObj<LoadingService>;
  let toastService: jasmine.SpyObj<ToastService>;
  let translateService: TranslateService;

  const mockTransactions: TransactionDto[] = [
    {
      id: '1',
      username: 'testuser',
      transactionType: TransactionType.EXPENSE,
      amount: 100,
      exchangeRate: 1,
      effectiveDate: new Date('2024-01-01'),
      note: 'Test expense',
      walletFromName: 'Test Wallet',
      createdAt: new Date('2024-01-01T00:00:00Z'),
      updatedAt: new Date('2024-01-01T00:00:00Z')
    },
    {
      id: '2',
      username: 'testuser',
      transactionType: TransactionType.INCOME,
      amount: 200,
      exchangeRate: 1,
      effectiveDate: new Date('2024-01-02'),
      note: 'Test income',
      walletToName: 'Test Wallet',
      createdAt: new Date('2024-01-02T00:00:00Z'),
      updatedAt: new Date('2024-01-02T00:00:00Z')
    }
  ];

  const mockPageableTransactions: PageTransactionDto = {
    content: mockTransactions,
    totalPages: 2,
    totalElements: 20,
    size: 10,
    number: 0,
    first: true,
    last: false,
    numberOfElements: 10,
    empty: false,
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
    const transactionServiceSpy = jasmine.createSpyObj('TransactionService', ['listTransactions']);
    const transactionsStateServiceSpy = jasmine.createSpyObj('TransactionsStateService', 
      ['loadFirstPage', 'loadNextPage'], 
      ['pageable$', 'isLoading$']
    );
    const loadingServiceSpy = jasmine.createSpyObj('LoadingService', ['showWithId', 'hide', 'hideAll']);
    const toastServiceSpy = jasmine.createSpyObj('ToastService', ['showError']);

    await TestBed.configureTestingModule({
      imports: [
        TransactionsComponent,
        TranslateModule.forRoot({
          fallbackLang: 'en'
        }),
        HttpClientTestingModule
      ],
      providers: [
        { provide: TransactionService, useValue: transactionServiceSpy },
        { provide: TransactionsStateService, useValue: transactionsStateServiceSpy },
        { provide: LoadingService, useValue: loadingServiceSpy },
        { provide: ToastService, useValue: toastServiceSpy }
      ]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TransactionsComponent);
    component = fixture.componentInstance;
    transactionService = TestBed.inject(TransactionService) as jasmine.SpyObj<TransactionService>;
    transactionsStateService = TestBed.inject(TransactionsStateService) as jasmine.SpyObj<TransactionsStateService>;
    loadingService = TestBed.inject(LoadingService) as jasmine.SpyObj<LoadingService>;
    toastService = TestBed.inject(ToastService) as jasmine.SpyObj<ToastService>;
    translateService = TestBed.inject(TranslateService);

    // Setup default spy returns
    spyOn(translateService, 'instant').and.returnValue('Test Message');
    spyOn(translateService, 'get').and.returnValue(of('Test Message'));
    // Setup observables
    Object.defineProperty(transactionsStateServiceSpy, 'pageable$', {
      value: of(mockPageableTransactions),
      writable: true
    });
    Object.defineProperty(transactionsStateServiceSpy, 'isLoading$', {
      value: of(false),
      writable: true
    });
  });

  describe('Component Creation', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });
  });

  describe('ngOnInit', () => {
    it('should call loadFirstPage on init', () => {
      component.ngOnInit();
      expect(transactionsStateService.loadFirstPage).toHaveBeenCalledWith({
        page: 0,
        size: 10,
        sort: ['effectiveDate,desc']
      });
    });

    it('should subscribe to pageable$ observable', () => {
      component.ngOnInit();
      expect(component.pageableTransactions$).toBeDefined();
    });
  });

  describe('onLoadMore', () => {
    it('should call loadNextPage on transactions state service', () => {
      component.onLoadMore();
      expect(transactionsStateService.loadNextPage).toHaveBeenCalled();
    });
  });

  describe('Template Integration', () => {
    it('should pass pageableTransactions$ to transaction-list component', () => {
      component.ngOnInit();
      fixture.detectChanges();
      
      const transactionListElement = fixture.debugElement.nativeElement.querySelector('app-transaction-list');
      expect(transactionListElement).toBeTruthy();
    });
  });

  describe('Loading State Binding', () => {
    it('should bind to isLoading$ from transactions state', () => {
      component.ngOnInit();
      expect(component.pageableTransactions$).toBeDefined();
    });
  });
});
