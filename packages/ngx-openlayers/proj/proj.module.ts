import { NgModule } from '@angular/core';
import { WolFromLonLatPipe } from './from-lon-lat.pipe';
import { WolToLonLatPipe } from './to-lon-lat.pipe';

@NgModule({
  imports: [WolFromLonLatPipe, WolToLonLatPipe],
  exports: [WolFromLonLatPipe, WolToLonLatPipe],
})
export class WolProjModule {}
