import { cpSync, existsSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const workspaceRoot = fileURLToPath(new URL('../../../', import.meta.url));

/** Run only after both the Angular package and independent collection build have completed. */
export function packageSchematics(
  libraryRoot = join(workspaceRoot, 'dist/packages/ngx-openlayers'),
  schematicsRoot = join(workspaceRoot, 'dist/packages/schematics'),
) {
  if (!existsSync(join(libraryRoot, 'package.json'))) {
    throw new Error('Build the Angular library before packaging its schematics.');
  }
  if (!existsSync(join(schematicsRoot, 'collection.json'))) {
    throw new Error('Build the schematics collection before packaging the library.');
  }
  const destination = join(libraryRoot, 'schematics');
  rmSync(destination, { recursive: true, force: true });
  cpSync(schematicsRoot, destination, { recursive: true });
}
