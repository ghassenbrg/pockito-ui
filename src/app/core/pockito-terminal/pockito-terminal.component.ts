import { TerminalModule, TerminalService } from 'primeng/terminal';
import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'pockito-terminal',
  standalone: true,
  imports: [
    TerminalModule,
    TranslateModule
  ],
  providers: [TerminalService],
  templateUrl: './pockito-terminal.component.html',
  styleUrl: './pockito-terminal.component.scss',
})
export class PockitoTerminalComponent implements OnInit {
  subscription: Subscription | undefined;

  constructor(
    private terminalService: TerminalService,
    private router: Router,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.subscription = this.terminalService.commandHandler.subscribe(
      (command) => this.commandHandler(command)
    );

    // Subscribe to language changes to refresh terminal responses
    this.translate.onLangChange.subscribe(() => {
      // Refresh any cached responses or re-send current state if needed
      // For now, we'll just ensure the service is ready for new commands
    });
  }

  commandHandler(text: any) {
    let response;
    const argsIndex = text.indexOf(' ');
    const command = argsIndex !== -1 ? text.substring(0, argsIndex) : text;

    switch (command) {
      case 'date':
        response = this.translate.instant('terminal.commands.date') + ' ' + new Date().toDateString();
        break;

      case 'greet':
        response = this.translate.instant('terminal.commands.greet') + ' ' + text.substring(argsIndex + 1) + '!';
        break;

      case 'random':
        response = this.translate.instant('terminal.commands.random') + ': ' + Math.floor(Math.random() * 100);
        break;

      case 'navigate': {
        const route = argsIndex !== -1 ? text.substring(argsIndex + 1).trim() : '';
        if (route) {
          this.navigateToRoute(route);
          response = this.translate.instant('terminal.commands.navigate') + ' ' + route + '...';
        } else {
          response = this.translate.instant('terminal.commands.navigateUsage');
        }
        break;
      }

      case 'help':
        response = this.translate.instant('terminal.commands.help');
        break;

      default:
        response = this.translate.instant('terminal.commands.unknownCommand') + ' ' + command;
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
      const invalidRouteMsg = this.translate.instant('terminal.commands.invalidRoute') + ' ' + route + '. ';
      const availableRoutesMsg = this.translate.instant('terminal.commands.availableRoutes') + ': ' + validRoutes.join(', ');
      this.terminalService.sendResponse(invalidRouteMsg + availableRoutesMsg);
    }
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
