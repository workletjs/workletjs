import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WolImageWMSSourceComponent } from './image-wms-source.component';

describe('WolImageWMSSourceComponent', () => {
  let component: WolImageWMSSourceComponent;
  let fixture: ComponentFixture<WolImageWMSSourceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WolImageWMSSourceComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(WolImageWMSSourceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
