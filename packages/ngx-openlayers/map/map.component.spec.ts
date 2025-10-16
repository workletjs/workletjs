import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WolMapComponent } from './map.component';

describe('WolMapComponent', () => {
  let component: WolMapComponent;
  let fixture: ComponentFixture<WolMapComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WolMapComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(WolMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
