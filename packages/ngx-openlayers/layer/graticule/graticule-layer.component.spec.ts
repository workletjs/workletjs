import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WolGraticuleLayerComponent } from './graticule-layer.component';

describe('WolGraticuleLayerComponent', () => {
  let component: WolGraticuleLayerComponent;
  let fixture: ComponentFixture<WolGraticuleLayerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WolGraticuleLayerComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(WolGraticuleLayerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
