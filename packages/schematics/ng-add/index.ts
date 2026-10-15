import { Rule, chain } from '@angular-devkit/schematics';

import { applyMapExample, prepareMapExample } from '../utility/map-example';
import { applySetup, prepareSetup, scheduleInstall } from '../utility/setup';
import { Schema } from './schema';

export function ngAdd(options: Schema): Rule {
  return async (tree) => {
    const setup = await prepareSetup(tree, options.project);
    const example = options.example
      ? await prepareMapExample(tree, setup.projectName, options)
      : undefined;
    return chain([
      applySetup(setup),
      ...(example ? [applyMapExample(example)] : []),
      scheduleInstall(options.skipInstall, setup.dependencies.length > 0),
    ]);
  };
}
