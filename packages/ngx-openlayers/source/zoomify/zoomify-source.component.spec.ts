import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WolZoomifySourceComponent } from './zoomify-source.component';

describe('WolZoomifySourceComponent', () => {
  let component: WolZoomifySourceComponent;
  let fixture: ComponentFixture<WolZoomifySourceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WolZoomifySourceComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(WolZoomifySourceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
