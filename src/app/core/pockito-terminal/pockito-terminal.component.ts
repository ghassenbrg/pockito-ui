import { TerminalModule, TerminalService } from 'primeng/terminal';
import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'pockito-terminal',
  standalone: true,
  imports: [
    TerminalModule,
  ],
  providers: [TerminalService],
  templateUrl: './pockito-terminal.component.html',
  styleUrl: './pockito-terminal.component.scss',
})
export class PockitoTerminalComponent implements OnInit {
  subscription: Subscription | undefined;

  constructor(
    private terminalService: TerminalService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.subscription = this.terminalService.commandHandler.subscribe(
      (command) => this.commandHandler(command)
    );
  }

  commandHandler(text: any) {
    let response;
    const argsIndex = text.indexOf(' ');
    const command = argsIndex !== -1 ? text.substring(0, argsIndex) : text;

    switch (command) {
      case 'date':
        response = 'Today is ' + new Date().toDateString();
        break;

      case 'greet':
        response = 'Hola ' + text.substring(argsIndex + 1) + '!';
        break;

      case 'random':
        response = Math.floor(Math.random() * 100);
        break;

      case 'navigate': {
        const route = argsIndex !== -1 ? text.substring(argsIndex + 1).trim() : '';
        if (route) {
          this.navigateToRoute(route);
          response = `Navigating to ${route}...`;
        } else {
          response = 'Usage: navigate <route>. Available routes: dashboard, wallets, transactions, subscriptions, budgets, agreements, categories, settings, account';
        }
        break;
      }

      case 'help':
        response = 'Available commands: date, greet, random, navigate, help';
        break;

      default:
        response = 'Unknown command: ' + command;
        break;
    }

    if (response) {
      this.terminalService.sendResponse(response as string);
    }
  }

  private navigateToRoute(route: string): void {
    const validRoutes = [
      'dashboard', 'wallets', 'transactions', 'subscriptions', 
      'budgets', 'agreements', 'categories', 'settings', 'account'
    ];
    
    if (validRoutes.includes(route)) {
      this.router.navigate(['/app', route]);
    } else {
      this.terminalService.sendResponse(`Invalid route: ${route}. Available routes: ${validRoutes.join(', ')}`);
    }
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
