import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WolAttributionControlComponent } from './attribution-control.component';

describe('WolAttributionControlComponent', () => {
  let component: WolAttributionControlComponent;
  let fixture: ComponentFixture<WolAttributionControlComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WolAttributionControlComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(WolAttributionControlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
