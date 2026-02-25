import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WolDragRotateAndZoomInteractionComponent } from './drag-rotate-and-zoom-interaction.component';

describe('WolDragRotateAndZoomInteractionComponent', () => {
  let component: WolDragRotateAndZoomInteractionComponent;
  let fixture: ComponentFixture<WolDragRotateAndZoomInteractionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WolDragRotateAndZoomInteractionComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(WolDragRotateAndZoomInteractionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
