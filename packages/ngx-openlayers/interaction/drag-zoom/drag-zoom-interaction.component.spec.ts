import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WolDragZoomInteractionComponent } from './drag-zoom-interaction.component';

describe('WolDragZoomInteractionComponent', () => {
  let component: WolDragZoomInteractionComponent;
  let fixture: ComponentFixture<WolDragZoomInteractionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WolDragZoomInteractionComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(WolDragZoomInteractionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
