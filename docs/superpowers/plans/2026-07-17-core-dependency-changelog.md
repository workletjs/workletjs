# Core Dependency Changelog Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make Nx release changelogs automatically include Angular and OpenLayers compatibility upgrades without exposing ordinary documentation and maintenance commits.

**Architecture:** A CommonJS renderer extends Nx's public default changelog renderer. It filters hidden-by-default `docs` and `chore` changes through a narrow Angular/OpenLayers allowlist, maps matches to a synthetic `core-deps` type, and delegates all Markdown formatting to Nx.

**Tech Stack:** Node.js CommonJS, Node built-in test runner, Nx 23.1 release APIs, Conventional Commits, pnpm.

## Global Constraints

- Only Angular and OpenLayers are core dependencies in the initial allowlist.
- Ordinary `docs`, `chore`, Nx migration, build, test, style, and CI changes remain hidden.
- Core dependency entries use the section title `⬆️ Core Dependency Updates`.
- Core dependency entries use `semverBump: none` and do not affect release version selection.
- Existing feature, fix, performance, commit reference, author, date, and breaking-change rendering remains delegated to Nx.
- The existing command remains `pnpm nx release premajor --preid=beta`.
- Release verification uses `--dry-run` and must not create a commit, tag, or published package.

---

## File Structure

- `scripts/core-dependency-changelog-renderer.cjs`: Selects and classifies core dependency changes, then extends Nx's default renderer.
- `scripts/core-dependency-changelog-renderer.spec.cjs`: Exercises selection and rendered Markdown using Node's test runner.
- `nx.json`: Enables candidate input types, declares the synthetic output type, and selects the custom workspace renderer.

### Task 1: Implement the Core Dependency Renderer

**Files:**

- Create: `scripts/core-dependency-changelog-renderer.spec.cjs`
- Create: `scripts/core-dependency-changelog-renderer.cjs`

**Interfaces:**

- Consumes: Nx `DefaultChangelogRenderer` from `nx/release/changelog-renderer` and parsed `ChangelogChange` objects.
- Produces: default-export-compatible CommonJS class `CoreDependencyChangelogRenderer`; helper `isCoreDependencyChange(change): boolean` for focused tests and future maintenance.

- [ ] **Step 1: Write the failing renderer tests**

Create `scripts/core-dependency-changelog-renderer.spec.cjs`:

```js
const assert = require('node:assert/strict');
const { test } = require('node:test');

const CoreDependencyChangelogRenderer = require('./core-dependency-changelog-renderer.cjs');

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
```

- [ ] **Step 2: Run the test to verify RED**

Run:

```bash
node --test scripts/core-dependency-changelog-renderer.spec.cjs
```

Expected: FAIL with `MODULE_NOT_FOUND` for `core-dependency-changelog-renderer.cjs`.

- [ ] **Step 3: Implement the minimal renderer**

Create `scripts/core-dependency-changelog-renderer.cjs`:

```js
const DefaultChangelogRenderer = require('nx/release/changelog-renderer').default;

const CORE_DEPENDENCY_TYPE = 'core-deps';
const ANGULAR_RE = /\bangular\b/i;
const OPENLAYERS_RE = /\b(?:openlayers|ol)\b/i;
const UPDATE_INTENT_RE =
  /\b(?:compatibility|migrat(?:e|ed|ion)|upgrad(?:e|ed|ing)|updat(?:e|ed|ing)|version)\b/i;

function isCoreDependencyChange(change) {
  const description = change.description || '';
  const isCandidateType = change.type === 'docs' || change.type === 'chore';
  const isAngularUpdate =
    isCandidateType && ANGULAR_RE.test(description) && UPDATE_INTENT_RE.test(description);
  const isOpenLayersUpdate =
    change.type === 'chore' &&
    change.scope?.toLowerCase() === 'deps' &&
    OPENLAYERS_RE.test(description) &&
    UPDATE_INTENT_RE.test(description);

  return isAngularUpdate || isOpenLayersUpdate;
}

function selectChangelogChanges(changes) {
  return changes.flatMap((change) => {
    if (change.type !== 'docs' && change.type !== 'chore') {
      return [change];
    }

    return isCoreDependencyChange(change)
      ? [{ ...change, type: CORE_DEPENDENCY_TYPE }]
      : [];
  });
}

class CoreDependencyChangelogRenderer extends DefaultChangelogRenderer {
  constructor(config) {
    super({
      ...config,
      changes: selectChangelogChanges(config.changes),
    });
  }
}

module.exports = CoreDependencyChangelogRenderer;
module.exports.isCoreDependencyChange = isCoreDependencyChange;
```

