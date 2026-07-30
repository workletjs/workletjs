const assert = require('node:assert/strict');
const { test } = require('node:test');

const CoreDependencyChangelogRenderer = require('./core-dependency-changelog-renderer.cjs');
const nxConfig = require('../nx.json');
const packageConfig = require('../package.json');

const conventionalCommitsConfig = {
  types: {
    feat: { changelog: { title: '🚀 Features' } },
    fix: { changelog: { title: '🩹 Fixes' } },
    perf: { changelog: { title: '🔥 Performance' } },
    'core-deps': { changelog: { title: '⬆️ Core Dependency Updates' } },
  },
};

const remoteReleaseClient = {
  getRemoteRepoData: () => null,
};

function createChange(type, scope, description) {
  return {
    type,
    scope,
    description,
    body: '',
    isBreaking: false,
    affectedProjects: '*',
  };
}

async function render(changes) {
  const renderer = new CoreDependencyChangelogRenderer({
    changes,
    changelogEntryVersion: '22.0.0-beta.0',
    project: null,
    entryWhenNoChanges: false,
    isVersionPlans: false,
    changelogRenderOptions: {
      authors: false,
      applyUsernameToAuthors: false,
      commitReferences: false,
      versionTitleDate: false,
    },
    conventionalCommitsConfig,
    remoteReleaseClient,
  });

  return renderer.render();
}

test('renders Angular and OpenLayers upgrades as core dependency updates', async () => {
  const output = await render([
    createChange('docs', null, 'update Angular 22 compatibility'),
    createChange('chore', 'deps', 'upgrade ol to 10.9.0'),
  ]);

  assert.match(output, /### ⬆️ Core Dependency Updates/);
  assert.match(output, /update Angular 22 compatibility/);
  assert.match(output, /upgrade ol to 10\.9\.0/);
});

test('renders OpenLayers updates that use bump wording', async () => {
  const output = await render([createChange('chore', 'deps', 'bump ol to 10.10.0')]);

  assert.match(output, /bump ol to 10\.10\.0/);
});

test('omits Angular tooling dependency updates', async () => {
  const output = await render([createChange('chore', 'deps', 'upgrade angular-eslint to 23')]);

  assert.equal(output, '');
});

test('omits unversioned Angular documentation updates', async () => {
  const output = await render([createChange('docs', null, 'update Angular examples')]);

  assert.equal(output, '');
});

test('omits unrelated documentation and maintenance changes', async () => {
  const output = await render([
    createChange('docs', null, 'add contributor guide'),
    createChange('chore', 'nx', 'migrate workspace configuration to Nx 23'),
    createChange('chore', 'ci', 'pin Node version'),
  ]);

  assert.equal(output, '');
});

test('preserves standard visible changelog sections', async () => {
  const output = await render([
    createChange('feat', 'map', 'add rotation support'),
    createChange('fix', 'source', 'handle missing URL'),
    createChange('perf', 'layer', 'reduce allocations'),
  ]);

  assert.match(output, /### 🚀 Features/);
  assert.match(output, /### 🩹 Fixes/);
  assert.match(output, /### 🔥 Performance/);
});

test('configures changelog types at the Nx release root', () => {
  assert.equal(nxConfig.release.version.conventionalCommits, true);
  assert.equal(nxConfig.release.conventionalCommits.types.docs.semverBump, 'none');
  assert.equal(nxConfig.release.conventionalCommits.types.chore.semverBump, 'none');
  assert.deepEqual(nxConfig.release.conventionalCommits.types['core-deps'], {
    semverBump: 'none',
    changelog: { title: '⬆️ Core Dependency Updates' },
  });
  assert.equal(
    nxConfig.release.changelog.workspaceChangelog.renderer,
    '{workspaceRoot}/scripts/core-dependency-changelog-renderer.cjs',
  );
});

test('runs release renderer tests through the root test script', () => {
  assert.match(packageConfig.scripts.test, /pnpm run test:scripts/);
  assert.match(
    packageConfig.scripts['test:scripts'],
    /node --test scripts\/core-dependency-changelog-renderer\.spec\.cjs/,
  );
});
