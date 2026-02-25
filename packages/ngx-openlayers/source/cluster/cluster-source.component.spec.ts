import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WolClusterSourceComponent } from './cluster-source.component';

describe('WolClusterSourceComponent', () => {
  let component: WolClusterSourceComponent;
  let fixture: ComponentFixture<WolClusterSourceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WolClusterSourceComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(WolClusterSourceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
