import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WolDragAndDropInteractionComponent } from './drag-and-drop-interaction.component';

describe('WolDragAndDropInteractionComponent', () => {
  let component: WolDragAndDropInteractionComponent;
  let fixture: ComponentFixture<WolDragAndDropInteractionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WolDragAndDropInteractionComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(WolDragAndDropInteractionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
