import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WolWebGLTileLayerComponent } from './webgl-tile-layer.component';

describe('WolWebGLTileLayerComponent', () => {
  let component: WolWebGLTileLayerComponent;
  let fixture: ComponentFixture<WolWebGLTileLayerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WolWebGLTileLayerComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(WolWebGLTileLayerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
