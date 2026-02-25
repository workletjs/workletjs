import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WolGoogleSourceComponent } from './google-source.component';

describe('WolGoogleSourceComponent', () => {
  let component: WolGoogleSourceComponent;
  let fixture: ComponentFixture<WolGoogleSourceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WolGoogleSourceComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(WolGoogleSourceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
