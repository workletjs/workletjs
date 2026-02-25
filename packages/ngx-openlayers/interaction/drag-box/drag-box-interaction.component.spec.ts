import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WolDragBoxInteractionComponent } from './drag-box-interaction.component';

describe('WolDragBoxInteractionComponent', () => {
  let component: WolDragBoxInteractionComponent;
  let fixture: ComponentFixture<WolDragBoxInteractionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WolDragBoxInteractionComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(WolDragBoxInteractionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
