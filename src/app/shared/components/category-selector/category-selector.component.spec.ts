import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TranslateModule } from '@ngx-translate/core';

import { CategorySelectorComponent } from './category-selector.component';
import { CategoryService } from '@api/services';
import { ToastService } from '@shared/services/toast.service';

describe('CategorySelectorComponent', () => {
  let component: CategorySelectorComponent;
  let fixture: ComponentFixture<CategorySelectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        CategorySelectorComponent,
        HttpClientTestingModule,
        TranslateModule.forRoot()
      ],
      providers: [
        CategoryService,
        ToastService
      ]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CategorySelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
