import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WolTileWMSSourceComponent } from './tile-wms-source.component';

describe('WolTileWMSSourceComponent', () => {
  let component: WolTileWMSSourceComponent;
  let fixture: ComponentFixture<WolTileWMSSourceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WolTileWMSSourceComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(WolTileWMSSourceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
