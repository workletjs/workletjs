import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WolUTFGridSourceComponent } from './utf-grid-source.component';

describe('WolUTFGridSourceComponent', () => {
  let component: WolUTFGridSourceComponent;
  let fixture: ComponentFixture<WolUTFGridSourceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WolUTFGridSourceComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(WolUTFGridSourceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
