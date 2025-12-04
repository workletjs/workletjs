import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WolVectorTileLayerComponent } from './vector-tile-layer.component';

describe('WolVectorTileLayerComponent', () => {
  let component: WolVectorTileLayerComponent;
  let fixture: ComponentFixture<WolVectorTileLayerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WolVectorTileLayerComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(WolVectorTileLayerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
