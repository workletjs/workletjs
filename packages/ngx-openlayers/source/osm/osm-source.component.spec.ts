import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WolOSMSourceComponent } from './osm-source.component';

describe('WolOSMSourceComponent', () => {
  let component: WolOSMSourceComponent;
  let fixture: ComponentFixture<WolOSMSourceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WolOSMSourceComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(WolOSMSourceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
