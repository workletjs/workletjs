import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WolLinkInteractionComponent } from './link-interaction.component';

describe('WolLinkInteractionComponent', () => {
  let component: WolLinkInteractionComponent;
  let fixture: ComponentFixture<WolLinkInteractionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WolLinkInteractionComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(WolLinkInteractionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
