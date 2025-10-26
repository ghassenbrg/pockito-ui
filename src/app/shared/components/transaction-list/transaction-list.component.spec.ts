import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { TransactionService } from '@api/services';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { TransactionListComponent } from './transaction-list.component';

describe('TransactionListComponent', () => {
  let component: TransactionListComponent;
  let fixture: ComponentFixture<TransactionListComponent>;
  let mockTransactionService: jasmine.SpyObj<TransactionService>;
  let translateService: TranslateService;

  beforeEach(async () => {
    // Create spies for all services
    mockTransactionService = jasmine.createSpyObj('TransactionService', [
      'createTransaction',
      'updateTransaction',
      'getTransaction',
    ]);

    await TestBed.configureTestingModule({
      imports: [
        TransactionListComponent,
        TranslateModule.forRoot({
          fallbackLang: 'en',
        }),
      ],
      providers: [
        { provide: TransactionService, useValue: mockTransactionService },
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
