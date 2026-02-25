import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WolZoomToExtentControlComponent } from './zoom-to-extent-control.component';

describe('WolZoomToExtentControlComponent', () => {
  let component: WolZoomToExtentControlComponent;
  let fixture: ComponentFixture<WolZoomToExtentControlComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WolZoomToExtentControlComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(WolZoomToExtentControlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
