import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WolViewComponent } from './view.component';

describe('WolViewComponent', () => {
  let component: WolViewComponent;
  let fixture: ComponentFixture<WolViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WolViewComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(WolViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
