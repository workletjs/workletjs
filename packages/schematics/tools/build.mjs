import { cpSync, mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const workspaceRoot = fileURLToPath(new URL('../../../', import.meta.url));
const projectRoot = join(workspaceRoot, 'packages/schematics');

/** Compile executable code independently and copy JSON schemas and file templates unchanged. */
export function buildSchematics(outputPath = join(workspaceRoot, 'dist/packages/schematics')) {
  const configFile = ts.readConfigFile(join(projectRoot, 'tsconfig.json'), ts.sys.readFile);
  if (configFile.error) {
    throw new Error(ts.flattenDiagnosticMessageText(configFile.error.messageText, '\n'));
  }
  const config = ts.parseJsonConfigFileContent(configFile.config, ts.sys, projectRoot, {
    outDir: outputPath,
  });
  const program = ts.createProgram(config.fileNames, config.options);
  const diagnostics = [...config.errors, ...ts.getPreEmitDiagnostics(program)];
  if (diagnostics.length) {
    throw new Error(
      ts.formatDiagnosticsWithColorAndContext(diagnostics, {
        getCanonicalFileName: (name) => name,
        getCurrentDirectory: () => workspaceRoot,
        getNewLine: () => '\n',
      }),
    );
  }

  rmSync(outputPath, { recursive: true, force: true });
  const result = program.emit();
  if (result.emitSkipped) {
    throw new Error('Schematics compilation did not emit executable factories.');
  }
  copyAssets(projectRoot, outputPath);
  writeFileSync(
    join(outputPath, 'package.json'),
    JSON.stringify({ type: 'commonjs' }, null, 2) + '\n',
  );
  return outputPath;
}

function copyAssets(source, destination, insideTemplate = false) {
  for (const entry of readdirSync(source, { withFileTypes: true })) {
    if (['node_modules', 'testing'].includes(entry.name)) continue;
    const sourcePath = join(source, entry.name);
    const destinationPath = join(destination, entry.name);
    const template = insideTemplate || entry.name === 'files';
    if (entry.isDirectory()) {
      copyAssets(sourcePath, destinationPath, template);
    } else if (
      template ||
      entry.name === 'collection.json' ||
      (entry.name.endsWith('.json') && source !== projectRoot)
    ) {
      mkdirSync(dirname(destinationPath), { recursive: true });
      cpSync(sourcePath, destinationPath);
    }
  }
}
