import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WolPinchRotateInteractionComponent } from './pinch-rotate-interaction.component';

describe('WolPinchRotateInteractionComponent', () => {
  let component: WolPinchRotateInteractionComponent;
  let fixture: ComponentFixture<WolPinchRotateInteractionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WolPinchRotateInteractionComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(WolPinchRotateInteractionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
