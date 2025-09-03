import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of } from 'rxjs';

import { WalletsComponent } from './wallets.component';
import { WalletFacade } from './services/wallet.facade';
import { ResponsiveService } from '@core/services/responsive.service';

describe('WalletsComponent', () => {
  let component: WalletsComponent;
  let fixture: ComponentFixture<WalletsComponent>;

  beforeEach(async () => {
    const walletFacadeSpy = jasmine.createSpyObj('WalletFacade', ['loadWallets'], {
      wallets$: of([]),
      viewMode$: of('cards' as any)
    });
    
    const responsiveServiceSpy = jasmine.createSpyObj('ResponsiveService', [], {
      screenSize$: of({ isMobile: false })
    });

    await TestBed.configureTestingModule({
      imports: [WalletsComponent, HttpClientTestingModule],
      providers: [
        { provide: WalletFacade, useValue: walletFacadeSpy },
        { provide: ResponsiveService, useValue: responsiveServiceSpy },
        provideTranslateService({
          loader: provideTranslateHttpLoader({
            prefix: '/assets/i18n/',
            suffix: '.json',
          }),
          fallbackLang: 'en',
          lang: 'en',
        }),
      ]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(WalletsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
