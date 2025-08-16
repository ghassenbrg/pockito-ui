import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { KeycloakService } from '../../core/keycloak.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { UtilitiesService } from '../../services/utilities.service';
import { Store } from '@ngrx/store';
import { AppState } from '../../state/app.state';
import { raise } from '../../state/notification/notification.actions';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss']
})
export class LandingComponent implements OnInit, OnDestroy {
  isLoading = true;
  isMobileMenuOpen = false;
  private subscription = new Subscription();

  constructor(
    private keycloakService: KeycloakService,
    private router: Router,
    private utilitiesService: UtilitiesService,
    private store: Store<AppState>
  ) {}

  ngOnInit(): void {
    this.subscription.add(
      this.keycloakService.getInitialized().subscribe(initialized => {
        if (initialized) {
          this.isLoading = false;
          
          // Redirect to app if already authenticated
          if (this.keycloakService.isAuthenticated()) {
            this.router.navigate(['/app']);
          }
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  login(): void {
    this.keycloakService.login();
  }

  register(): void {
    this.keycloakService.register();
  }

  scrollToSection(sectionId: string): void {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    // Close mobile menu after navigation
    this.isMobileMenuOpen = false;
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }
}
