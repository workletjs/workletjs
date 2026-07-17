import { NgDocNavigation } from '@ng-doc/app';

import { Component, TemplateRef, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SidebarCategoryComponent } from './sidebar-category.component';

@Component({
  imports: [SidebarCategoryComponent],
  template: `
    <app-sidebar-category
      [category]="category"
      [content]="categoryContent()"
      [expandable]="false"
    />
    <ng-template #categoryContent>
      <span data-testid="category-content">Nested category</span>
    </ng-template>
  `,
})
class TestHostComponent {
  protected readonly category = {
    title: 'Category',
  } as NgDocNavigation;
  protected readonly categoryContent = viewChild.required<TemplateRef<unknown>>('categoryContent');
}

describe('SidebarCategoryComponent', () => {
  let component: SidebarCategoryComponent;
  let fixture: ComponentFixture<SidebarCategoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SidebarCategoryComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SidebarCategoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('renders template content', () => {
    const hostFixture = TestBed.createComponent(TestHostComponent);

    hostFixture.detectChanges();

    expect(
      hostFixture.nativeElement.querySelector('[data-testid="category-content"]'),
    ).toBeTruthy();
  });
});
