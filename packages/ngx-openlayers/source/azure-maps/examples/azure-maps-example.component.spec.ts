import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { WolAzureMapsSourceComponent } from '../azure-maps-source.component';
import { WolAzureMapsExampleComponent } from './azure-maps-example.component';

describe('WolAzureMapsExampleComponent', () => {
  let fixture: ComponentFixture<WolAzureMapsExampleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WolAzureMapsExampleComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(WolAzureMapsExampleComponent);
    fixture.detectChanges();
  });

  it('asks for a key before rendering the map', () => {
    expect(fixture.nativeElement.querySelector('input')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('wol-map')).toBeNull();
  });

  it('renders the map after a key is submitted', async () => {
    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    input.value = 'test-key';
    input.dispatchEvent(new Event('input'));
    fixture.debugElement.query(By.css('button')).nativeElement.click();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelector('wol-map')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('input')).toBeNull();
  });

  it('switches the selected tileset on the rendered source', async () => {
    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    input.value = 'test-key';
    input.dispatchEvent(new Event('input'));
    fixture.debugElement.query(By.css('button')).nativeElement.click();
    fixture.detectChanges();
    await fixture.whenStable();

    const example = fixture.componentInstance;
    const source = fixture.debugElement.query(By.directive(WolAzureMapsSourceComponent))
      .componentInstance as WolAzureMapsSourceComponent;
    example.selectedTileset.set('microsoft.imagery');
    fixture.detectChanges();

    expect(source.getInstance()?.getUrls()?.[0]).toContain('tilesetId=microsoft.imagery');
  });
});
