import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const scriptPath = fileURLToPath(new URL('./extract-release-notes.mjs', import.meta.url));

function runCli(args) {
  return spawnSync(process.execPath, [scriptPath, ...args], { encoding: 'utf8' });
}

function createChangelog(t, contents) {
  const directory = mkdtempSync(join(tmpdir(), 'extract-release-notes-'));
  t.after(() => rmSync(directory, { recursive: true, force: true }));
  const file = join(directory, 'CHANGELOG.md');
  writeFileSync(file, contents);
  return file;
}

test('extracts the requested release date and body without adjacent releases', (t) => {
  const file = createChangelog(
    t,
    `## 22.2.0 (2026-10-23)

### Features

- Add map setup schematics.

# 22.0.0 (2026-08-07)

- Previous release.
`,
  );
  const result = runCli(['--file', file, '--version', '22.2.0']);

  assert.equal(result.status, 0);
  assert.equal(result.stderr, '');
  assert.equal(
    result.stdout,
    'Release Date: 2026-10-23\n---\n### Features\n\n- Add map setup schematics.\n',
  );
});

test('accepts a prerelease under a major release heading without a date', (t) => {
  const file = createChangelog(t, '# [22.2.0-rc.1]\n\n- Preview release.\n');
  const result = runCli(['--file', file, '--version', '22.2.0-rc.1']);

  assert.equal(result.status, 0);
  assert.equal(result.stderr, '');
  assert.equal(result.stdout, 'Release Date: N/A\n---\n- Preview release.\n');
});

test('reports a missing release using the requested version without a stack trace', (t) => {
  const file = createChangelog(t, '## 22.0.1 (2026-08-13)\n\n- Previous release.\n');
  const result = runCli(['--file', file, '--version', '22.2.0']);

  assert.equal(result.status, 1);
  assert.equal(result.stdout, '');
  assert.equal(result.stderr, '❌ No changelog entry found for version 22.2.0\n');
});

test('reports a missing changelog file', (t) => {
  const existingFile = createChangelog(t, '');
  const missingFile = `${existingFile}.missing`;
  const result = runCli(['--file', missingFile, '--version', '22.2.0']);

  assert.equal(result.status, 1);
  assert.equal(result.stdout, '');
  assert.equal(result.stderr, `❌ CHANGELOG not found: ${missingFile}\n`);
});

test('prints usage when required arguments are missing', () => {
  for (const args of [[], ['--file', 'CHANGELOG.md'], ['--version', '22.2.0']]) {
    const result = runCli(args);

    assert.equal(result.status, 1);
    assert.equal(result.stdout, '');
    assert.equal(
      result.stderr,
      'Usage: extract-release-notes --file <CHANGELOG.md> --version <x.y.z>\n',
    );
  }
});
