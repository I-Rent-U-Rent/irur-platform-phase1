import puppeteer from 'puppeteer-core';

const CHROME_PATH = process.env.CHROME_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

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

export async function fetchZillowPhotos(zillowUrl: string): Promise<string[]> {
  if (!zillowUrl?.includes('zillow.com')) return [];

  let browser;
  try {
    browser = await puppeteer.launch({
      executablePath: CHROME_PATH,
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    });

    const page = await browser.newPage();
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36'
    );
    await page.setViewport({ width: 1280, height: 800 });

    await page.goto(zillowUrl, { waitUntil: 'networkidle2', timeout: 45000 });

    const photos = await page.evaluate(() => {
      const urls = new Set<string>();

      const nextData = document.getElementById('__NEXT_DATA__');
      if (nextData?.textContent) {
        try {
          const data = JSON.parse(nextData.textContent);
          const json = JSON.stringify(data);
          const matches = json.match(/https:\/\/photos\.zillowstatic\.com\/fp\/[a-f0-9-]+-p_[a-z]\.(jpg|webp)/g) || [];
          matches.forEach(u => urls.add(u.replace(/\/p_[a-z]\.(jpg|webp).*/, '/p_f.jpg')));
        } catch { /* ignore */ }
      }

      document.querySelectorAll('img[src*="zillowstatic.com"]').forEach(img => {
        const src = (img as HTMLImageElement).src;
        if (src) urls.add(src.replace(/\/p_[a-z]\.(jpg|webp).*/, '/p_f.jpg'));
      });

      return [...urls];
    });

    if (photos.length > 0) return photos.slice(0, 20);

    const html = await page.content();
    const regex = /https:\/\/photos\.zillowstatic\.com\/fp\/[a-f0-9-]+-p_[a-z]\.(jpg|webp)/g;
    const fromHtml = [...new Set((html.match(regex) || []).map(u => u.replace(/\/p_[a-z]\.(jpg|webp).*/, '/p_f.jpg')))];
    return fromHtml.slice(0, 20);
  } catch (err) {
    console.error('[Zillow] Photo fetch failed:', err);
    return [];
  } finally {
    await browser?.close();
  }
}
