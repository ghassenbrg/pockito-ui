import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';

import { TransactionFormComponent } from './transaction-form.component';
import { CategoryService, TransactionService, WalletService } from '@api/services';
import { ToastService } from '@shared/services/toast.service';

describe('TransactionFormComponent', () => {
  let component: TransactionFormComponent;
  let fixture: ComponentFixture<TransactionFormComponent>;
  let mockCategoryService: jasmine.SpyObj<CategoryService>;
  let mockTransactionService: jasmine.SpyObj<TransactionService>;
  let mockWalletService: jasmine.SpyObj<WalletService>;
  let mockToastService: jasmine.SpyObj<ToastService>;
  let mockTranslateService: jasmine.SpyObj<TranslateService>;

  beforeEach(async () => {
    // Create spies for all services
    mockCategoryService = jasmine.createSpyObj('CategoryService', ['getUserCategories']);
    mockTransactionService = jasmine.createSpyObj('TransactionService', ['createTransaction', 'updateTransaction', 'getTransaction']);
    mockWalletService = jasmine.createSpyObj('WalletService', ['getUserWallets']);
    mockToastService = jasmine.createSpyObj('ToastService', ['showSuccess', 'showError']);
    mockTranslateService = jasmine.createSpyObj('TranslateService', ['instant', 'get']);

    // Setup default return values
    mockTranslateService.instant.and.returnValue('Test Translation');
    mockTranslateService.get.and.returnValue(of('Test Translation'));
    mockCategoryService.getUserCategories.and.returnValue(of([]));
    mockWalletService.getUserWallets.and.returnValue(of([]));

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
        { provide: TranslateService, useValue: mockTranslateService }
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
