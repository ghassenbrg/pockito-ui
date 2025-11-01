import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, of } from 'rxjs';

import { TransactionFormComponent } from './transaction-form.component';
import { CategoryService, TransactionService, WalletService } from '@api/services';
import { CategoryType } from '@api/models';
import { ToastService } from '@shared/services/toast.service';
import { TransactionsStateService } from '@state/transaction/transactions-state.service';
import { WalletStateService } from '@state/wallet/wallet-state.service';

describe('TransactionFormComponent', () => {
  let component: TransactionFormComponent;
  let fixture: ComponentFixture<TransactionFormComponent>;
  let mockCategoryService: jasmine.SpyObj<CategoryService>;
  let mockTransactionService: jasmine.SpyObj<TransactionService>;
  let mockWalletService: jasmine.SpyObj<WalletService>;
  let mockToastService: jasmine.SpyObj<ToastService>;
  let mockTranslateService: jasmine.SpyObj<TranslateService>;
  let mockTransactionsStateService: jasmine.SpyObj<TransactionsStateService>;
  let mockWalletStateService: jasmine.SpyObj<WalletStateService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockActivatedRoute: any;

  beforeEach(async () => {
    // Create spies for all services
    mockCategoryService = jasmine.createSpyObj('CategoryService', ['getCategoriesByType']);
    mockTransactionService = jasmine.createSpyObj('TransactionService', ['createTransaction', 'updateTransaction', 'getTransaction']);
    mockWalletService = jasmine.createSpyObj('WalletService', ['getUserWallets']);
    mockToastService = jasmine.createSpyObj('ToastService', ['showSuccess', 'showError']);
    mockTranslateService = jasmine.createSpyObj('TranslateService', ['instant', 'get']);
    mockTransactionsStateService = jasmine.createSpyObj('TransactionsStateService', ['loadTransactionById', 'createTransaction', 'updateTransaction'], {
      currentTransaction$: new BehaviorSubject(null)
    });
    mockWalletStateService = jasmine.createSpyObj('WalletStateService', ['loadWallets'], {
      wallets$: new BehaviorSubject([])
    });
    mockRouter = jasmine.createSpyObj('Router', ['navigate'], {
      url: '/app/transactions'
    });
    mockActivatedRoute = {
      snapshot: { params: {} },
      params: of({}),
      queryParams: of({})
    };

    // Setup default return values
    mockTranslateService.instant.and.returnValue('Test Translation');
    mockTranslateService.get.and.returnValue(of('Test Translation'));
    mockCategoryService.getCategoriesByType.and.returnValue(of({ categories: [], totalCount: 0 }));
    mockWalletService.getUserWallets.and.returnValue(of({ wallets: [], totalCount: 0 }));
    mockTransactionsStateService.createTransaction.and.returnValue(of({} as any));
    mockTransactionsStateService.updateTransaction.and.returnValue(of({} as any));

    await TestBed.configureTestingModule({
      imports: [
        TransactionFormComponent,
        HttpClientTestingModule,
        TranslateModule.forRoot()
      ],
      providers: [
        { provide: CategoryService, useValue: mockCategoryService },
        { provide: TransactionService, useValue: mockTransactionService },
        { provide: WalletService, useValue: mockWalletService },
        { provide: ToastService, useValue: mockToastService },
        { provide: TranslateService, useValue: mockTranslateService },
        { provide: TransactionsStateService, useValue: mockTransactionsStateService },
        { provide: WalletStateService, useValue: mockWalletStateService },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TransactionFormComponent);
    component = fixture.componentInstance;
    // Don't call detectChanges() immediately to avoid template rendering issues
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
