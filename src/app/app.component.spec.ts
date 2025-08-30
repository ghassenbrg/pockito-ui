import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AppComponent } from './app.component';
import { KeycloakService } from './core/keycloak.service';
import { of } from 'rxjs';

describe('AppComponent', () => {
  let keycloakService: jasmine.SpyObj<KeycloakService>;

  beforeEach(async () => {
    const keycloakSpy = jasmine.createSpyObj('KeycloakService', ['getInitialized']);
    keycloakSpy.getInitialized.and.returnValue(of(true));

    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        provideRouter([]),
        { provide: KeycloakService, useValue: keycloakSpy }
      ]
    }).compileComponents();

    keycloakService = TestBed.inject(KeycloakService) as jasmine.SpyObj<KeycloakService>;
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render router outlet', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('router-outlet')).toBeTruthy();
  });
});
