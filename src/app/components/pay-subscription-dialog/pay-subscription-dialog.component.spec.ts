import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaySubscriptionDialogComponent } from './pay-subscription-dialog.component';

describe('PaySubscriptionDialogComponent', () => {
  let component: PaySubscriptionDialogComponent;
  let fixture: ComponentFixture<PaySubscriptionDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaySubscriptionDialogComponent]
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
