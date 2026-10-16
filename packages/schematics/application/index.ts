import {
  MergeStrategy,
  Rule,
  SchematicsException,
  Tree,
  apply,
  applyTemplates,
  branchAndMerge,
  chain,
  externalSchematic,
  mergeWith,
  move,
  url,
} from '@angular-devkit/schematics';
import {
  findBootstrapApplicationCall,
  getMainFilePath,
} from '@schematics/angular/utility/standalone/util';
import { posix } from 'node:path';
import ts from 'typescript';

import {
  MapExamplePlan,
  applyMapExample,
  prepareMapExample,
  validateMapOptions,
} from '../utility/map-example';
import { applySetup, prepareSetup, scheduleInstall } from '../utility/setup';
import { StaticSource, property, stringValue } from '../utility/static-analysis';
import { Schema } from './schema';

export function application(options: Schema): Rule {
  return (original) => {
    validateMapOptions(options);
    return branchAndMerge(
      chain([
        externalSchematic('@schematics/angular', 'application', {
          name: options.name,
          projectRoot: options.projectRoot,
          standalone: true,
          zoneless: true,
          routing: true,
          style: 'css',
          testRunner: 'vitest',
          ssr: false,
          minimal: false,
          skipTests: false,
          skipPackageJson: false,
          inlineTemplate: false,
          inlineStyle: false,
          prefix: 'app',
          fileNameStyleGuide: '2025',
          strict: true,
          skipInstall: true,
        }),
        async (tree) => {
          const setup = await prepareSetup(tree, options.name);
          const map = await prepareMapExample(tree, setup.projectName, options);
          const root = await prepareRoot(tree, setup.projectName);
          return chain([
            applySetup(setup),
            mergeWith(
              apply(url('./files'), [applyTemplates(root), move(root.directory)]),
              MergeStrategy.Overwrite,
            ),
            addHomepageRedirect(map),
            // The redirect was inserted at the array start, so the shared map route remains first.
            applyMapExample({ ...map, hasRoutes: true }),
          ]);
        },
        (tree) => protectExistingFiles(original, tree),
        scheduleInstall(options.skipInstall),
      ]),
    );
  };
}

async function prepareRoot(tree: Tree, projectName: string) {
  const main = posix.resolve('/', await getMainFilePath(tree, projectName));
  const bootstrap = findBootstrapApplicationCall(tree, main);
  const identifier = bootstrap.arguments[0];
  if (!identifier || !ts.isIdentifier(identifier)) {
    throw new SchematicsException('The generated application root component cannot be resolved.');
  }
  const source = new StaticSource(tree);
  const root = source.declaration(identifier);
  if (!ts.isClassDeclaration(root) || !root.name) {
    throw new SchematicsException(
      'The generated application root must be a named component class.',
    );
  }
  const decorator = ts
    .getDecorators(root)
    ?.find(
      (candidate) =>
        ts.isCallExpression(candidate.expression) &&
        source.importedName(candidate.expression.expression, '@angular/core') === 'Component',
    );
  if (
    !decorator ||
    !ts.isCallExpression(decorator.expression) ||
    !decorator.expression.arguments[0]
  ) {
    throw new SchematicsException(
      'The generated application root has no static Component metadata.',
    );
  }
  const metadata = source.object(decorator.expression.arguments[0], 'generated component metadata');
  const selector = stringValue(property(metadata, 'selector'));
  const templateUrl = stringValue(property(metadata, 'templateUrl'));
  const styleUrl = stringValue(property(metadata, 'styleUrl'));
  if (!selector || !templateUrl || !styleUrl) {
    throw new SchematicsException(
      'The generated root component must use external HTML and CSS files.',
    );
  }
  const rootPath = root.getSourceFile().fileName;
  const directory = posix.dirname(rootPath);
  return {
    directory,
    rootFileName: posix.basename(rootPath, '.ts'),
    rootClassName: root.name.text,
    templateFileName: posix.relative(directory, posix.resolve(directory, templateUrl)),
    selector,
    templateUrl,
    styleUrl,
  };
}

function addHomepageRedirect(map: MapExamplePlan): Rule {
  return (tree) => {
    const update = tree.beginUpdate(map.routeFile);
    update.insertLeft(
      map.routeArrayStart,
      `\n  { path: '', pathMatch: 'full', redirectTo: '${map.route}' }${map.hasRoutes ? ',' : ''}\n`,
    );
    tree.commitUpdate(update);
  };
}

function protectExistingFiles(original: Tree, generated: Tree): void {
  const workspaceFiles = new Set(['/angular.json', '/package.json', '/tsconfig.json']);
  for (const action of generated.actions) {
    if (workspaceFiles.has(action.path)) continue;
    const before = original.read(action.path);
    if (!before) continue;
    const after = generated.read(action.path);
    if (!after || !before.equals(after)) {
      throw new SchematicsException(
        `Cannot create the application: "${action.path}" already exists and would be overwritten. Choose another application name or project root.`,
      );
    }
  }
}
