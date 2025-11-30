import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WolCartoDBSourceComponent } from './cartodb-source.component';

describe('WolCartoDBSourceComponent', () => {
  let component: WolCartoDBSourceComponent;
  let fixture: ComponentFixture<WolCartoDBSourceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WolCartoDBSourceComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(WolCartoDBSourceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
