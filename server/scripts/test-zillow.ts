import { fetchZillowPhotos } from '../src/services/zillowPhotos.js';

async function main() {
  const url = process.argv[2] || 'https://www.zillow.com/homedetails/727-Peony-Ln-Spring-City-PA-19475/2058077778_zpid/';
  console.log('Fetching photos for', url);
  const photos = await fetchZillowPhotos(url);
  console.log('Found', photos.length, 'photos');
  photos.slice(0, 5).forEach(p => console.log(p));
}

main().catch(console.error);
