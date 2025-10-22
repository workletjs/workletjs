import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WolGeoTIFFSourceComponent } from './geotiff-source.component';

describe('WolGeoTIFFSourceComponent', () => {
  let component: WolGeoTIFFSourceComponent;
  let fixture: ComponentFixture<WolGeoTIFFSourceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WolGeoTIFFSourceComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(WolGeoTIFFSourceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
