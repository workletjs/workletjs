import { NgModule } from '@angular/core';
import { WolAddPipe } from './add.pipe';
import { WolFormatPipe } from './format.pipe';
import { WolRotatePipe } from './rotate.pipe';
import { WolToStringHDMSPipe } from './to-string-hdms.pipe';
import { WolToStringXYPipe } from './to-string-xy.pipe';

@NgModule({
  imports: [WolAddPipe, WolFormatPipe, WolRotatePipe, WolToStringHDMSPipe, WolToStringXYPipe],
  exports: [WolAddPipe, WolFormatPipe, WolRotatePipe, WolToStringHDMSPipe, WolToStringXYPipe],
})
export class WolCoordinateModule {}
