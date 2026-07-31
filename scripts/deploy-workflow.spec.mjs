import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

const deployWorkflow = readFileSync(
  fileURLToPath(new URL('../.github/workflows/deploy.yml', import.meta.url)),
  'utf8',
);
const deployVersionSection = deployWorkflow.match(/  deploy-version:\n[\s\S]*/)?.[0] ?? '';
const deployMetadataFunctions =
  deployWorkflow
    .match(/          resolve_is_prerelease\(\) \{\n[\s\S]*?\n          \}/)?.[0]
    .replace(/^ {10}/gm, '') ?? '';

function resolveIsPrerelease(version) {
  return spawnSync(
    'bash',
    ['-c', `${deployMetadataFunctions}\nresolve_is_prerelease "$1"`, 'bash', version],
    {
      encoding: 'utf8',
    },
  );
}

test('workflow_dispatch requires an explicit tag input', () => {
  assert.match(deployWorkflow, /workflow_dispatch:\n\s+inputs:\n\s+tag:\n/);
  assert.match(deployWorkflow, /workflow_dispatch:[\s\S]*required:\s*true/);
  assert.match(deployWorkflow, /git rev-parse "refs\/tags\/\$\{TAG_NAME\}"/);
});

test('classifies SemVer prerelease tags for deploy gating', () => {
  for (const version of ['22.0.0-alpha.1', '22.0.0-beta.0', '22.0.0-rc.2', '22.0.0-next.1']) {
    const result = resolveIsPrerelease(version);

    assert.equal(result.status, 0);
    assert.equal(result.stdout.trim(), 'true');
  }
});

test('keeps stable and build-metadata-only versions deployable as latest', () => {
  for (const version of ['22.0.0', '22.0.0+build-alpha']) {
    const result = resolveIsPrerelease(version);

    assert.equal(result.status, 0);
    assert.equal(result.stdout.trim(), 'false');
  }
});

test('gates latest deploys on stable versions only', () => {
  assert.match(
    deployWorkflow,
    /deploy-latest:[\s\S]*needs:\s+resolve-deploy-metadata[\s\S]*if:\s+\$\{\{ needs\.resolve-deploy-metadata\.outputs\.is_prerelease == 'false' \}\}/,
  );
});

test('serializes deploy jobs that push to the shared pages repository', () => {
  const sharedConcurrencyGroup =
    /concurrency:\n\s+group:\s+pages-deploy-\$\{\{ github\.workflow \}\}-\$\{\{ needs\.resolve-deploy-metadata\.outputs\.tag_name \}\}\n\s+cancel-in-progress:\s+false/;

  assert.match(
    deployWorkflow,
    /deploy-latest:[\s\S]*external_repository:\s+workletjs\/workletjs\.github\.io/,
  );
  assert.match(
    deployWorkflow,
    /deploy-version:[\s\S]*external_repository:\s+workletjs\/workletjs\.github\.io/,
  );
  assert.match(
    deployWorkflow,
    new RegExp(`deploy-latest:[\\s\\S]*${sharedConcurrencyGroup.source}`),
  );
  assert.match(
    deployWorkflow,
    new RegExp(`deploy-version:[\\s\\S]*${sharedConcurrencyGroup.source}`),
  );
});

test('deploys versioned docs from resolved tag metadata', () => {
  assert.match(deployVersionSection, /needs:\s+resolve-deploy-metadata/);
  assert.doesNotMatch(deployVersionSection, /needs:[\s\S]*deploy-latest/);
  assert.match(
    deployWorkflow,
    /ref:\s+refs\/tags\/\$\{\{ needs\.resolve-deploy-metadata\.outputs\.tag_name \}\}/,
  );
  assert.match(
    deployWorkflow,
    /--base-href=\/\$\{\{ needs\.resolve-deploy-metadata\.outputs\.tag_name \}\}\//,
  );
  assert.match(
    deployWorkflow,
    /destination_dir:\s+\$\{\{ needs\.resolve-deploy-metadata\.outputs\.tag_name \}\}/,
  );
});

test('keeps the version deploy commit message on one line', () => {
  assert.match(
    deployWorkflow,
    /env:\n\s+DEPLOY_TAG:\s+\$\{\{ needs\.resolve-deploy-metadata\.outputs\.tag_name \}\}/,
  );
  assert.match(
    deployWorkflow,
    /commit_message: 'chore\(release\): Deploy website for version \$\{\{ env\.DEPLOY_TAG \}\}'/,
  );
});
