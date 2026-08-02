import { db, initDb } from '../src/db/database.js';
import { fetchZillowPhotos } from '../src/services/zillowPhotos.js';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function main() {
  await initDb();
  const { rows } = await db.query('SELECT id, title, zillow_url FROM properties WHERE zillow_url IS NOT NULL ORDER BY id');
  let updated = 0;

  for (const property of rows) {
    console.log(`[Zillow] ${property.id}: ${property.title}`);
    const photos = await fetchZillowPhotos(property.zillow_url);
    if (photos.length) {
      await db.query('UPDATE properties SET photos = $1 WHERE id = $2', [JSON.stringify(photos), property.id]);
      updated++;
      console.log(`  saved ${photos.length} images`);
    } else {
      console.warn('  no images found');
    }
    // Be considerate of the source site when refreshing a full catalogue.
    await delay(1500);
  }

  console.log(`[Zillow] Updated ${updated}/${rows.length} properties`);
  await db.end();
}

main().catch(async error => {
  console.error(error);
  await db.end();
  process.exit(1);
});
