import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WolImageMapGuideSourceComponent } from './image-map-guide-source.component';

describe('WolImageMapGuideSourceComponent', () => {
  let component: WolImageMapGuideSourceComponent;
  let fixture: ComponentFixture<WolImageMapGuideSourceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WolImageMapGuideSourceComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(WolImageMapGuideSourceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
