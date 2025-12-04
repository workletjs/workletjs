import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WolOGCVectorTileSourceComponent } from './ogc-vector-tile-source.component';

describe('WolOGCVectorTileSourceComponent', () => {
  let component: WolOGCVectorTileSourceComponent;
  let fixture: ComponentFixture<WolOGCVectorTileSourceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WolOGCVectorTileSourceComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(WolOGCVectorTileSourceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
