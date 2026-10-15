import { Rule, SchematicsException } from '@angular-devkit/schematics';

import { Schema } from './schema';

export function application(options: Schema): Rule {
  void options;
  return () => {
    throw new SchematicsException('The application implementation is not available yet.');
  };
}
