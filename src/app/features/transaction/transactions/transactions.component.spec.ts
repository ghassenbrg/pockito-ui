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
  });

  describe('Component Creation', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with default values', () => {
      expect(component.pageableTransactions).toBeUndefined();
      expect(component.loading).toBeFalse();
      expect(component.currentPage).toBe(0);
      expect(component.pageSize).toBe(10);
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

    it('should set loading to true and show loading service', () => {
      // Use a delayed observable to test loading state
      transactionService.listTransactions.and.returnValue(
        of(mockPageableTransactions).pipe(delay(100))
      );
      
      component.loadTransactions();
      
      // Check loading state immediately after calling loadTransactions
      expect(component.loading).toBeTrue();
      expect(loadingService.show).toHaveBeenCalledWith('Test Message');
      expect(translateService.instant).toHaveBeenCalledWith('transactions.loading');
    });

    it('should call transactionService with correct parameters', () => {
      component.loadTransactions();
      
      expect(transactionService.listTransactions).toHaveBeenCalledWith({
        page: 0,
        size: 10,
        sort: ['effectiveDate,desc']
      });
    });

    it('should handle successful response', () => {
      component.loadTransactions();
      
      expect(component.pageableTransactions).toEqual(mockPageableTransactions);
      expect(component.loading).toBeFalse();
      expect(loadingService.hide).toHaveBeenCalled();
    });

    it('should handle error response', () => {
      const error = new Error('API Error');
      transactionService.listTransactions.and.returnValue(throwError(() => error));
      
      component.loadTransactions();
      
      expect(component.loading).toBeFalse();
      expect(loadingService.hide).toHaveBeenCalled();
      expect(toastService.showError).toHaveBeenCalledWith(
        'transactions.loadingError',
        'transactions.loadingErrorMessage'
      );
    });

    it('should use current page and page size when loading', () => {
      component.currentPage = 2;
      component.pageSize = 20;
      
      component.loadTransactions();
      
      expect(transactionService.listTransactions).toHaveBeenCalledWith({
        page: 2,
        size: 20,
        sort: ['effectiveDate,desc']
      });
    });
  });

  describe('onPageChange', () => {
    beforeEach(() => {
      spyOn(component, 'loadTransactions');
    });

    it('should update currentPage and reload transactions', () => {
      const event = { first: 20, rows: 10 };
      
      component.onPageChange(event);
      
      expect(component.currentPage).toBe(2); // Math.floor(20 / 10)
      expect(component.loadTransactions).toHaveBeenCalled();
    });

    it('should handle different page sizes correctly', () => {
      const event = { first: 15, rows: 5 };
      
      component.onPageChange(event);
      
      expect(component.currentPage).toBe(3); // Math.floor(15 / 5)
      expect(component.loadTransactions).toHaveBeenCalled();
    });

    it('should handle zero-based pagination', () => {
      const event = { first: 0, rows: 10 };
      
      component.onPageChange(event);
      
      expect(component.currentPage).toBe(0);
      expect(component.loadTransactions).toHaveBeenCalled();
    });
  });

  describe('onPageSizeChange', () => {
    beforeEach(() => {
      spyOn(component, 'loadTransactions');
    });

    it('should update pageSize, reset currentPage to 0, and reload transactions', () => {
      component.currentPage = 5;
      component.pageSize = 10;
      
      component.onPageSizeChange(25);
      
      expect(component.pageSize).toBe(25);
      expect(component.currentPage).toBe(0);
      expect(component.loadTransactions).toHaveBeenCalled();
    });

    it('should handle page size change from any current page', () => {
      component.currentPage = 3;
      
      component.onPageSizeChange(50);
      
      expect(component.pageSize).toBe(50);
      expect(component.currentPage).toBe(0);
      expect(component.loadTransactions).toHaveBeenCalled();
    });
  });

  describe('Loading States', () => {
    it('should show loading service with translated message', () => {
      (translateService.instant as jasmine.Spy).and.returnValue('Loading transactions...');
      transactionService.listTransactions.and.returnValue(of(mockPageableTransactions));
      
      component.loadTransactions();
      
      expect(loadingService.show).toHaveBeenCalledWith('Loading transactions...');
      expect(translateService.instant).toHaveBeenCalledWith('transactions.loading');
    });

    it('should hide loading service on successful response', () => {
      transactionService.listTransactions.and.returnValue(of(mockPageableTransactions));
      
      component.loadTransactions();
      
      expect(loadingService.hide).toHaveBeenCalled();
    });

    it('should hide loading service on error response', () => {
      transactionService.listTransactions.and.returnValue(throwError(() => new Error('API Error')));
      
      component.loadTransactions();
      
      expect(loadingService.hide).toHaveBeenCalled();
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
    });

    it('should reset loading state on error', () => {
      transactionService.listTransactions.and.returnValue(throwError(() => new Error('API Error')));
      
      component.loadTransactions();
      
      expect(component.loading).toBeFalse();
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

    it('should handle page change events from transaction-list component', () => {
      spyOn(component, 'onPageChange');
      const event = { first: 10, rows: 5 };
      
      component.onPageChange(event);
      
      expect(component.onPageChange).toHaveBeenCalledWith(event);
    });

    it('should handle page size change events from transaction-list component', () => {
      spyOn(component, 'onPageSizeChange');
      const newPageSize = 25;
      
      component.onPageSizeChange(newPageSize);
      
      expect(component.onPageSizeChange).toHaveBeenCalledWith(newPageSize);
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
      
      expect(component.pageableTransactions).toEqual(emptyPageableTransactions);
      expect(component.loading).toBeFalse();
    });

    it('should handle very large page numbers', () => {
      const event = { first: 999999, rows: 10 };
      spyOn(component, 'loadTransactions');
      
      component.onPageChange(event);
      
      expect(component.currentPage).toBe(99999); // Math.floor(999999 / 10)
    });

    it('should handle zero page size change', () => {
      spyOn(component, 'loadTransactions');
      
      component.onPageSizeChange(0);
      
      expect(component.pageSize).toBe(0);
      expect(component.currentPage).toBe(0);
      expect(component.loadTransactions).toHaveBeenCalled();
    });
  });
});
