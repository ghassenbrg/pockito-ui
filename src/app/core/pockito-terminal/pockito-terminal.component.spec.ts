import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PockitoTerminalComponent } from './pockito-terminal.component';

describe('PockitoTerminalComponent', () => {
  let component: PockitoTerminalComponent;
  let fixture: ComponentFixture<PockitoTerminalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PockitoTerminalComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PockitoTerminalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
