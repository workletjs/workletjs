import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WolOverviewMapControlComponent } from './overview-map-control.component';

describe('WolOverviewMapControlComponent', () => {
  let component: WolOverviewMapControlComponent;
  let fixture: ComponentFixture<WolOverviewMapControlComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WolOverviewMapControlComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(WolOverviewMapControlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
