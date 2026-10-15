import { Rule, SchematicsException, chain } from '@angular-devkit/schematics';

import { applySetup, prepareSetup, scheduleInstall } from '../utility/setup';
import { Schema } from './schema';

export function ngAdd(options: Schema): Rule {
  return async (tree) => {
    const setup = await prepareSetup(tree, options.project);
    if (options.example) {
      throw new SchematicsException('The map example implementation is not available yet.');
    }
    return chain([
      applySetup(setup),
      scheduleInstall(options.skipInstall, setup.dependencies.length > 0),
    ]);
  };
}
