import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WolSentinelHubSourceComponent } from './sentinel-hub-source.component';

describe('WolSentinelHubSourceComponent', () => {
  let component: WolSentinelHubSourceComponent;
  let fixture: ComponentFixture<WolSentinelHubSourceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WolSentinelHubSourceComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(WolSentinelHubSourceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
