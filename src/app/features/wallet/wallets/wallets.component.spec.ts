import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';

import { WalletsComponent } from './wallets.component';
import { LoadingService, ToastService } from '@shared/services';
import { WalletStateService } from '../../../state/wallet/wallet-state.service';

describe('WalletsComponent', () => {
  let component: WalletsComponent;
  let fixture: ComponentFixture<WalletsComponent>;
  let mockWalletStateService: jasmine.SpyObj<WalletStateService>;
  let mockLoadingService: jasmine.SpyObj<LoadingService>;
  let mockToastService: jasmine.SpyObj<ToastService>;
  let mockTranslateService: jasmine.SpyObj<TranslateService>;

  beforeEach(async () => {
    const walletStateServiceSpy = jasmine.createSpyObj('WalletStateService', 
      ['loadWallets'], 
      ['wallets$', 'isLoading$']
    );
    const loadingServiceSpy = jasmine.createSpyObj('LoadingService', ['show', 'hide', 'hideAll', 'showWithId']);
    const toastServiceSpy = jasmine.createSpyObj('ToastService', ['showError', 'showSuccess']);
    const translateServiceSpy = jasmine.createSpyObj('TranslateService', ['instant']);

    // Setup observables
    Object.defineProperty(walletStateServiceSpy, 'wallets$', {
      value: of([]),
      writable: true
    });
    Object.defineProperty(walletStateServiceSpy, 'isLoading$', {
      value: of(false),
      writable: true
    });

    await TestBed.configureTestingModule({
      imports: [
        WalletsComponent,
        HttpClientTestingModule,
        RouterTestingModule,
        TranslateModule.forRoot()
      ],
      providers: [
        { provide: WalletStateService, useValue: walletStateServiceSpy },
        { provide: LoadingService, useValue: loadingServiceSpy },
        { provide: ToastService, useValue: toastServiceSpy },
        { provide: TranslateService, useValue: translateServiceSpy }
      ]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(WalletsComponent);
    component = fixture.componentInstance;
    mockWalletStateService = TestBed.inject(WalletStateService) as jasmine.SpyObj<WalletStateService>;
    mockLoadingService = TestBed.inject(LoadingService) as jasmine.SpyObj<LoadingService>;
    mockToastService = TestBed.inject(ToastService) as jasmine.SpyObj<ToastService>;
    mockTranslateService = TestBed.inject(TranslateService) as jasmine.SpyObj<TranslateService>;

    // Setup default mock behaviors
    mockTranslateService.instant.and.returnValue('Loading...');
    mockLoadingService.show.and.returnValue('mock-loading-id');
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
