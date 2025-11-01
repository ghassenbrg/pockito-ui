import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

import { TransactionFormDialogComponent } from './transaction-form-dialog.component';
import { TransactionService } from '@api/services/transaction.service';
import { CategoryService } from '@api/services/category.service';
import { WalletService } from '@api/services/wallet.service';
import { ToastService } from '@shared/services/toast.service';

describe('TransactionFormDialogComponent', () => {
  let component: TransactionFormDialogComponent;
  let fixture: ComponentFixture<TransactionFormDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        TransactionFormDialogComponent,
        TranslateModule.forRoot({
          defaultLanguage: 'en',
          useDefaultLang: true
        }),
        HttpClientTestingModule,
        ReactiveFormsModule
      ],
      providers: [
        TransactionService,
        CategoryService,
        WalletService,
        ToastService
      ]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TransactionFormDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
