import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WolDragRotateInteractionComponent } from './drag-rotate-interaction.component';

describe('WolDragRotateInteractionComponent', () => {
  let component: WolDragRotateInteractionComponent;
  let fixture: ComponentFixture<WolDragRotateInteractionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WolDragRotateInteractionComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(WolDragRotateInteractionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
