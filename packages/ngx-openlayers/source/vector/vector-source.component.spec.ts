import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WolVectorSourceComponent } from './vector-source.component';
import Feature from 'ol/Feature';
import { Geometry } from 'ol/geom';

describe('WolVectorSourceComponent', () => {
  let component: WolVectorSourceComponent;
  let fixture: ComponentFixture<WolVectorSourceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WolVectorSourceComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(WolVectorSourceComponent<Feature<Geometry>>);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
