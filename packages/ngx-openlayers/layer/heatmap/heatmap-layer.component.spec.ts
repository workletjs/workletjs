import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WolHeatmapLayerComponent } from './heatmap-layer.component';

describe('WolHeatmapLayerComponent', () => {
  let component: WolHeatmapLayerComponent;
  let fixture: ComponentFixture<WolHeatmapLayerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WolHeatmapLayerComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(WolHeatmapLayerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
