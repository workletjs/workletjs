import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WolScaleLineControlComponent } from './scale-line-control.component';

describe('WolScaleLineControlComponent', () => {
  let component: WolScaleLineControlComponent;
  let fixture: ComponentFixture<WolScaleLineControlComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WolScaleLineControlComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(WolScaleLineControlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
