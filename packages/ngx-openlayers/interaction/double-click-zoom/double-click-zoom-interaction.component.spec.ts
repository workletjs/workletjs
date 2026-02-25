import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WolDoubleClickZoomInteractionComponent } from './double-click-zoom-interaction.component';

describe('WolDoubleClickZoomInteractionComponent', () => {
  let component: WolDoubleClickZoomInteractionComponent;
  let fixture: ComponentFixture<WolDoubleClickZoomInteractionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WolDoubleClickZoomInteractionComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(WolDoubleClickZoomInteractionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
