import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WolZoomSliderControlComponent } from './zoom-slider-control.component';

describe('WolZoomSliderControlComponent', () => {
  let component: WolZoomSliderControlComponent;
  let fixture: ComponentFixture<WolZoomSliderControlComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WolZoomSliderControlComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(WolZoomSliderControlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
