import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WolStadiaMapsSourceComponent } from './stadia-maps-source.component';

describe('WolStadiaMapsSourceComponent', () => {
  let component: WolStadiaMapsSourceComponent;
  let fixture: ComponentFixture<WolStadiaMapsSourceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WolStadiaMapsSourceComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(WolStadiaMapsSourceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
