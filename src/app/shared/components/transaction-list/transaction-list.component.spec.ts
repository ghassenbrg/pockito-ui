import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { TransactionListComponent } from './transaction-list.component';
import { TransactionsStateService } from '../../../state/transaction/transactions-state.service';

describe('TransactionListComponent', () => {
  let component: TransactionListComponent;
  let fixture: ComponentFixture<TransactionListComponent>;
  let translateService: TranslateService;
  let mockTransactionsStateService: jasmine.SpyObj<TransactionsStateService>;

  beforeEach(async () => {
    // Create spies for all services
    mockTransactionsStateService = jasmine.createSpyObj('TransactionsStateService', [], ['transactions$']);

    // Setup observables
    Object.defineProperty(mockTransactionsStateService, 'transactions$', {
      value: of([]),
      writable: true
    });

    await TestBed.configureTestingModule({
      imports: [
        TransactionListComponent,
        HttpClientTestingModule,
        TranslateModule.forRoot({
          fallbackLang: 'en',
        }),
      ],
      providers: [
        { provide: TransactionsStateService, useValue: mockTransactionsStateService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TransactionListComponent);
    component = fixture.componentInstance;
    translateService = TestBed.inject(TranslateService);
    
    // Setup spy on the real TranslateService
    spyOn(translateService, 'instant').and.returnValue('Mocked Translation');
    spyOn(translateService, 'get').and.returnValue(of('Mocked Translation'));
    spyOn(translateService, 'getCurrentLang').and.returnValue('en');
    
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
