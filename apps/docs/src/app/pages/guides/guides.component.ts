import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'wol-docs-guides',
  imports: [RouterOutlet],
  templateUrl: './guides.component.html',
  styleUrl: './guides.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GuidesComponent {}
