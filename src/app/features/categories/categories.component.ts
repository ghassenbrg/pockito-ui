import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="categories-container">
      <h1>Categories</h1>
      <p>Organize your transactions with custom categories.</p>
    </div>
  `,
  styles: [`
    .categories-container {
      padding: 20px;
    }
  `]
})
export class CategoriesComponent {}
