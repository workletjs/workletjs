import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WolDataTileSourceComponent } from './data-tile-source.component';

describe('WolDataTileSourceComponent', () => {
  let component: WolDataTileSourceComponent;
  let fixture: ComponentFixture<WolDataTileSourceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WolDataTileSourceComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(WolDataTileSourceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
