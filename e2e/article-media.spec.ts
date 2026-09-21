import { test, expect } from '@playwright/test';
import { writeFileSync } from 'node:fs';

// Exercise the real upload and rendering components without changing live data.
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('sb-kjfwyaniengzduyeeufq-auth-token', JSON.stringify({
      access_token: 'test-session-token', refresh_token: 'test-refresh',
      expires_at: Math.floor(Date.now() / 1000) + 3600,
      user: { id: 'test-user' }, token_type: 'bearer',
    }));
  });
  await page.route('**/src/contexts/AuthContext.tsx', route => route.fulfill({
    contentType: 'application/javascript',
    body: 'export const useAuth = () => ({ isAuthenticated: true });',
  }));
});

test('upload a video and display paused players with working controls', async ({ page }) => {
  await page.goto('/e2e/fixtures/article-media.html');
  // Generate an actual browser-playable clip, so playback is tested too.
  const bytes = await page.evaluate(async () => {
    const canvas = document.createElement('canvas');
    canvas.width = 320; canvas.height = 180;
    const ctx = canvas.getContext('2d')!;
    const stream = canvas.captureStream(10);
    const recorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
    const chunks: BlobPart[] = [];
    recorder.ondataavailable = event => chunks.push(event.data);
    const finished = new Promise<Blob>(resolve => {
      recorder.onstop = () => resolve(new Blob(chunks, { type: 'video/webm' }));
    });
    recorder.start();
    const timer = setInterval(() => {
      ctx.fillStyle = '#245f88'; ctx.fillRect(0, 0, 320, 180);
      ctx.fillStyle = 'white'; ctx.font = '24px sans-serif'; ctx.fillText('Article video', 85, 95);
    }, 100);
    await new Promise(resolve => setTimeout(resolve, 2000));
    recorder.stop(); clearInterval(timer); stream.getTracks().forEach(track => track.stop());
    return Array.from(new Uint8Array(await (await finished).arrayBuffer()));
  });
  const clip = Buffer.from(bytes);
  let uploaded = false;
  await page.route('**/storage/v1/object/**', route => {
    throw new Error(`Video must not use Supabase Storage: ${route.request().url()}`);
  });
  await page.route('**/api/upload-video.php', async route => {
    uploaded = true;
    expect(route.request().headers().authorization).toBe('Bearer test-session-token');
    await route.fulfill({ status: 201, json: { url: '/videos/test.webm' } });
  });
  await page.route('**/videos/test.webm', route =>
    route.fulfill({ contentType: 'video/webm', body: clip }));
  writeFileSync('/tmp/theklatsch-video-check.webm', clip);
  const chooser = page.waitForEvent('filechooser');
  await page.getByRole('button', { name: 'Upload', exact: true }).click();
  await (await chooser).setFiles({ name: 'clip.WEBM', mimeType: 'video/webm', buffer: clip });
  await expect(page.getByText('Video uploaded successfully')).toBeVisible();
  expect(uploaded).toBe(true);
  await expect(page.locator('#imageUrl')).toHaveValue(/\/videos\/test\.webm$/);
  const players = page.locator('video');
  await expect(players).toHaveCount(2);
  for (const player of await players.all()) {
    await expect.poll(() => player.evaluate((el: HTMLVideoElement) => el.readyState)).toBeGreaterThan(0);
    expect(await player.evaluate((el: HTMLVideoElement) => ({ paused: el.paused, controls: el.controls, autoplay: el.autoplay, time: el.currentTime })))
      .toEqual({ paused: true, controls: true, autoplay: false, time: 0 });
    await player.evaluate((el: HTMLVideoElement) => el.play());
    await expect.poll(() => player.evaluate((el: HTMLVideoElement) => el.currentTime)).toBeGreaterThan(0);
    await player.evaluate((el: HTMLVideoElement) => el.pause());
  }
  await page.screenshot({ path: 'test-results/article-video.png', fullPage: true });
});

test('images still upload and unsupported files do not upload', async ({ page }) => {
  await page.goto('/e2e/fixtures/article-media.html');
  let uploads = 0;
  await page.route('**/storage/v1/object/**', route => {
    if (route.request().method() === 'POST') uploads++;
    return route.fulfill({ json: { Key: 'article-images/test.png' } });
  });
  const input = page.locator('input[type=file]');
  await input.setInputFiles({ name: 'bad.txt', mimeType: 'text/plain', buffer: Buffer.from('bad') });
  await expect(page.getByText('Choose a JPEG', { exact: false })).toBeVisible();
  expect(uploads).toBe(0);
  await input.setInputFiles({ name: 'image.png', mimeType: 'image/png', buffer: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=', 'base64') });
  await expect(page.getByText('Image uploaded successfully')).toBeVisible();
  expect(uploads).toBe(1);
  await expect(page.locator('#imageUrl')).toHaveValue(/\.png$/);
  await expect(page.locator('video')).toHaveCount(0);
  await expect(page.locator('img')).toHaveCount(2);
});


test('server upload errors leave the article URL unchanged', async ({ page }) => {
  await page.goto('/e2e/fixtures/article-media.html');
  await page.locator('#imageUrl').fill('https://example.com/original.png');
  await page.route('**/api/upload-video.php', route => route.fulfill({
    status: 401, json: { error: 'Your login has expired. Please sign in again.' },
  }));
  await page.locator('input[type=file]').setInputFiles({
    name: 'clip.mp4', mimeType: 'video/mp4', buffer: Buffer.from('test'),
  });
  await expect(page.getByText('Your login has expired. Please sign in again.')).toBeVisible();
  await expect(page.locator('#imageUrl')).toHaveValue('https://example.com/original.png');
  await expect(page.getByRole('button', { name: 'Upload', exact: true })).toBeEnabled();
});
