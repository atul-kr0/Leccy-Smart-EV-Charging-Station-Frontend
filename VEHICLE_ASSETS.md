# Leccy vehicle assets

## Catalogue model

The current catalogue used by this package contains **81 records** and **54 unique physical make/model combinations**. The catalogue's `model` field is already the physical model; trim, battery and drivetrain differences are in `variant`.

Therefore multiple records intentionally reuse one image. Example: both BE 6 battery variants use `/vehicles/mahindra/be-6.webp`.

## Image standard

Vehicle assets are normalized to WebP on an 800x600 logical card canvas by the downloader. The car is kept proportional and centered; no artificial mirroring is performed.

The selection policy prefers front 3/4, especially front-right, and penalizes rear, side-only, interior, concept, people/crowd, watermark and text-overlay candidates. Automated selection is still marked `qc_required=true` because a script cannot guarantee visual compliance without human inspection.

## Run

```bash
npm install
npm run assets:validate
npm run download:vehicle-assets
npm run build
```

`assets:validate` checks the 81/54 structure and reports missing local vehicle files. The downloader is resumable: existing assets are skipped.

## Sources and licensing

Vehicle source pages and available creator/license metadata are written to `public/vehicle-asset-attributions.json` after download. Check the recorded source/license before redistributing any asset.

Brand logos are retrieved from Simple Icons when available. Brand names and marks remain the property of their respective owners.
