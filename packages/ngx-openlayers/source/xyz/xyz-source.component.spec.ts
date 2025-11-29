import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WolXYZSourceComponent } from './xyz-source.component';

describe('WolXYZSourceComponent', () => {
  let component: WolXYZSourceComponent;
  let fixture: ComponentFixture<WolXYZSourceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WolXYZSourceComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(WolXYZSourceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
