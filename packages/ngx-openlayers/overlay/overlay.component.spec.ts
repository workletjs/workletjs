import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WolOverlayComponent } from './overlay.component';

describe('WolOverlayComponent', () => {
  let component: WolOverlayComponent;
  let fixture: ComponentFixture<WolOverlayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WolOverlayComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(WolOverlayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
