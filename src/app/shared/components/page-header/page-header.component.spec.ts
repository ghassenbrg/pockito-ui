import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ButtonModule } from 'primeng/button';
import { PageHeaderComponent, PageHeaderConfig } from './page-header.component';

describe('PageHeaderComponent', () => {
  let component: PageHeaderComponent;
  let fixture: ComponentFixture<PageHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PageHeaderComponent, ButtonModule]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PageHeaderComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render title and subtitle when provided', () => {
    const config: PageHeaderConfig = {
      title: 'Test Title',
      subtitle: 'Test Subtitle',
      showButton: false
    };
    
    component.config = config;
    fixture.detectChanges();
    
    const titleElement = fixture.nativeElement.querySelector('.page-title');
    const subtitleElement = fixture.nativeElement.querySelector('.page-subtitle');
    
    expect(titleElement.textContent).toContain('Test Title');
    expect(subtitleElement.textContent).toContain('Test Subtitle');
  });

  it('should render button when showButton is true', () => {
    const config: PageHeaderConfig = {
      title: 'Test Title',
      buttonText: 'Test Button',
      buttonIcon: 'pi pi-plus',
      showButton: true
    };
    
    component.config = config;
    fixture.detectChanges();
    
    const buttonElement = fixture.nativeElement.querySelector('p-button');
    expect(buttonElement).toBeTruthy();
  });

  it('should emit buttonClick event when button is clicked', () => {
    const config: PageHeaderConfig = {
      title: 'Test Title',
      buttonText: 'Test Button',
      showButton: true
    };
    
    component.config = config;
    fixture.detectChanges();
    
    spyOn(component.buttonClick, 'emit');
    
    const buttonElement = fixture.nativeElement.querySelector('p-button');
    buttonElement.click();
    
    expect(component.buttonClick.emit).toHaveBeenCalled();
  });

  it('should render icon when provided', () => {
    const config: PageHeaderConfig = {
      title: 'Test Title',
      icon: 'pi pi-test',
      showButton: false
    };
    
    component.config = config;
    fixture.detectChanges();
    
    const iconElement = fixture.nativeElement.querySelector('.header-icon i');
    expect(iconElement).toBeTruthy();
    expect(iconElement.classList).toContain('pi-test');
  });
});
