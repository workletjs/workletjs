import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WolMouseWheelZoomInteractionComponent } from './mouse-wheel-zoom-interaction.component';

describe('WolMouseWheelZoomInteractionComponent', () => {
  let component: WolMouseWheelZoomInteractionComponent;
  let fixture: ComponentFixture<WolMouseWheelZoomInteractionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WolMouseWheelZoomInteractionComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(WolMouseWheelZoomInteractionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
