import {
  Rule,
  Tree,
  apply,
  applyTemplates,
  chain,
  mergeWith,
  move,
  noop,
  strings,
  url,
} from '@angular-devkit/schematics';
import {
  findBootstrapApplicationCall,
  getMainFilePath,
} from '@schematics/angular/utility/standalone/util';
import { getWorkspace } from '@schematics/angular/utility/workspace';
import { posix } from 'node:path';
import ts from 'typescript';

import { ASTWithSource, LiteralPrimitive, TmplAstElement, parseTemplate } from '@angular/compiler';

import { StaticSource, exampleError, property, stringValue, unwrap } from './static-analysis';

export interface MapExampleOptions {
  exampleName?: string;
  route?: string;
}

export interface MapExamplePlan {
  exampleName: string;
  route: string;
  className: string;
  selector: string;
  directory: string;
  routeFile: string;
  routeArrayStart: number;
  hasRoutes: boolean;
  importPath: string;
  exists: boolean;
}

export function validateMapOptions(options: MapExampleOptions): {
  exampleName: string;
  route: string;
} {
  const exampleName = options.exampleName ?? 'map-example';
  const route = options.route ?? 'map';
  for (const [name, value] of Object.entries({ exampleName, route })) {
    if (!/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/.test(value)) {
      exampleError(`${name} must be one lowercase kebab-case segment`);
    }
  }
  return { exampleName, route };
}

/** Validate everything before dependency, workspace, route or component writes take place. */
export async function prepareMapExample(
  tree: Tree,
  projectName: string,
  options: MapExampleOptions,
): Promise<MapExamplePlan> {
  const { exampleName, route } = validateMapOptions(options);
  const workspace = await getWorkspace(tree);
  const project = workspace.projects.get(projectName);
  if (!project) exampleError(`application "${projectName}" does not exist`);
  const source = new StaticSource(tree);
  const mainPath = posix.resolve('/', await getMainFilePath(tree, projectName));
  let bootstrap: ts.CallExpression;
  try {
    bootstrap = findBootstrapApplicationCall(tree, mainPath);
  } catch {
    return exampleError(
      'automatic examples support standalone bootstrapApplication applications only',
    );
  }
  assertPrimaryOutlet(tree, source, bootstrap);
  const config = bootstrap.arguments[1];
  if (!config) exampleError('the application has no Router configuration');
  const providers = property(source.object(config, 'application configuration'), 'providers');
  if (!providers) exampleError('the application has no Router provider');
  const calls = source
    .array(providers, 'application providers')
    .elements.filter(
      (element): element is ts.CallExpression =>
        ts.isCallExpression(element) &&
        source.importedName(element.expression, '@angular/router') === 'provideRouter',
    );
  if (calls.length !== 1 || !calls[0].arguments[0]) {
    exampleError('exactly one existing provideRouter call with routes is required');
  }
  const routes = source.array(calls[0].arguments[0], 'root routes');
  const routeFile = routes.getSourceFile().fileName;
  const directory = posix.join(
    '/',
    project.sourceRoot ?? posix.join(project.root, 'src'),
    'app',
    exampleName,
  );
  const componentPath = posix.join(directory, exampleName);
  let importPath = posix.relative(posix.dirname(routeFile), componentPath);
  if (!importPath.startsWith('.')) importPath = './' + importPath;
  const className = strings.classify(exampleName);
  const prefix = project.prefix ?? 'app';
  const routeObjects = collectRoutes(source, routes);
  const collisions = routeObjects.filter(
    ({ node }) => stringValue(property(node, 'path')) === route,
  );
  const exact =
    collisions.length === 1 &&
    collisions[0].root &&
    sameLazyTarget(collisions[0].node, routeFile, componentPath, className);
  if (collisions.length && !exact)
    exampleError(`route "${route}" conflicts with an existing route`);
  const outputFiles = ['ts', 'html', 'css', 'spec.ts'].map(
    (extension) => `${componentPath}.${extension}`,
  );
  for (let parent = directory; parent !== '/'; parent = posix.dirname(parent)) {
    if (tree.exists(parent)) exampleError(`component directory conflict: "${parent}" is a file`);
  }
  for (const path of outputFiles) {
    if (tree.exists(path)) continue;
    const directory = tree.getDir(path);
    if (directory.subfiles.length || directory.subdirs.length) {
      exampleError(`component file conflict: "${path}" is a directory`);
    }
  }
  const existing = outputFiles.filter((path) => tree.exists(path));
  if (exact && existing.length !== outputFiles.length) {
    exampleError(
      `the existing "${exampleName}" example is incomplete; restore all component files first`,
    );
  }
  if (!exact && existing.length)
    exampleError(`component file conflict: "${existing[0]}" already exists`);
  return {
    exampleName,
    route,
    className,
    selector: prefix ? `${prefix}-${exampleName}` : exampleName,
    directory,
    routeFile,
    routeArrayStart: routes.getStart() + 1,
    hasRoutes: routes.elements.length > 0,
    importPath,
    exists: exact,
  };
}

