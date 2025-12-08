import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WolMousePositionControlComponent } from './mouse-position-control.component';

describe('WolMousePositionControlComponent', () => {
  let component: WolMousePositionControlComponent;
  let fixture: ComponentFixture<WolMousePositionControlComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WolMousePositionControlComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(WolMousePositionControlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
