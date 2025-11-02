import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TranslateModule } from '@ngx-translate/core';

import { PaySubscriptionDialogComponent } from './pay-subscription-dialog.component';

describe('PaySubscriptionDialogComponent', () => {
  let component: PaySubscriptionDialogComponent;
  let fixture: ComponentFixture<PaySubscriptionDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        PaySubscriptionDialogComponent,
        HttpClientTestingModule,
        TranslateModule.forRoot()
      ]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PaySubscriptionDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
