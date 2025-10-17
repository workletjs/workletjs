import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WolImageSourceComponent } from './image-source.component';

describe('WolImageSourceComponent', () => {
  let component: WolImageSourceComponent;
  let fixture: ComponentFixture<WolImageSourceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WolImageSourceComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(WolImageSourceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
