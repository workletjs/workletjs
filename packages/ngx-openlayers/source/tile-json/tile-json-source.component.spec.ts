import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WolTileJSONSourceComponent } from './tile-json-source.component';

describe('WolTileJSONSourceComponent', () => {
  let component: WolTileJSONSourceComponent;
  let fixture: ComponentFixture<WolTileJSONSourceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WolTileJSONSourceComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(WolTileJSONSourceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
