import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WolFullScreenControlComponent } from './fullscreen-control.component';

describe('WolFullScreenControlComponent', () => {
  let component: WolFullScreenControlComponent;
  let fixture: ComponentFixture<WolFullScreenControlComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WolFullScreenControlComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(WolFullScreenControlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
