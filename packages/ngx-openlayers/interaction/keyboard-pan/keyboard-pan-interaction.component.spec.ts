import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WolKeyboardPanInteractionComponent } from './keyboard-pan-interaction.component';

describe('WolKeyboardPanInteractionComponent', () => {
  let component: WolKeyboardPanInteractionComponent;
  let fixture: ComponentFixture<WolKeyboardPanInteractionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WolKeyboardPanInteractionComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(WolKeyboardPanInteractionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
