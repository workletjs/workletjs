import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WolTileDebugSourceComponent } from './tile-debug-source.component';

describe('WolTileDebugSourceComponent', () => {
  let component: WolTileDebugSourceComponent;
  let fixture: ComponentFixture<WolTileDebugSourceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WolTileDebugSourceComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(WolTileDebugSourceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
