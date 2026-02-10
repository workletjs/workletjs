#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

/**
 * Parses a CHANGELOG.md file and extracts release information.
 * @param {string} contents The contents of the CHANGELOG.md file.
 * @returns {{ releases: { version: string, body: string, date: string|null }[] }}
 */
function parseChangelogMarkdown(contents) {
  /**
   * The release header may include prerelease identifiers (e.g., -alpha.13),
   * and major releases may use a single #, instead of the standard ## used
   * for minor and patch releases. This regex matches all of these cases.
   */
  const CHANGELOG_RELEASE_HEAD_RE = new RegExp(
    '^#+\\s*\\[?(\\d+\\.\\d+\\.\\d+(?:-[a-zA-Z0-9\\.]+)?)\\]?',
    'gm'
  );

  const headings = [...contents.matchAll(CHANGELOG_RELEASE_HEAD_RE)];
  const releases = [];

  for (let i = 0; i < headings.length; i++) {
    const heading = headings[i];
    const nextHeading = headings[i + 1];
    const version = heading[1];
    let body = contents
      .slice(
        heading.index + heading[0].length,
        nextHeading ? nextHeading.index : contents.length
      )
      .trim();
    const date = extractReleaseDate(body);

    if (date) {
      body = body.replace(`(${date})`, '').trim();
    }

    releases.push({ version, body, date });
  }

  return {
    releases,
  };
}

/**
 * Extracts the release date from the first line of the release body, if present.
 * @param {string} content The release body content.
 * @returns {string|null} The extracted date in YYYY-MM-DD format, or null if not found.
 */
function extractReleaseDate(content) {
  const firstLine = content.split(/\r?\n/)[0];
  const dateMatch = firstLine.match(/\((\d{4}-\d{2}-\d{2})\)/)
  return dateMatch ? dateMatch[1] : null;
}

function parseArgs() {
  const args = process.argv.slice(2);
  const get = (key) => {
    const i = args.indexOf(key);
    return i !== -1 ? args[i + 1] : null;
  };

  return {
    file: get('--file'),
    version: get('--version'),
  };
}

function main() {
  const { file, version } = parseArgs();

  if (!file || !version) {
    console.error('Usage: extract-release-notes --file <CHANGELOG.md> --version <x.y.z>');
    process.exit(1);
  }

  const changelogPath = path.resolve(file);

  if (!fs.existsSync(changelogPath)) {
    console.error(`❌ CHANGELOG not found: ${changelogPath}`);
    process.exit(1);
  }

  const content = fs.readFileSync(changelogPath, 'utf8');

  const { releases } = parseChangelogMarkdown(content);
  const release = releases.find((r) => r.version === version);

  if (!release) {
    console.error(`❌ No changelog entry found for version ${release.version}`);
    process.exit(1);
  }

  console.log(`Release Date: ${release.date || 'N/A'}`);
  console.log('---');
  console.log(release.body);
}

main();