- [ ] **Step 4: Run the focused tests to verify GREEN**

Run:

```bash
node --test scripts/core-dependency-changelog-renderer.spec.cjs
```

Expected: 3 tests pass, 0 fail.

- [ ] **Step 5: Check formatting**

Run:

```bash
pnpm exec prettier --check scripts/core-dependency-changelog-renderer.cjs scripts/core-dependency-changelog-renderer.spec.cjs
```

Expected: both files use Prettier formatting.

- [ ] **Step 6: Commit the renderer and tests**

```bash
git add scripts/core-dependency-changelog-renderer.cjs scripts/core-dependency-changelog-renderer.spec.cjs
git commit -m "feat(release): render core dependency updates"
```

### Task 2: Wire the Renderer into Nx Release

**Files:**

- Modify: `nx.json`

**Interfaces:**

- Consumes: `CoreDependencyChangelogRenderer` from `scripts/core-dependency-changelog-renderer.cjs`.
- Produces: Nx release configuration that passes `docs`/`chore` candidates to the renderer and renders matches as `core-deps` without a semver bump.

- [ ] **Step 1: Verify the unconfigured release preview omits the upgrades**

Run:

```bash
pnpm nx release premajor --preid=beta --dry-run
```

Expected: the preview contains neither `update Angular 22 compatibility` nor `upgrade ol to 10.9.0`.

- [ ] **Step 2: Configure Conventional Commit types and the workspace renderer**

Replace the current `release.version.conventionalCommits` boolean and changelog workspace setting in `nx.json` with:

```json
"version": {
  "conventionalCommits": {
    "types": {
      "docs": {
        "semverBump": "none",
        "changelog": true
      },
      "chore": {
        "semverBump": "none",
        "changelog": true
      },
      "core-deps": {
        "semverBump": "none",
        "changelog": {
          "title": "⬆️ Core Dependency Updates"
        }
      }
    }
  }
},
"changelog": {
  "projectChangelogs": false,
  "workspaceChangelog": {
    "renderer": "{workspaceRoot}/scripts/core-dependency-changelog-renderer.cjs"
  }
}
```

Use the current Nx 23 singular key `workspaceChangelog`; remove the ignored legacy plural key `workspaceChangelogs`.

- [ ] **Step 3: Validate the focused renderer tests and JSON formatting**

Run:

```bash
node --test scripts/core-dependency-changelog-renderer.spec.cjs
pnpm exec prettier --check nx.json scripts/core-dependency-changelog-renderer.cjs scripts/core-dependency-changelog-renderer.spec.cjs
```

Expected: 3 tests pass and Prettier reports all files formatted.

- [ ] **Step 4: Verify the real Nx release preview**

Run:

```bash
pnpm nx release premajor --preid=beta --dry-run
```

Expected preview includes:

```markdown
### ⬆️ Core Dependency Updates

- update Angular 22 compatibility
- **deps:** upgrade ol to 10.9.0
```

Expected preview excludes `add repository contributor guidelines`, Nx migration commits, CI maintenance, test-only changes, and ordinary formatting changes. Confirm `git status --short` shows no version, changelog, lockfile, commit, or tag mutation from the dry-run.

- [ ] **Step 5: Run repository verification**

Run:

```bash
pnpm format:check
pnpm lint
pnpm test
pnpm build
```

Expected: all commands exit 0. The test suite should report 92 test files and 2302 tests passing; network-backed OpenLayers tests may require the same network permission used for the clean baseline.

- [ ] **Step 6: Commit the Nx release configuration**

```bash
git add nx.json
git commit -m "fix(release): include core dependency upgrades"
```

- [ ] **Step 7: Perform final clean-state verification**

Run:

```bash
node --test scripts/core-dependency-changelog-renderer.spec.cjs
pnpm nx release premajor --preid=beta --dry-run
git status --short
git log --oneline -4
```

Expected: focused tests pass, dry-run contains both required upgrade entries, worktree is clean, and the branch contains the design, renderer, and release-configuration commits.