/** Shared by ng-add and the complete application template; does not schedule installation. */
export function applyMapExample(plan: MapExamplePlan): Rule {
  if (plan.exists) return noop();
  return chain([
    mergeWith(apply(url('../map-example/files'), [applyTemplates(plan), move(plan.directory)])),
    (tree) => {
      const recorder = tree.beginUpdate(plan.routeFile);
      recorder.insertLeft(
        plan.routeArrayStart,
        `\n  { path: '${plan.route}', loadComponent: () => import('${plan.importPath}').then(m => m.${plan.className}) }${plan.hasRoutes ? ',' : ''}\n`,
      );
      tree.commitUpdate(recorder);
    },
  ]);
}

function assertPrimaryOutlet(tree: Tree, source: StaticSource, bootstrap: ts.CallExpression): void {
  const identifier = bootstrap.arguments[0];
  if (!identifier || !ts.isIdentifier(identifier))
    exampleError('the bootstrapped root component is not static');
  const root = source.declaration(identifier);
  if (!ts.isClassDeclaration(root)) exampleError('the bootstrapped root component is not a class');
  const metadata = source.componentMetadata(root, 'root component metadata');
  if (!metadata) exampleError('the root @Component metadata cannot be analyzed');
  const standalone = property(metadata, 'standalone');
  if (standalone && standalone.kind !== ts.SyntaxKind.TrueKeyword) {
    exampleError('automatic examples support standalone root components only');
  }
  const imports = property(metadata, 'imports');
  if (
    !imports ||
    !source
      .array(imports, 'root component imports')
      .elements.some((element) =>
        ['RouterOutlet', 'RouterModule'].includes(
          source.importedName(element, '@angular/router') ?? '',
        ),
      )
  )
    exampleError('the root component must import RouterOutlet or RouterModule');
  const inline = property(metadata, 'template');
  const templateUrl = stringValue(property(metadata, 'templateUrl'));
  let template = stringValue(inline);
  const templatePath = templateUrl
    ? posix.resolve(posix.dirname(root.getSourceFile().fileName), templateUrl)
    : root.getSourceFile().fileName;
  if (templateUrl) {
    if (!tree.exists(templatePath)) exampleError(`root template "${templatePath}" is missing`);
    template = tree.readText(templatePath);
  }
  if (template === undefined)
    exampleError('the root template must be a literal template or templateUrl');
  const parsed = parseTemplate(template, templatePath);
  if (parsed.errors?.length) exampleError(`root template parsing failed: ${parsed.errors[0].msg}`);
  if (!hasPrimaryOutlet(parsed.nodes)) {
    exampleError('the root template needs an unconditional primary <router-outlet>');
  }
}

function hasPrimaryOutlet(nodes: readonly unknown[]): boolean {
  return nodes.some((node) => {
    if (!(node instanceof TmplAstElement)) return false;
    if (node.name === 'router-outlet') {
      const bound = node.inputs.find((input) => input.name === 'name');
      const name = node.attributes.find((attribute) => attribute.name === 'name');
      if (bound) {
        const value = bound.value instanceof ASTWithSource ? bound.value.ast : bound.value;
        return value instanceof LiteralPrimitive && value.value === 'primary';
      }
      if (!name || name.value === 'primary') return true;
    }
    return hasPrimaryOutlet(node.children);
  });
}

function collectRoutes(
  source: StaticSource,
  array: ts.ArrayLiteralExpression,
  root = true,
  visited = new Set<ts.ArrayLiteralExpression>(),
): { node: ts.ObjectLiteralExpression; root: boolean }[] {
  if (visited.has(array)) exampleError('cyclic child route arrays cannot be analyzed safely');
  visited.add(array);
  const result: { node: ts.ObjectLiteralExpression; root: boolean }[] = [];
  for (const element of array.elements) {
    const node = source.object(element, 'route entry');
    const path = property(node, 'path');
    if (path && stringValue(path) === undefined) exampleError('route paths must be static strings');
    result.push({ node, root });
    const children = property(node, 'children');
    if (stringValue(path) === '' && property(node, 'loadChildren')) {
      exampleError('empty-path lazy children cannot be analyzed for route conflicts');
    }
    if (stringValue(path) === '' && children) {
      result.push(
        ...collectRoutes(source, source.array(children, 'empty-path children'), false, visited),
      );
    }
  }
  visited.delete(array);
  return result;
}

function sameLazyTarget(
  object: ts.ObjectLiteralExpression,
  routeFile: string,
  componentPath: string,
  className: string,
): boolean {
  const loader = property(object, 'loadComponent');
  if (!loader || !ts.isArrowFunction(loader)) return false;
  const body = unwrap(loader.body as ts.Expression);
  if (
    !ts.isCallExpression(body) ||
    !ts.isPropertyAccessExpression(body.expression) ||
    body.expression.name.text !== 'then'
  )
    return false;
  const imported = body.expression.expression;
  if (!ts.isCallExpression(imported) || imported.expression.kind !== ts.SyntaxKind.ImportKeyword)
    return false;
  const path = stringValue(imported.arguments[0]);
  const callback = body.arguments[0];
  if (
    !path?.startsWith('.') ||
    !callback ||
    !ts.isArrowFunction(callback) ||
    callback.parameters.length !== 1
  )
    return false;
  const selected = unwrap(callback.body as ts.Expression);
  return (
    ts.isPropertyAccessExpression(selected) &&
    ts.isIdentifier(selected.expression) &&
    selected.expression.text === callback.parameters[0].name.getText() &&
    selected.name.text === className &&
    posix.resolve(posix.dirname(routeFile), path) === componentPath
  );
}
