import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WolImageStaticSourceComponent } from './image-static-source.component';

describe('WolImageStaticSourceComponent', () => {
  let component: WolImageStaticSourceComponent;
  let fixture: ComponentFixture<WolImageStaticSourceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WolImageStaticSourceComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(WolImageStaticSourceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
