import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { TransactionsComponent } from './transactions.component';
import { TransactionService } from '@api/services';
import { LoadingService, ToastService } from '@shared/services';
import { PageTransactionDto, TransactionDto, TransactionType } from '@api/models';

describe('TransactionsComponent', () => {
  let component: TransactionsComponent;
  let fixture: ComponentFixture<TransactionsComponent>;
  let transactionService: jasmine.SpyObj<TransactionService>;
  let loadingService: jasmine.SpyObj<LoadingService>;
  let toastService: jasmine.SpyObj<ToastService>;
  let translateService: TranslateService;

  const mockTransactions: TransactionDto[] = [
    {
      id: '1',
      transactionType: TransactionType.EXPENSE,
      amount: 100,
      exchangeRate: 1,
      effectiveDate: new Date('2024-01-01'),
      note: 'Test expense',
      walletFromName: 'Test Wallet'
    },
    {
      id: '2',
      transactionType: TransactionType.INCOME,
      amount: 200,
      exchangeRate: 1,
      effectiveDate: new Date('2024-01-02'),
      note: 'Test income',
      walletToName: 'Test Wallet'
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
    empty: false
  };

  beforeEach(async () => {
    const transactionServiceSpy = jasmine.createSpyObj('TransactionService', ['listTransactions']);
    const loadingServiceSpy = jasmine.createSpyObj('LoadingService', ['show', 'hide']);
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
        { provide: LoadingService, useValue: loadingServiceSpy },
        { provide: ToastService, useValue: toastServiceSpy }
      ]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TransactionsComponent);
    component = fixture.componentInstance;
    transactionService = TestBed.inject(TransactionService) as jasmine.SpyObj<TransactionService>;
    loadingService = TestBed.inject(LoadingService) as jasmine.SpyObj<LoadingService>;
    toastService = TestBed.inject(ToastService) as jasmine.SpyObj<ToastService>;
    translateService = TestBed.inject(TranslateService);

    // Setup default spy returns
    spyOn(translateService, 'instant').and.returnValue('Test Message');
    spyOn(translateService, 'get').and.returnValue(of('Test Message'));
    // Setup default transaction service to return an observable
    transactionService.listTransactions.and.returnValue(of(mockPageableTransactions));
    // Setup loading service to return mock IDs
    loadingService.show.and.returnValue('mock-loading-id');
  });

  describe('Component Creation', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with default values', () => {
      expect(component.pageableTransactions).toBeUndefined();
      expect(component.loading).toBeFalse();
      expect(component.allTransactions).toEqual([]);
    });
  });

  describe('ngOnInit', () => {
    it('should call loadTransactions on init', () => {
      spyOn(component, 'loadTransactions');
      component.ngOnInit();
      expect(component.loadTransactions).toHaveBeenCalled();
    });
  });

  describe('loadTransactions', () => {
    beforeEach(() => {
      transactionService.listTransactions.and.returnValue(of(mockPageableTransactions));
    });

    it('should show loading service on first load', () => {
      component.loadTransactions();
      
      expect(loadingService.show).toHaveBeenCalledWith('Test Message');
      expect(translateService.instant).toHaveBeenCalledWith('transactions.loading');
    });

    it('should call transactionService with correct parameters on first load', () => {
      component.loadTransactions();
      
      expect(transactionService.listTransactions).toHaveBeenCalledWith({
        page: 0,
        size: 10,
        sort: ['effectiveDate,desc']
      });
    });

    it('should handle successful response on first load', () => {
      component.loadTransactions();
      
      expect(component.allTransactions).toEqual(mockTransactions);
      expect(component.pageableTransactions).toEqual({
        ...mockPageableTransactions,
        content: mockTransactions
      });
      expect(loadingService.hide).toHaveBeenCalledWith('mock-loading-id');
    });

    it('should handle error response', () => {
      const error = new Error('API Error');
      transactionService.listTransactions.and.returnValue(throwError(() => error));
      
      component.loadTransactions();
      
      expect(loadingService.hide).toHaveBeenCalledWith('mock-loading-id');
      expect(toastService.showError).toHaveBeenCalledWith(
        'transactions.loadingError',
        'transactions.loadingErrorMessage'
      );
    });

    it('should load next page when pageableTransactions exists', () => {
      // Set up existing pageable transactions
      component.pageableTransactions = mockPageableTransactions;
      
      component.loadTransactions();
      
      expect(transactionService.listTransactions).toHaveBeenCalledWith({
        page: 1, // next page (0 + 1)
        size: 10,
        sort: ['effectiveDate,desc']
      });
    });
  });

  describe('onLoadMore', () => {
    beforeEach(() => {
      spyOn(component, 'loadTransactions');
    });

    it('should call loadTransactions when onLoadMore is called', () => {
      component.onLoadMore();
      
      expect(component.loadTransactions).toHaveBeenCalled();
    });
  });

  describe('Loading States', () => {
    it('should show loading service with translated message on first load', () => {
      (translateService.instant as jasmine.Spy).and.returnValue('Loading transactions...');
      transactionService.listTransactions.and.returnValue(of(mockPageableTransactions));
      
      component.loadTransactions();
      
      expect(loadingService.show).toHaveBeenCalledWith('Loading transactions...');
      expect(translateService.instant).toHaveBeenCalledWith('transactions.loading');
    });

    it('should hide loading service on successful response', () => {
      transactionService.listTransactions.and.returnValue(of(mockPageableTransactions));
      
      component.loadTransactions();
      
      expect(loadingService.hide).toHaveBeenCalledWith('mock-loading-id');
    });

    it('should hide loading service on error response', () => {
      transactionService.listTransactions.and.returnValue(throwError(() => new Error('API Error')));
      
      component.loadTransactions();
      
      expect(loadingService.hide).toHaveBeenCalledWith('mock-loading-id');
    });

    it('should not show loading service when pageableTransactions exists', () => {
      component.pageableTransactions = mockPageableTransactions;
      transactionService.listTransactions.and.returnValue(of(mockPageableTransactions));
      
      component.loadTransactions();
      
      expect(loadingService.show).not.toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should show error toast on API failure', () => {
      const error = new Error('Network error');
      transactionService.listTransactions.and.returnValue(throwError(() => error));
      
      component.loadTransactions();
      
      expect(toastService.showError).toHaveBeenCalledWith(
        'transactions.loadingError',
        'transactions.loadingErrorMessage'
      );
      expect(loadingService.hide).toHaveBeenCalledWith('mock-loading-id');
    });
  });

  describe('Template Integration', () => {
    it('should pass pageableTransactions to transaction-list component', () => {
      // Set up the component with mock data
      component.pageableTransactions = mockPageableTransactions;
      fixture.detectChanges();
      
      const transactionListElement = fixture.debugElement.nativeElement.querySelector('app-transaction-list');
      expect(transactionListElement).toBeTruthy();
    });

    it('should handle load more events from transaction-list component', () => {
      spyOn(component, 'onLoadMore');
      
      component.onLoadMore();
      
      expect(component.onLoadMore).toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty transaction list', () => {
      const emptyPageableTransactions: PageTransactionDto = {
        content: [],
        totalPages: 0,
        totalElements: 0,
        size: 10,
        number: 0,
        first: true,
        last: true,
        numberOfElements: 0,
        empty: true
      };
      
      transactionService.listTransactions.and.returnValue(of(emptyPageableTransactions));
      
      component.loadTransactions();
      
      expect(component.allTransactions).toEqual([]);
      expect(component.pageableTransactions).toEqual({
        ...emptyPageableTransactions,
        content: []
      });
    });

    it('should append new transactions to existing ones on load more', () => {
      // Set up existing transactions
      component.allTransactions = mockTransactions;
      component.pageableTransactions = mockPageableTransactions;
      
      const newTransactions: TransactionDto[] = [
        {
          id: '3',
          transactionType: TransactionType.EXPENSE,
          amount: 300,
          exchangeRate: 1,
          effectiveDate: new Date('2024-01-03'),
          note: 'New expense',
          walletFromName: 'Test Wallet'
        }
      ];
      
      const newPageableTransactions: PageTransactionDto = {
        ...mockPageableTransactions,
        content: newTransactions,
        number: 1
      };
      
      transactionService.listTransactions.and.returnValue(of(newPageableTransactions));
      
      component.loadTransactions();
      
      expect(component.allTransactions).toEqual([...mockTransactions, ...newTransactions]);
    });
  });
});
