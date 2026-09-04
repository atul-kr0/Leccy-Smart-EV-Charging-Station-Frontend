import fs from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const manifest = JSON.parse(await fs.readFile(path.join(root, 'public/vehicle-assets.json'), 'utf8'));
const missing = [];
const bad = [];
const requireFiles = process.argv.includes('--files');

if (manifest.catalogueVehicleCount !== manifest.vehicles.length) {
  bad.push(`manifest catalogueVehicleCount=${manifest.catalogueVehicleCount}, vehicles=${manifest.vehicles.length}`);
}
if (manifest.uniquePhysicalModels !== manifest.models.length) {
  bad.push(`manifest uniquePhysicalModels=${manifest.uniquePhysicalModels}, models=${manifest.models.length}`);
}

if (requireFiles) {
  for (const model of manifest.models) {
    const file = path.join(root, 'public', model.path.replace(/^\//, ''));
    try { await fs.access(file); }
    catch { missing.push(model.path); }
  }
}

const seen = new Set();
for (const v of manifest.vehicles) {
  const key = `${v.make}|${v.model}`;
  if (!seen.has(key)) seen.add(key);
  if (!v.image || !v.brandLogo) bad.push(`missing asset fields for ${key}`);
}

console.log(`Catalogue records: ${manifest.vehicles.length}`);
console.log(`Unique physical models: ${manifest.models.length}`);
console.log(`Unique make/model pairs in records: ${seen.size}`);
console.log(`Missing local vehicle files: ${requireFiles ? missing.length : 'not checked (use --files)'}`);
console.log(`Structural errors: ${bad.length}`);
if (missing.length) missing.forEach(x => console.log(`- missing ${x}`));
if (bad.length) bad.forEach(x => console.log(`- ${x}`));
process.exit(missing.length || bad.length ? 1 : 0);
