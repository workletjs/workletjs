import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WolSelectInteractionComponent } from './select-interaction.component';

describe('WolSelectInteractionComponent', () => {
  let component: WolSelectInteractionComponent;
  let fixture: ComponentFixture<WolSelectInteractionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WolSelectInteractionComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(WolSelectInteractionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
