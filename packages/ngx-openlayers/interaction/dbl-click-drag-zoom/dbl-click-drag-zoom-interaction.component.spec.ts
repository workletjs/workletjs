import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WolDblClickDragZoomInteractionComponent } from './dbl-click-drag-zoom-interaction.component';

describe('WolDblClickDragZoomInteractionComponent', () => {
  let component: WolDblClickDragZoomInteractionComponent;
  let fixture: ComponentFixture<WolDblClickDragZoomInteractionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WolDblClickDragZoomInteractionComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(WolDblClickDragZoomInteractionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
