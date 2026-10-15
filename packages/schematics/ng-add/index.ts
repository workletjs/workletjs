import { Rule, SchematicsException } from '@angular-devkit/schematics';

import { Schema } from './schema';

export function ngAdd(options: Schema): Rule {
  void options;
  return () => {
    throw new SchematicsException('The ng-add implementation is not available yet.');
  };
}
