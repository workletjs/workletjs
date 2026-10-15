import { json } from '@angular-devkit/core';
import { Rule, SchematicsException, Tree } from '@angular-devkit/schematics';
import { NodePackageInstallTask } from '@angular-devkit/schematics/tasks';
import { JSONFile } from '@schematics/angular/utility/json-file';
import {
  ProjectDefinition,
  WorkspaceDefinition,
  getWorkspace,
  writeWorkspace,
} from '@schematics/angular/utility/workspace';

import { DependencyAddition, prepareDependencies } from './dependencies';

export interface SetupPlan {
  workspace: WorkspaceDefinition;
  project: ProjectDefinition;
  projectName: string;
  dependencies: DependencyAddition[];
}

/** Read and validate only; subsequent example preflight can still fail without any Tree writes. */
export async function prepareSetup(tree: Tree, projectName?: string): Promise<SetupPlan> {
  const workspace = await getWorkspace(tree);
  const { projectName: selected, project } = resolveProject(workspace, projectName);
  const target = project.targets.get('build');
  if (!target) {
    throw new SchematicsException(`Application "${selected}" has no build target to configure.`);
  }
  const dependencies = prepareDependencies(tree);
  target.options ??= {};
  target.options['styles'] = openLayersStyles(target.options['styles']);
  for (const configuration of Object.values(target.configurations ?? {})) {
    if (configuration && Object.hasOwn(configuration, 'styles')) {
      configuration['styles'] = openLayersStyles(configuration['styles']);
    }
  }
  return { workspace, project, projectName: selected, dependencies };
}

export function applySetup(plan: SetupPlan): Rule {
  return async (tree) => {
    const manifest = new JSONFile(tree, '/package.json');
    for (const { name, version } of plan.dependencies) {
      manifest.modify(['dependencies', name], version);
    }
    await writeWorkspace(tree, plan.workspace);
  };
}

/** Composition owns installation: one outer task after all rules, never one per shared helper. */
export function scheduleInstall(skipInstall = false, needed = true): Rule {
  return (_tree, context) => {
    if (!skipInstall && needed) context.addTask(new NodePackageInstallTask());
  };
}

function resolveProject(
  workspace: WorkspaceDefinition,
  name?: string,
): { projectName: string; project: ProjectDefinition } {
  if (name !== undefined) {
    const project = workspace.projects.get(name);
    if (!project) throw new SchematicsException(`Project "${name}" does not exist.`);
    if (project.extensions['projectType'] !== 'application') {
      throw new SchematicsException(`Project "${name}" must be an application.`);
    }
    return { projectName: name, project };
  }
  // Angular CLI provides the current-directory project through the schema's projectName default.
  const applications = [...workspace.projects]
    .filter(([, project]) => project.extensions['projectType'] === 'application')
    .sort(([first], [second]) => first.localeCompare(second));
  if (applications.length === 1) {
    const [projectName, project] = applications[0];
    return { projectName, project };
  }
  if (!applications.length)
    throw new SchematicsException('The workspace has no application to configure.');
  throw new SchematicsException(
    `Specify --project to choose an application: ${applications.map(([projectName]) => projectName).join(', ')}.`,
  );
}

function openLayersStyles(styles: json.JsonValue | undefined): json.JsonArray {
  if (styles !== undefined && !Array.isArray(styles)) {
    throw new SchematicsException(
      'Build styles must be an array before OpenLayers can be configured.',
    );
  }
  let found = false;
  const result = (styles ?? []).filter((style) => {
    const input =
      typeof style === 'string'
        ? style
        : style && typeof style === 'object' && !Array.isArray(style)
          ? style['input']
          : undefined;
    if (
      typeof input !== 'string' ||
      input.replaceAll('\\', '/').replace(/^\.\//, '') !== 'node_modules/ol/ol.css'
    )
      return true;
    if (found) return false;
    found = true;
    return true;
  });
  return found ? result : ['node_modules/ol/ol.css', ...result];
}
