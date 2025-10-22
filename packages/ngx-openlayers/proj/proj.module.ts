import { NgModule } from '@angular/core';
import { WolFromLonLatPipe } from './from-lon-lat.pipe';
import { WolToLonLatPipe } from './to-lon-lat.pipe';
import { WolTransformExtentPipe } from './transform-extent.pipe';
import { WolTransformPipe } from './transform.pipe';

@NgModule({
  imports: [WolFromLonLatPipe, WolToLonLatPipe, WolTransformExtentPipe, WolTransformPipe],
  exports: [WolFromLonLatPipe, WolToLonLatPipe, WolTransformExtentPipe, WolTransformPipe],
})
export class WolProjModule {}
