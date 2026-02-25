import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WolKeyboardZoomInteractionComponent } from './keyboard-zoom-interaction.component';

describe('WolKeyboardZoomInteractionComponent', () => {
  let component: WolKeyboardZoomInteractionComponent;
  let fixture: ComponentFixture<WolKeyboardZoomInteractionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WolKeyboardZoomInteractionComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(WolKeyboardZoomInteractionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
