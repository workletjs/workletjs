import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WolTileArcGISRestSourceComponent } from './tile-arcgis-rest-source.component';

describe('WolTileArcGISRestSourceComponent', () => {
  let component: WolTileArcGISRestSourceComponent;
  let fixture: ComponentFixture<WolTileArcGISRestSourceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WolTileArcGISRestSourceComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(WolTileArcGISRestSourceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
