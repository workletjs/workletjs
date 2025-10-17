import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WolRasterSourceComponent } from './raster-source.component';

describe('WolRasterSourceComponent', () => {
  let component: WolRasterSourceComponent;
  let fixture: ComponentFixture<WolRasterSourceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WolRasterSourceComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(WolRasterSourceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
