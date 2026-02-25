import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WolSnapInteractionComponent } from './snap-interaction.component';

describe('WolSnapInteractionComponent', () => {
  let component: WolSnapInteractionComponent;
  let fixture: ComponentFixture<WolSnapInteractionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WolSnapInteractionComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(WolSnapInteractionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
