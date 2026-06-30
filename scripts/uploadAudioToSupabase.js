// One-time script to upload all audio files from public/audio_files/ to Supabase Storage.
// Run after creating the 'audio-files' bucket in your Supabase project.
//
// Usage:
//   node scripts/uploadAudioToSupabase.js
//
// Requires these values in .env.local:
//   SUPABASE_URL=https://your-project-ref.supabase.co
//   SUPABASE_SERVICE_KEY=your-service-role-key   (Settings > API > service_role)

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, '..');

// --- read .env.local ---
function loadEnv() {
  const envPath = path.join(rootDir, '.env.local');
  if (!fs.existsSync(envPath)) {
    console.error('❌  .env.local not found. Create it with SUPABASE_URL and SUPABASE_SERVICE_KEY.');
    process.exit(1);
  }
  const lines = fs.readFileSync(envPath, 'utf8').split('\n');
  const env = {};
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const [key, ...rest] = trimmed.split('=');
    env[key.trim()] = rest.join('=').trim();
  }
  return env;
}

const env = loadEnv();
const SUPABASE_URL = env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = env.SUPABASE_SERVICE_KEY;
const BUCKET = 'audio-files';

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌  SUPABASE_URL and SUPABASE_SERVICE_KEY must be set in .env.local');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function uploadAll() {
  const audioDir = path.join(rootDir, 'public', 'audio_files');
  const surahFolders = fs.readdirSync(audioDir).filter(f =>
    fs.statSync(path.join(audioDir, f)).isDirectory()
  );

  let uploaded = 0;
  let skipped = 0;
  let failed = 0;

  for (const surahFolder of surahFolders) {
    const folderPath = path.join(audioDir, surahFolder);
    const files = fs.readdirSync(folderPath).filter(f => f.endsWith('.mp3'));

    for (const filename of files) {
      const filePath = path.join(folderPath, filename);
      const storagePath = `${surahFolder}/${filename}`;
      const fileBuffer = fs.readFileSync(filePath);

      const { error } = await supabase.storage
        .from(BUCKET)
        .upload(storagePath, fileBuffer, {
          contentType: 'audio/mpeg',
          upsert: false,
        });

      if (error) {
        if (error.message?.includes('already exists') || error.statusCode === '409') {
          console.log(`  ⏭  ${storagePath} (already exists)`);
          skipped++;
        } else {
          console.error(`  ✗  ${storagePath}: ${error.message}`);
          failed++;
        }
      } else {
        console.log(`  ✓  ${storagePath}`);
        uploaded++;
      }
    }
  }

  console.log(`\nDone. ${uploaded} uploaded, ${skipped} skipped (already exist), ${failed} failed.`);
  if (uploaded > 0 || skipped > 0) {
    const samplePath = `${surahFolders[0]}/${fs.readdirSync(path.join(audioDir, surahFolders[0])).find(f => f.endsWith('.mp3'))}`;
    console.log(`\nYour public audio base URL is:`);
    console.log(`  ${SUPABASE_URL}/storage/v1/object/public/${BUCKET}`);
    console.log(`\nSet this in .env.local:`);
    console.log(`  VITE_SUPABASE_AUDIO_URL=${SUPABASE_URL}/storage/v1/object/public/${BUCKET}`);
  }
}

uploadAll().catch(err => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
