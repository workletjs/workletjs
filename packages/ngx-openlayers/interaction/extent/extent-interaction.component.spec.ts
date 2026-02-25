import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WolExtentInteractionComponent } from './extent-interaction.component';

describe('WolExtentInteractionComponent', () => {
  let component: WolExtentInteractionComponent;
  let fixture: ComponentFixture<WolExtentInteractionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WolExtentInteractionComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(WolExtentInteractionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
