import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WolWMTSSourceComponent } from './wmts-source.component';

describe('WolWMTSSourceComponent', () => {
  let component: WolWMTSSourceComponent;
  let fixture: ComponentFixture<WolWMTSSourceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WolWMTSSourceComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(WolWMTSSourceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
