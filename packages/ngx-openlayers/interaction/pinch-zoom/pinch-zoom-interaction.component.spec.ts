import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WolPinchZoomInteractionComponent } from './pinch-zoom-interaction.component';

describe('WolPinchZoomInteractionComponent', () => {
  let component: WolPinchZoomInteractionComponent;
  let fixture: ComponentFixture<WolPinchZoomInteractionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WolPinchZoomInteractionComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(WolPinchZoomInteractionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
