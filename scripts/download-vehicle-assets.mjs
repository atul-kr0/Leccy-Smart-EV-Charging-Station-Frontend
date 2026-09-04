import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const MANIFEST_PATH = path.join(ROOT, 'public', 'vehicle-assets.json');
const SOURCE_PATH = path.join(ROOT, 'public', 'vehicle-image-sources.json');
const VEHICLES_DIR = path.join(ROOT, 'public', 'vehicles');
const BRANDS_DIR = path.join(ROOT, 'public', 'brands');
const ATTRIBUTIONS_PATH = path.join(ROOT, 'public', 'vehicle-asset-attributions.json');

const USER_AGENT = 'LeccyEVAssetDownloader/3.0 (portfolio project; contact via project repository)';
const MIN_REQUEST_GAP_MS = 4500;
const MAX_RETRIES = 5;
const MAX_BACKOFF_MS = 60000;
let lastRequestAt = 0;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const brandSlugs = {
  Audi: 'audi', BMW: 'bmw', BYD: 'byd', Citroen: 'citroen', Hyundai: 'hyundai',
  Jaguar: 'jaguar', Kia: 'kia', Mahindra: 'mahindra', 'Maruti Suzuki': 'marutisuzuki',
  Mercedes: 'mercedes', MG: 'mg', Mini: 'mini', Porsche: 'porsche', 'Rolls-Royce': 'rollsroyce',
  Smart: 'smart', Tata: 'tata', Toyota: 'toyota', VinFast: 'vinfast', Volvo: 'volvo'
};

