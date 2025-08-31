import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-agreements',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="agreements-container">
      <h1>Agreements</h1>
      <p>Manage your financial agreements and contracts.</p>
    </div>
  `,
  styles: [`
    .agreements-container {
      padding: 20px;
    }
  `]
})
export class AgreementsComponent {}
