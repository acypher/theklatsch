import { loadEnv } from 'vite';
import { writeFileSync } from 'node:fs';

const env = { ...loadEnv('production', process.cwd(), ''), ...process.env };
const url = env.VITE_SUPABASE_URL;
const key = env.VITE_SUPABASE_PUBLISHABLE_KEY;
if (!url?.startsWith('https://') || !key) {
  throw new Error('Supabase URL and publishable key are required for video upload authentication.');
}
const config = Buffer.from(JSON.stringify({ url: url.replace(/\/$/, ''), key })).toString('base64');
writeFileSync('dist/api/upload-config.php', `<?php\nreturn json_decode(base64_decode('${config}'), true);\n`);
