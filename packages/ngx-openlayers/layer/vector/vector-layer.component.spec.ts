import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WolVectorLayerComponent } from './vector-layer.component';

describe('WolVectorLayerComponent', () => {
  let component: WolVectorLayerComponent;
  let fixture: ComponentFixture<WolVectorLayerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WolVectorLayerComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(WolVectorLayerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
