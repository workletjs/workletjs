import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WolDragPanInteractionComponent } from './drag-pan-interaction.component';

describe('WolDragPanInteractionComponent', () => {
  let component: WolDragPanInteractionComponent;
  let fixture: ComponentFixture<WolDragPanInteractionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WolDragPanInteractionComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(WolDragPanInteractionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
