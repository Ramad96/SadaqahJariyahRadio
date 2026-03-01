// Orchestrator: runs all data generation scripts in the correct order.
//
// Steps:
//   1. Generate audio manifest  — always runs (reflects current audio files on disk)
//   2. Check verse coverage     — compares audio files against existing verse data
//   3. Fetch verses from API    — only runs if step 2 finds gaps
//
// Usage:
//   node scripts/setup.js
//   npm run setup

import { execSync, spawnSync } from 'child_process';

// npm automatically exposes package.json fields as environment variables
// for any script invoked via `npm run`. No file reading needed.
const version = process.env.npm_package_version;

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function printHeader(title) {
  const line = '─'.repeat(50);
  console.log(`\n${line}`);
  console.log(`  ${title}`);
  console.log(line);
}

function printVersion() {
  console.log(`\n  SadaqahJariyah Radio  v${version}`);
}

function printStep(number, label) {
  console.log(`\nStep ${number}: ${label}`);
}

function printSkipped(reason) {
  console.log(`  ↳ Skipped — ${reason}`);
}

// Runs a script and streams its output directly to the terminal.
// Throws if the script exits with a non-zero code.
function run(command) {
  execSync(command, { stdio: 'inherit' });
}

// Runs a script and returns true if it exits with code 0, false otherwise.
// Output is streamed to the terminal so the user can see what was checked.
function runCheck(command) {
  const result = spawnSync(command, { stdio: 'inherit', shell: true });
  return result.status === 0;
}

// ─────────────────────────────────────────────
// Setup
// ─────────────────────────────────────────────

function setup() {
  printHeader('Data Setup');
  printVersion();

  // Step 1: Audio manifest
  // Always regenerate so it reflects whatever MP3 files are currently on disk.
  printStep(1, 'Generate audio manifest');
  run('node scripts/generateAudioManifest.js');

  // Step 2: Verse coverage check
  // Compares the audio manifest against the existing verse data files
  // (verses_uthmani.js and verses_indopak.js) to find any gaps.
  printStep(2, 'Check verse coverage');
  const versesComplete = runCheck('node scripts/checkVerses.js');

  // Step 3: Fetch missing verses
  // Only calls the Quran.com API if step 2 found verses that are missing
  // or have empty text. Skipped entirely when everything is already present.
  printStep(3, 'Fetch missing verses from Quran.com API');
  if (versesComplete) {
    printSkipped('all verse data is already complete');
  } else {
    run('node scripts/fetchVersesFromAPI.js');
  }

  printHeader('Setup complete');
  console.log();
}

setup();
