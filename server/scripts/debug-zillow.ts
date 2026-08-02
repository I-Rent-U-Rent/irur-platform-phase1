import puppeteer from 'puppeteer-core';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const urls = [
  'https://www.zillow.com/homedetails/727-Peony-Ln-Spring-City-PA-19475/2058077778_zpid/',
  'https://m.zillow.com/homedetails/727-Peony-Ln-Spring-City-PA-19475/2058077778_zpid/',
];

async function test(url: string) {
  const browser = await puppeteer.launch({ executablePath: CHROME_PATH, headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1');
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 45000 });
  const title = await page.title();
  const count = await page.evaluate(() => (document.body.innerHTML.match(/photos\.zillowstatic\.com/g) || []).length);
  console.log(url, '->', title, 'photo refs:', count);
  await browser.close();
}

async function main() {
  for (const url of urls) await test(url);
}
main().catch(console.error);
