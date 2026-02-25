import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WolWebGLVectorLayerComponent } from './webgl-vector-layer.component';

describe('WolWebGLVectorLayerComponent', () => {
  let component: WolWebGLVectorLayerComponent;
  let fixture: ComponentFixture<WolWebGLVectorLayerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WolWebGLVectorLayerComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(WolWebGLVectorLayerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
