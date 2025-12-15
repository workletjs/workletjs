import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WolDrawInteractionComponent } from './draw-interaction.component';

describe('WolDrawInteractionComponent', () => {
  let component: WolDrawInteractionComponent;
  let fixture: ComponentFixture<WolDrawInteractionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WolDrawInteractionComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(WolDrawInteractionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
