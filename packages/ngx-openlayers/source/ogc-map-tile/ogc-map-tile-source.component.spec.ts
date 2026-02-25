import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WolOGCMapTileSourceComponent } from './ogc-map-tile-source.component';

describe('WolOGCMapTileSourceComponent', () => {
  let component: WolOGCMapTileSourceComponent;
  let fixture: ComponentFixture<WolOGCMapTileSourceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WolOGCMapTileSourceComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(WolOGCMapTileSourceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
