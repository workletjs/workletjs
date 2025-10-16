import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WolTileLayerComponent } from './tile-layer.component';

describe('WolTileLayerComponent', () => {
  let component: WolTileLayerComponent;
  let fixture: ComponentFixture<WolTileLayerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WolTileLayerComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(WolTileLayerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
