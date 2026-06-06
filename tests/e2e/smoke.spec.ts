import { expect, test } from '@playwright/test';

test('home renders the primary SIHAT experience', async ({ page }) => {
  await page.goto('/#/');
  await expect(page.getByRole('heading', { name: /Buka Peta Kesehatan Kota/i })).toBeVisible();
  await expect(page.getByRole('link', { name: /Mulai Lapor/i })).toBeVisible();
});

test('public map route renders map controls', async ({ page }) => {
  await page.goto('/#/peta');
  await expect(page.getByRole('heading', { name: /Peta Interaktif Lingkungan/i })).toBeVisible();
  await expect(page.getByLabel('Interactive health map')).toBeVisible();
});

test('report form requires coordinates and privacy consent', async ({ page }) => {
  await page.goto('/#/laporan');
  await expect(page.getByRole('heading', { name: /Laporkan titik masalah lingkungan/i })).toBeVisible();
  await expect(page.getByPlaceholder(/drainase tersumbat/i)).toBeVisible();
  await expect(page.getByRole('checkbox')).not.toBeChecked();
  await expect(page.getByRole('button', { name: /Kirim Laporan/i })).toBeDisabled();
});

test('privacy route is accessible', async ({ page }) => {
  await page.goto('/#/privasi');
  await expect(page.getByRole('heading', { name: /Pengelolaan data laporan SIHAT/i })).toBeVisible();
});

test('staff route requires authentication', async ({ page }) => {
  await page.goto('/#/petugas');
  await expect(page.getByRole('heading', { name: /Portal Petugas SIHAT/i })).toBeVisible();
  await expect(page.getByLabel('Email')).toBeVisible();
  await expect(page.getByLabel('Password')).toBeVisible();
});
