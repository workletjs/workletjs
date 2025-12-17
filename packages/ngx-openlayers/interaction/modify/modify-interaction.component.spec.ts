import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WolModifyInteractionComponent } from './modify-interaction.component';

describe('WolModifyInteractionComponent', () => {
  let component: WolModifyInteractionComponent;
  let fixture: ComponentFixture<WolModifyInteractionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WolModifyInteractionComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(WolModifyInteractionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
