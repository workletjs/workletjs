import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WolImageTileSourceComponent } from './image-tile-source.component';

describe('WolImageTileSourceComponent', () => {
  let component: WolImageTileSourceComponent;
  let fixture: ComponentFixture<WolImageTileSourceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WolImageTileSourceComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(WolImageTileSourceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
