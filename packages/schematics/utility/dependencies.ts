import { SchematicsException, Tree } from '@angular-devkit/schematics';
import { JSONFile } from '@schematics/angular/utility/json-file';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { intersects, satisfies, valid, validRange } from 'semver';

const peerNames = ['@angular/core', '@angular/cdk', 'ol'] as const;
const dependencySections = ['dependencies', 'devDependencies', 'optionalDependencies'] as const;

export interface DependencyAddition {
  name: string;
  version: string;
}

/** Read the installed library manifest, whose catalog references were resolved by packaging. */
export function libraryPeerDependencies(): Record<string, string> {
  const manifest = JSON.parse(readFileSync(join(__dirname, '../../package.json'), 'utf8'));
  const peers = manifest.peerDependencies;
  for (const name of peerNames) {
    if (typeof peers?.[name] !== 'string' || !validRange(peers[name])) {
      throw new SchematicsException(
        `The installed library has no resolved peer dependency range for ${name}. Reinstall a published @workletjs/ngx-openlayers package.`,
      );
    }
  }
  return peers;
}

/** Validate everything before callers apply dependency, style, route or template changes. */
export function prepareDependencies(tree: Tree): DependencyAddition[] {
  if (!tree.exists('/package.json')) {
    throw new SchematicsException('The workspace package.json is missing.');
  }
  const manifest = new JSONFile(tree, '/package.json');
  const required = libraryPeerDependencies();
  const additions: DependencyAddition[] = [];
  for (const name of peerNames) {
    const declarations = dependencySections.flatMap((section) => {
      const version = manifest.get([section, name]);
      return version === undefined ? [] : [{ section, version }];
    });
    const installed = installedVersion(tree, name);
    const range = required[name];
    const details = `${name}: declared ${declarations.map(({ version }) => JSON.stringify(version)).join(', ') || '(missing)'}, installed ${installed ?? '(not installed)'}, required ${range}.`;

    if (!declarations.length && name === '@angular/core') {
      throw new SchematicsException(
        `${details} Angular core is missing; configure an Angular application first.`,
      );
    }
    for (const { version } of declarations) {
      if (typeof version !== 'string') {
        throw new SchematicsException(`${details} Dependency declarations must be strings.`);
      }
      const declaredRange = validRange(version);
      if (declaredRange && !intersects(declaredRange, range)) {
        throw new SchematicsException(
          `${details} Use a compatible dependency version before running ng add.`,
        );
      }
      if (!declaredRange && !installed) {
        throw new SchematicsException(
          `${name}: declared ${JSON.stringify(version)} cannot be verified. Install the declared dependency first, or declare a version compatible with ${range}.`,
        );
      }
    }
    if (installed && (!valid(installed) || !satisfies(installed, range))) {
      throw new SchematicsException(
        `${details} Install a compatible version before running ng add.`,
      );
    }
    if (!declarations.length) {
      additions.push({ name, version: range });
    }
  }
  return additions;
}

function installedVersion(tree: Tree, name: string): string | undefined {
  const path = `/node_modules/${name}/package.json`;
  if (!tree.exists(path)) return undefined;
  try {
    const manifest = JSON.parse(tree.readText(path));
    if (typeof manifest.version === 'string') return manifest.version;
  } catch {
    // A malformed installed manifest cannot be used as compatibility evidence.
  }
  throw new SchematicsException(
    `Cannot read the installed version of ${name}. Reinstall workspace dependencies before running ng add.`,
  );
}
