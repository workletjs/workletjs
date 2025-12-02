import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-guide',
  imports: [],
  templateUrl: './guide.component.html',
  styleUrl: './guide.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GuideComponent {}
