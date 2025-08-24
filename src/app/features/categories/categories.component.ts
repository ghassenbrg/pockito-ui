import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CategoryListComponent } from './category-list/category-list.component';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule, CategoryListComponent],
  template: `
    <app-category-list></app-category-list>
  `,
  styles: []
})
export class CategoriesComponent {}
