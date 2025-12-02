import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-guide',
  imports: [RouterOutlet],
  templateUrl: './guide.component.html',
  styleUrl: './guide.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GuideComponent {}
