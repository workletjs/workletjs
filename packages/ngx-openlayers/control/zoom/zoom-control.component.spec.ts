import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WolZoomControlComponent } from './zoom-control.component';

describe('WolZoomControlComponent', () => {
  let component: WolZoomControlComponent;
  let fixture: ComponentFixture<WolZoomControlComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WolZoomControlComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(WolZoomControlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
