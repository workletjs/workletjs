import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WolVectorTileSourceComponent } from './vector-tile-source.component';

describe('WolVectorTileSourceComponent', () => {
  let component: WolVectorTileSourceComponent;
  let fixture: ComponentFixture<WolVectorTileSourceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WolVectorTileSourceComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(WolVectorTileSourceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
