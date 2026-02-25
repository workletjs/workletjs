import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WolRotateControlComponent } from './rotate-control.component';

describe('WolRotateControlComponent', () => {
  let component: WolRotateControlComponent;
  let fixture: ComponentFixture<WolRotateControlComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WolRotateControlComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(WolRotateControlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
