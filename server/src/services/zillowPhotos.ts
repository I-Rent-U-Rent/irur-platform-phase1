import puppeteer from 'puppeteer-core';
import fs from 'fs';
import os from 'os';
import path from 'path';

const CHROME_CANDIDATES = [
  process.env.CHROME_PATH,
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
].filter((value): value is string => Boolean(value));

const BROWSER_USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36';

function findCachedBrowser(): string | undefined {
  const cacheRoot = process.env.PUPPETEER_CACHE_DIR || path.join(process.env.XDG_CACHE_HOME || path.join(os.homedir(), '.cache'), 'puppeteer');
  const candidates: string[] = [];

  for (const browser of ['chrome', 'chrome-headless-shell']) {
    const browserDir = path.join(cacheRoot, browser);
    if (!fs.existsSync(browserDir)) continue;
    for (const version of fs.readdirSync(browserDir).sort().reverse()) {
      candidates.push(
        path.join(browserDir, version, 'chrome-linux64', 'chrome'),
        path.join(browserDir, version, 'chrome-headless-shell-linux64', 'chrome-headless-shell'),
      );
    }
  }
  return candidates.find(candidate => fs.existsSync(candidate));
}

export function extractZpid(url: string): string | null {
  const match = url.match(/(\d+)_zpid/);
  return match ? match[1] : null;
}

function pickPhotoUrls(data: unknown): string[] {
  const urls = new Set<string>();

  const walk = (node: unknown) => {
    if (!node || typeof node !== 'object') return;
    if (Array.isArray(node)) {
      node.forEach(walk);
      return;
    }
    const obj = node as Record<string, unknown>;
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string' && value.includes('photos.zillowstatic.com')) {
        urls.add(value.replace(/\/p_[a-z]\.jpg.*/, '/p_f.jpg'));
      }
      if (key === 'url' && typeof value === 'string' && value.includes('zillowstatic.com')) {
        urls.add(value.replace(/\/p_[a-z]\.(jpg|webp).*/, '/p_f.jpg'));
      }
      walk(value);
    }
  };

  walk(data);
  return [...urls];
}

function normalizePhotoUrl(url: string): string {
  return url
    .replace(/\\u002F/g, '/')
    .replace(/\\\//g, '/')
    .replace(/\\u0026/g, '&')
    .replace(/\/p_[a-z]\.(jpg|webp).*/i, '/p_f.jpg');
}

function photoUrlsFromHtml(html: string): string[] {
  const urls = new Set<string>();
  const matches = html.match(/https:\\?\/\\?\/photos\.zillowstatic\.com\\?\/fp\\?\/[a-zA-Z0-9-]+-p_[a-z]\.(?:jpg|webp)[^"'\\s<]*/g) || [];
  matches.forEach(url => urls.add(normalizePhotoUrl(url)));
  return [...urls].slice(0, 20);
}

async function fetchPageHtml(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: {
      'User-Agent': BROWSER_USER_AGENT,
      'Accept-Language': 'en-US,en;q=0.9',
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    },
  });
  if (!response.ok) throw new Error(`Zillow returned HTTP ${response.status}`);
  return response.text();
}

export async function fetchZillowPhotos(zillowUrl: string): Promise<string[]> {
  if (!zillowUrl?.includes('zillow.com')) return [];

  // Most listing pages expose Zillow CDN URLs in their HTML. This path avoids
  // requiring a browser in production and is used before the browser fallback.
  try {
    const photos = photoUrlsFromHtml(await fetchPageHtml(zillowUrl));
    if (photos.length) return photos;
  } catch (err) {
    console.warn('[Zillow] HTML photo fetch failed; trying browser fallback:', err);
  }

  const executablePath = CHROME_CANDIDATES.find(candidate => fs.existsSync(candidate)) || findCachedBrowser();
  if (!executablePath) {
    console.error('[Zillow] No Chrome or Chromium executable found. Set CHROME_PATH to enable the browser fallback.');
    return [];
  }

  let browser;
  try {
    browser = await puppeteer.launch({
      executablePath,
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    });

    const page = await browser.newPage();
    await page.setUserAgent(
      BROWSER_USER_AGENT
    );
    await page.setViewport({ width: 1280, height: 800 });

    const listingUrls = [...new Set([
      zillowUrl,
      zillowUrl.replace('://www.zillow.com', '://m.zillow.com'),
    ])];

    for (const listingUrl of listingUrls) {
      await page.goto(listingUrl, { waitUntil: 'networkidle2', timeout: 45000 });
      const photos = await page.evaluate(() => {
        const urls = new Set<string>();
        const nextData = document.getElementById('__NEXT_DATA__');
        if (nextData?.textContent) {
          try {
            const data = JSON.parse(nextData.textContent);
            const json = JSON.stringify(data);
            const matches = json.match(/https:\/\/photos\.zillowstatic\.com\/fp\/[a-f0-9-]+-p_[a-z]\.(jpg|webp)/g) || [];
            for (const url of matches) urls.add(url.replace(/\/p_[a-z]\.(jpg|webp).*/i, '/p_f.jpg'));
          } catch { /* ignore */ }
        }

        for (const img of Array.from(document.querySelectorAll('img[src*="photos.zillowstatic.com"]'))) {
          const src = (img as HTMLImageElement).src;
          if (src) urls.add(src.replace(/\/p_[a-z]\.(jpg|webp).*/i, '/p_f.jpg'));
        }
        return [...urls];
      });

      if (photos.length > 0) return photos.slice(0, 20);
      const fromHtml = photoUrlsFromHtml(await page.content());
      if (fromHtml.length > 0) return fromHtml;
    }

    return [];
  } catch (err) {
    console.error('[Zillow] Photo fetch failed:', err);
    return [];
  } finally {
    await browser?.close();
  }
}
