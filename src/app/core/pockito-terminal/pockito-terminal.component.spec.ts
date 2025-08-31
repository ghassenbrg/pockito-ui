import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateService } from '@ngx-translate/core';
import { TerminalService } from 'primeng/terminal';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { Component } from '@angular/core';

import { PockitoTerminalComponent } from './pockito-terminal.component';

// Test component that overrides the template to avoid translate pipe issues
@Component({
  selector: 'pockito-terminal',
  template: '<div>Test Terminal Component</div>',
  standalone: true,
  imports: []
})
class TestPockitoTerminalComponent extends PockitoTerminalComponent {}

describe('PockitoTerminalComponent', () => {
  let component: TestPockitoTerminalComponent;
  let fixture: ComponentFixture<TestPockitoTerminalComponent>;
  let mockTranslateService: jasmine.SpyObj<TranslateService>;
  let mockTerminalService: jasmine.SpyObj<TerminalService>;
  let mockRouter: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    // Create mock services
    mockTranslateService = jasmine.createSpyObj('TranslateService', ['instant', 'get']);
    mockTerminalService = jasmine.createSpyObj('TerminalService', ['commandHandler', 'sendResponse']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    // Setup mock return values
    mockTranslateService.instant.and.returnValue('Mock translation');
    mockTranslateService.get.and.returnValue(of('Mock translation'));
    Object.defineProperty(mockTranslateService, 'onLangChange', {
      value: of({ lang: 'en', translations: {} }),
      writable: true
    });
    mockTerminalService.commandHandler = of('test command');

    await TestBed.configureTestingModule({
      imports: [TestPockitoTerminalComponent],
      providers: [
        { provide: TranslateService, useValue: mockTranslateService },
        { provide: TerminalService, useValue: mockTerminalService },
        { provide: Router, useValue: mockRouter }
      ]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TestPockitoTerminalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should handle date command', () => {
    component.commandHandler('date');
    expect(mockTerminalService.sendResponse).toHaveBeenCalled();
  });

  it('should handle help command', () => {
    component.commandHandler('help');
    expect(mockTerminalService.sendResponse).toHaveBeenCalled();
  });

  it('should handle unknown command', () => {
    component.commandHandler('unknown');
    expect(mockTerminalService.sendResponse).toHaveBeenCalled();
  });
});
