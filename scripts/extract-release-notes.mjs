#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

/**
 * 提取 Release Notes 和日期
 * @param {string} content CHANGELOG 内容
 * @param {string} version 版本号
 * @returns {{ notes: string, date: string|null }}
 */
export function extractReleaseNotes(content, version) {
  const lines = content.split(/\r?\n/);

  const versionEscaped = version.replace(/\./g, '\\.');
  // 匹配 header: 0.5.0 或 [0.5.0] 以及可选日期 (YYYY-MM-DD)
  const headerRegex = new RegExp(
    `^##\\s*\\[?${versionEscaped}\\]?\\s*(?:\\((\\d{4}-\\d{2}-\\d{2})\\))?\\s*$`,
  );

  let collecting = false;
  const result = [];
  let releaseDate = null;

  for (const line of lines) {
    const match = headerRegex.exec(line);
    if (match) {
      collecting = true;
      releaseDate = match[1] || null; // 如果有日期就保存
      continue;
    }

    // 遇到下一个版本 header 停止收集
    if (collecting && /^##\s+/.test(line)) {
      break;
    }

    if (collecting) {
      result.push(line);
    }
  }

  const notes = result.join('\n').replace(/^\s+|\s+$/g, '');

  return { notes, date: releaseDate };
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
  const { notes, date } = extractReleaseNotes(content, version);

  if (!notes) {
    console.error(`❌ No changelog entry found for version ${version}`);
    process.exit(1);
  }

  console.log(`Release Date: ${date || 'N/A'}`);
  console.log('---');
  console.log(notes);
}

main();
