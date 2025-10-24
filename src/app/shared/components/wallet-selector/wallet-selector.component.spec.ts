import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TranslateModule } from '@ngx-translate/core';

import { WalletSelectorComponent } from './wallet-selector.component';
import { WalletService } from '@api/services';
import { ToastService } from '@shared/services/toast.service';

describe('WalletSelectorComponent', () => {
  let component: WalletSelectorComponent;
  let fixture: ComponentFixture<WalletSelectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        WalletSelectorComponent,
        HttpClientTestingModule,
        TranslateModule.forRoot()
      ],
      providers: [
        WalletService,
        ToastService
      ]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(WalletSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
