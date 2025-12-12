import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WolPointerInteractionComponent } from './pointer-interaction.component';

describe('WolPointerInteractionComponent', () => {
  let component: WolPointerInteractionComponent;
  let fixture: ComponentFixture<WolPointerInteractionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WolPointerInteractionComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(WolPointerInteractionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
