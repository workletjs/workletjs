import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WolImageLayerComponent } from './image-layer.component';

describe('WolImageLayerComponent', () => {
  let component: WolImageLayerComponent;
  let fixture: ComponentFixture<WolImageLayerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WolImageLayerComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(WolImageLayerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
