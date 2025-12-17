import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WolTranslateInteractionComponent } from './translate-interaction.component';

describe('WolTranslateInteractionComponent', () => {
  let component: WolTranslateInteractionComponent;
  let fixture: ComponentFixture<WolTranslateInteractionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WolTranslateInteractionComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(WolTranslateInteractionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
