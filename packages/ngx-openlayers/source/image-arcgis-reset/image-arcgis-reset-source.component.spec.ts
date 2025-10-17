import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WolImageArcGISResetSourceComponent } from './image-arcgis-reset-source.component';

describe('WolImageArcGISResetSourceComponent', () => {
  let component: WolImageArcGISResetSourceComponent;
  let fixture: ComponentFixture<WolImageArcGISResetSourceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WolImageArcGISResetSourceComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(WolImageArcGISResetSourceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
