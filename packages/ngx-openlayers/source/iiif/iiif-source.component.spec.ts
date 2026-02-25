import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WolIIIFSourceComponent } from './iiif-source.component';

describe('WolIIIFSourceComponent', () => {
  let component: WolIIIFSourceComponent;
  let fixture: ComponentFixture<WolIIIFSourceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WolIIIFSourceComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(WolIIIFSourceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
