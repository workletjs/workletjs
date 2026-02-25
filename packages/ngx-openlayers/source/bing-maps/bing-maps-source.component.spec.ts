import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WolBingMapsSourceComponent } from './bing-maps-source.component';

describe('WolBingMapsSourceComponent', () => {
  let component: WolBingMapsSourceComponent;
  let fixture: ComponentFixture<WolBingMapsSourceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WolBingMapsSourceComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(WolBingMapsSourceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
