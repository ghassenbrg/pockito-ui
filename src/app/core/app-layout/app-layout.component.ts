import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PockitoTerminalComponent } from '@core/pockito-terminal/pockito-terminal.component';
import { MenuItem, MessageService } from 'primeng/api';
import { DialogModule } from 'primeng/dialog';
import { DockModule } from 'primeng/dock';
import { GalleriaModule } from 'primeng/galleria';
import { MenubarModule } from 'primeng/menubar';
import { TerminalModule, TerminalService } from 'primeng/terminal';
import { TreeModule } from 'primeng/tree';
import { KeycloakService } from './../keycloak.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    DockModule,
    MenubarModule,
    DialogModule,
    TreeModule,
    TerminalModule,
    GalleriaModule,
    PockitoTerminalComponent,
  ],
  providers: [MessageService, TerminalService],
  templateUrl: './app-layout.component.html',
  styleUrls: ['./app-layout.component.scss'],
})
export class AppLayoutComponent implements OnInit {
  displayTerminal: boolean = false;

  displayMore: boolean = false;

  dockItems: MenuItem[] | undefined;

  moreItems: MenuItem[] | undefined;

  constructor(
    private messageService: MessageService,
    private router: Router,
    private KeycloakService: KeycloakService
  ) {}

  ngOnInit() {
    this.dockItems = [
      {
        label: 'Dashboard',
        tooltipOptions: {
          tooltipLabel: 'Dashboard',
          tooltipPosition: 'top',
          positionTop: -15,
          positionLeft: 15,
          showDelay: 300,
        },
        icon: '/assets/favicon.png',
        command: () => {
          this.navigateTo('/app/dashboard');
        },
      },
      {
        label: 'Wallets',
        tooltipOptions: {
          tooltipLabel: 'Wallets',
          tooltipPosition: 'top',
          positionTop: -15,
          positionLeft: 15,
          showDelay: 300,
        },
        icon: '/assets/icons/wallet.png',
        command: () => {
          this.navigateTo('/app/wallets');
        },
      },
      {
        label: 'Transactions',
        tooltipOptions: {
          tooltipLabel: 'Transactions',
          tooltipPosition: 'top',
          positionTop: -15,
          positionLeft: 15,
          showDelay: 300,
        },
        icon: '/assets/icons/transaction.png',
        command: () => {
          this.navigateTo('/app/transactions');
        },
      },
      {
        label: 'Subscriptions',
        tooltipOptions: {
          tooltipLabel: 'Subscriptions',
          tooltipPosition: 'top',
          positionTop: -15,
          positionLeft: 15,
          showDelay: 300,
        },
        icon: '/assets/icons/subscription.png',
        command: () => {
          this.navigateTo('/app/subscriptions');
        },
      },
      {
        label: 'Budgets',
        tooltipOptions: {
          tooltipLabel: 'Budgets',
          tooltipPosition: 'top',
          positionTop: -15,
          positionLeft: 15,
          showDelay: 300,
        },
        icon: '/assets/icons/budget.png',
        command: () => {
          this.navigateTo('/app/budgets');
        },
      },
      {
        label: 'Agreements',
        tooltipOptions: {
          tooltipLabel: 'Agreements',
          tooltipPosition: 'top',
          positionTop: -15,
          positionLeft: 15,
          showDelay: 300,
        },
        icon: '/assets/icons/agreement.png',
        command: () => {
          this.navigateTo('/app/agreements');
        },
      },
      {
        label: 'More',
        tooltipOptions: {
          tooltipLabel: 'More',
          tooltipPosition: 'top',
          positionTop: -15,
          positionLeft: 15,
          showDelay: 300,
        },
        icon: '/assets/icons/more.png',
        command: () => {
          this.displayMore = true;
        },
      },
    ];

    this.moreItems = [
      {
        label: 'Categories',
        tooltipOptions: {
          tooltipLabel: 'Categories',
          tooltipPosition: 'top',
          positionTop: -15,
          positionLeft: 15,
          showDelay: 300,
        },
        icon: '/assets/icons/category.png',
        command: () => {
          this.navigateTo('/app/categories');
        },
      },
      {
        label: 'Terminal',
        tooltipOptions: {
          tooltipLabel: 'Terminal',
          tooltipPosition: 'top',
          positionTop: -15,
          positionLeft: 15,
          showDelay: 300,
        },
        icon: '/assets/icons/terminal.svg',
        command: () => {
          this.displayTerminal = true;
        },
      },
      {
        label: 'GitHub',
        tooltipOptions: {
          tooltipLabel: 'GitHub',
          tooltipPosition: 'top',
          positionTop: -15,
          positionLeft: 15,
          showDelay: 300,
        },
        icon: '/assets/icons/github.svg',
        command: () => {
          window.open('https://github.com/ghassenbrg/pockito', '_blank');
        },
      },
      {
        label: 'Account',
        tooltipOptions: {
          tooltipLabel: 'Account',
          tooltipPosition: 'top',
          positionTop: -15,
          positionLeft: 15,
          showDelay: 300,
        },
        icon: '/assets/icons/account.png',
        command: () => {
          this.navigateTo('/app/account');
        },
      },
      {
        label: 'Settings',
        tooltipOptions: {
          tooltipLabel: 'Settings',
          tooltipPosition: 'top',
          positionTop: -15,
          positionLeft: 15,
          showDelay: 300,
        },
        icon: '/assets/icons/settings.png',
        command: () => {
          this.navigateTo('/app/settings');
        },
      },
      {
        label: 'Logout',
        tooltipOptions: {
          tooltipLabel: 'Logout',
          tooltipPosition: 'top',
          positionTop: -15,
          positionLeft: 15,
          showDelay: 300,
        },
        icon: '/assets/icons/logout.png',
        command: () => {
          this.KeycloakService.logout();
        },
      }
    ];
  }

  navigateTo(route: string) {
    this.router.navigate([route]);
  }

  commandHandler(command: any) {
    this.displayMore = false;
    command();
  }
}
