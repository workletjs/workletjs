import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WolLayerGroupComponent } from './layer-group.component';

describe('WolLayerGroupComponent', () => {
  let component: WolLayerGroupComponent;
  let fixture: ComponentFixture<WolLayerGroupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WolLayerGroupComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(WolLayerGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
