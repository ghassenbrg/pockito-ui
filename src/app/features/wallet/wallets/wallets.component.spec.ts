import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';

import { WalletsComponent } from './wallets.component';
import { WalletService } from '@api/services';
import { LoadingService, ToastService } from '@shared/services';

describe('WalletsComponent', () => {
  let component: WalletsComponent;
  let fixture: ComponentFixture<WalletsComponent>;
  let mockWalletService: jasmine.SpyObj<WalletService>;
  let mockLoadingService: jasmine.SpyObj<LoadingService>;
  let mockToastService: jasmine.SpyObj<ToastService>;
  let mockTranslateService: jasmine.SpyObj<TranslateService>;

  beforeEach(async () => {
    const walletServiceSpy = jasmine.createSpyObj('WalletService', ['getUserWallets']);
    const loadingServiceSpy = jasmine.createSpyObj('LoadingService', ['show', 'hide']);
    const toastServiceSpy = jasmine.createSpyObj('ToastService', ['showError', 'showSuccess']);
    const translateServiceSpy = jasmine.createSpyObj('TranslateService', ['instant']);

    await TestBed.configureTestingModule({
      imports: [
        WalletsComponent,
        HttpClientTestingModule,
        RouterTestingModule,
        TranslateModule.forRoot()
      ],
      providers: [
        { provide: WalletService, useValue: walletServiceSpy },
        { provide: LoadingService, useValue: loadingServiceSpy },
        { provide: ToastService, useValue: toastServiceSpy },
        { provide: TranslateService, useValue: translateServiceSpy }
      ]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(WalletsComponent);
    component = fixture.componentInstance;
    mockWalletService = TestBed.inject(WalletService) as jasmine.SpyObj<WalletService>;
    mockLoadingService = TestBed.inject(LoadingService) as jasmine.SpyObj<LoadingService>;
    mockToastService = TestBed.inject(ToastService) as jasmine.SpyObj<ToastService>;
    mockTranslateService = TestBed.inject(TranslateService) as jasmine.SpyObj<TranslateService>;

    // Setup default mock behaviors
    mockWalletService.getUserWallets.and.returnValue(of([]));
    mockTranslateService.instant.and.returnValue('Loading...');
    mockLoadingService.show.and.returnValue('mock-loading-id');
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