const normalize = (value = '') => {
  const text = String(value).trim();
  if (text === '#1 Pro+' || text.toLowerCase() === 'smart #1 pro+') return '1-pro-plus';
  return text.toLowerCase().replace(/#/g, '').replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
};

async function throttledFetch(url, options = {}, attempt = 0) {
  const wait = Math.max(0, MIN_REQUEST_GAP_MS - (Date.now() - lastRequestAt));
  if (wait) await sleep(wait);

  try {
    lastRequestAt = Date.now();
    const response = await fetch(url, {
      ...options,
      headers: {
        'User-Agent': USER_AGENT,
        'Accept': 'application/json,image/avif,image/webp,image/jpeg,image/png,*/*',
        ...(options.headers || {})
      }
    });

    if (response.ok) return response;

    if (response.status === 429 || response.status === 408 || response.status >= 500) {
      if (attempt >= MAX_RETRIES) throw new Error(`HTTP ${response.status} after ${MAX_RETRIES} retries`);
      const retryAfter = Number(response.headers.get('retry-after'));
      const exponential = Math.min(MAX_BACKOFF_MS, 2000 * (2 ** attempt));
      const delay = Number.isFinite(retryAfter) && retryAfter > 0
        ? Math.min(MAX_BACKOFF_MS, retryAfter * 1000)
        : exponential + Math.floor(Math.random() * 1500);
      console.warn(`  ! HTTP ${response.status}; retrying in ${Math.ceil(delay / 1000)}s`);
      await sleep(delay);
      return throttledFetch(url, options, attempt + 1);
    }

    throw new Error(`HTTP ${response.status}`);
  } catch (error) {
    if (attempt >= MAX_RETRIES) throw error;
    const delay = Math.min(MAX_BACKOFF_MS, 2000 * (2 ** attempt)) + Math.floor(Math.random() * 1500);
    console.warn(`  ! ${error.message}; retrying in ${Math.ceil(delay / 1000)}s`);
    await sleep(delay);
    return throttledFetch(url, options, attempt + 1);
  }
}

function scoreCandidate(page, model) {
  const info = page.imageinfo?.[0];
  const title = `${page.title || ''} ${info?.extmetadata?.ImageDescription?.value || ''} ${info?.extmetadata?.Categories?.value || ''}`.toLowerCase();
  const modelTokens = model.toLowerCase().split(/\s+/).filter(Boolean);
  let score = 0;

  for (const token of modelTokens) if (token.length > 2 && title.includes(token)) score += 8;
  if (title.includes('front right')) score += 20;
  if (title.includes('front-right')) score += 20;
  if (title.includes('front three-quarter')) score += 20;
  if (title.includes('three-quarter')) score += 18;
  if (title.includes('front three quarter')) score += 18;
  if (title.includes('front')) score += 8;
  if (title.includes('quarter')) score += 8;

  if (title.includes('rear')) score -= 30;
  if (title.includes('rear three-quarter')) score -= 35;
  if (title.includes('side view') || title.includes('profile')) score -= 15;
  if (title.includes('interior') || title.includes('dashboard') || title.includes('steering')) score -= 50;
  if (title.includes('logo') || title.includes('badge')) score -= 50;
  if (title.includes('concept') || title.includes('prototype')) score -= 35;
  if (title.includes('race') || title.includes('racing')) score -= 20;
  if (title.includes('person') || title.includes('people') || title.includes('crowd')) score -= 25;
  if (title.includes('showroom') || title.includes('motor show') || title.includes('autoshow')) score -= 8;

  const width = Number(info?.width || 0);
  const height = Number(info?.height || 0);
  if (width >= 1200 && height >= 700) score += 4;
  if (width && height && width / height > 1.15) score += 2;

  return score;
}

async function commonsSearch(make, model, query) {
  const url = new URL('https://commons.wikimedia.org/w/api.php');
  url.searchParams.set('action', 'query');
  url.searchParams.set('generator', 'search');
  url.searchParams.set('gsrsearch', query);
  url.searchParams.set('gsrnamespace', '6');
  url.searchParams.set('gsrlimit', '20');
  url.searchParams.set('prop', 'imageinfo');
  url.searchParams.set('iiprop', 'url|mime|size|extmetadata');
  url.searchParams.set('iiurlwidth', '1600');
  url.searchParams.set('format', 'json');

  const response = await throttledFetch(url);
  const data = await response.json();
  const pages = Object.values(data.query?.pages || {});
  return pages
    .filter((p) => p.imageinfo?.[0]?.thumburl || p.imageinfo?.[0]?.url)
    .map((p) => ({ page: p, info: p.imageinfo[0], score: scoreCandidate(p, model) }))
    .sort((a, b) => b.score - a.score);
}

async function findImage(make, model, sourceConfig) {
  const exactFile = sourceConfig?.commonsFile;
  if (exactFile) {
    const results = await commonsSearch(make, model, `File:${exactFile.replace(/^File:/i, '')}`);
    const exact = results.find((r) => r.page.title.toLowerCase() === `file:${exactFile.replace(/^file:/i, '').toLowerCase()}`);
    if (exact) return exact;
  }

  const queries = [
    sourceConfig?.query || `${make} ${model} front three-quarter automobile`,
    `${make} ${model} front right automobile`,
    `${make} ${model} front automobile`
  ];

  let candidates = [];
  for (const query of queries) {
    candidates.push(...await commonsSearch(make, model, query));
    candidates = candidates
      .filter((item, index, arr) => arr.findIndex((x) => x.page.pageid === item.page.pageid) === index)
      .sort((a, b) => b.score - a.score);
    if (candidates.length >= 10 && candidates[0].score >= 25) break;
  }

  return candidates[0] || null;
}

async function saveNormalizedImage(imageUrl, destination) {
  const response = await throttledFetch(imageUrl, { headers: { Accept: 'image/avif,image/webp,image/jpeg,image/png,*/*' } });
  const buffer = Buffer.from(await response.arrayBuffer());
  const sharp = (await import('sharp')).default;

  const metadata = await sharp(buffer).metadata();
  if (!metadata.width || !metadata.height) throw new Error('Downloaded file is not a readable image');
  if (metadata.width < 500 || metadata.height < 300) throw new Error(`Image too small (${metadata.width}x${metadata.height})`);

  await sharp(buffer)
    .rotate()
    .resize({ width: 760, height: 540, fit: 'contain', background: { r: 246, g: 248, b: 247, alpha: 1 } })
    .webp({ quality: 88, effort: 5 })
    .toFile(destination);
}

async function downloadLogo(make, folder) {
  const icon = brandSlugs[make];
  if (!icon) return { make, status: 'missing-slug' };
  const output = path.join(BRANDS_DIR, `${folder}.svg`);
  try {
    const response = await throttledFetch(`https://cdn.simpleicons.org/${icon}`, {
      headers: { Accept: 'image/svg+xml,text/plain,*/*' }
    });
    const text = await response.text();
    if (!/<svg[\s>]/i.test(text)) throw new Error('Response is not SVG');
    await fs.writeFile(output, text, 'utf8');
    return { make, status: 'downloaded', source: `https://cdn.simpleicons.org/${icon}`, file: `/brands/${folder}.svg` };
  } catch (error) {
    return { make, status: 'failed', error: error.message };
  }
}

async function fileExists(file) {
  try { await fs.access(file); return true; } catch { return false; }
}

const manifest = JSON.parse(await fs.readFile(MANIFEST_PATH, 'utf8'));
const sourceManifest = JSON.parse(await fs.readFile(SOURCE_PATH, 'utf8'));
const sourceByKey = new Map(sourceManifest.models.map((x) => [`${x.make}|${x.model}`, x]));

if (manifest.catalogueVehicleCount !== 81) {
  throw new Error(`Expected the current catalogue to contain 81 records; manifest says ${manifest.catalogueVehicleCount}.`);
}
if (manifest.uniquePhysicalModels !== 54 || manifest.models.length !== 54) {
  throw new Error(`Expected 54 physical models; manifest contains ${manifest.models.length}.`);
}

await fs.mkdir(VEHICLES_DIR, { recursive: true });
await fs.mkdir(BRANDS_DIR, { recursive: true });

const previous = await fileExists(ATTRIBUTIONS_PATH)
  ? JSON.parse(await fs.readFile(ATTRIBUTIONS_PATH, 'utf8'))
  : { vehicles: [], brandLogos: [] };

const vehicleAttributions = Array.isArray(previous.vehicles) ? previous.vehicles : [];
const logoAttributions = [];
let success = 0;
let skipped = 0;
const failed = [];

console.log(`Leccy asset downloader: ${manifest.catalogueVehicleCount} catalogue records / ${manifest.models.length} physical models`);
console.log('Physical model is taken directly from the catalogue model field; variants reuse that asset.');
console.log('Requests are serialized and rate-limited to reduce Wikimedia 429 responses.\n');

for (let i = 0; i < manifest.models.length; i++) {
  const model = manifest.models[i];
  const output = path.join(ROOT, 'public', model.path.replace(/^\//, ''));

  if (await fileExists(output)) {
    console.log(`[${i + 1}/${manifest.models.length}] ${model.make} ${model.model} — SKIP (exists)`);
    success++;
    skipped++;
    continue;
  }

  console.log(`[${i + 1}/${manifest.models.length}] ${model.make} ${model.model}`);
  try {
    // The manifest stores nested paths such as /vehicles/audi/e-tron.webp.
    // Ensure the brand directory exists before Sharp writes the normalized file.
    await fs.mkdir(path.dirname(output), { recursive: true });

    const source = await findImage(model.make, model.model, sourceByKey.get(`${model.make}|${model.model}`));
    if (!source) throw new Error('No suitable Commons candidate found');

    const info = source.info;
    const imageUrl = info.thumburl || info.url;
    await saveNormalizedImage(imageUrl, output);

    const metadata = info.extmetadata || {};
    const existingIndex = vehicleAttributions.findIndex((x) => x.file === model.path);
    const record = {
      type: 'vehicle-image',
      manufacturer: model.make,
      physical_model: model.model,
      asset_path: model.path,
      source_url: `https://commons.wikimedia.org/wiki/${encodeURIComponent(source.page.title.replaceAll(' ', '_'))}`,
      source_file: source.page.title,
      creator: metadata.Artist?.value || null,
      license: metadata.LicenseShortName?.value || null,
      selected_url: imageUrl,
      selection_score: source.score,
      qc_required: true,
      visual_policy: 'front three-quarter preferred; no people/watermark/text/rear/interior; manually verify before publishing'
    };
    if (existingIndex >= 0) vehicleAttributions[existingIndex] = record;
    else vehicleAttributions.push(record);

    console.log(`  ✓ ${model.path} (score ${source.score})`);
    success++;
  } catch (error) {
    console.log(`  ✗ ${error.message}`);
    failed.push(`${model.make} ${model.model}: ${error.message}`);
  }
}

const brands = [...new Map(manifest.models.map((m) => [m.make, m])).values()];
let logoSuccess = 0;
const missingLogos = [];
for (const model of brands) {
  const result = await downloadLogo(model.make, model.folder);
  logoAttributions.push(result);
  if (result.status === 'downloaded') logoSuccess++;
  else missingLogos.push(`${model.make}: ${result.error || result.status}`);
  console.log(`${result.status === 'downloaded' ? '✓' : '✗'} logo ${model.make}`);
}

await fs.writeFile(ATTRIBUTIONS_PATH, JSON.stringify({
  generatedAt: new Date().toISOString(),
  catalogueVehicleCount: manifest.catalogueVehicleCount,
  uniquePhysicalModels: manifest.uniquePhysicalModels,
  vehicles: vehicleAttributions,
  brandLogos: logoAttributions
}, null, 2));

console.log('\n--- FINAL REPORT ---');
console.log(`Catalogue records: ${manifest.catalogueVehicleCount}`);
console.log(`Unique physical models: ${manifest.uniquePhysicalModels}`);
console.log(`Vehicle assets present after run: ${success}/${manifest.models.length}`);
console.log(`Skipped existing: ${skipped}`);
console.log(`Vehicle failures this run: ${failed.length}`);
console.log(`Brand logos: ${logoSuccess}/${brands.length}`);
if (failed.length) {
  console.log('\nFailed vehicle assets:');
  failed.forEach((x) => console.log(`- ${x}`));
}
if (missingLogos.length) {
  console.log('\nMissing logos:');
  missingLogos.forEach((x) => console.log(`- ${x}`));
}
console.log('\nAll automatically selected vehicle images are marked qc_required=true.');
