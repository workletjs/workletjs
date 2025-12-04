import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WolVectorImageLayerComponent } from './vector-image-layer.component';

describe('WolVectorImageLayerComponent', () => {
  let component: WolVectorImageLayerComponent;
  let fixture: ComponentFixture<WolVectorImageLayerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WolVectorImageLayerComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(WolVectorImageLayerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
