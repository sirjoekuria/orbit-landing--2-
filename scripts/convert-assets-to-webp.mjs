#!/usr/bin/env node
/**
 * convert-assets-to-webp.mjs
 * 
 * Converts all PNG / JPEG images found in the Android res folders
 * and the project public/ folder to WebP format, then removes the originals.
 *
 * Run:  node scripts/convert-assets-to-webp.mjs [--dry-run]
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const DRY_RUN = process.argv.includes('--dry-run');

// Directories to scan (relative to project root)
const SCAN_DIRS = [
    'android/app/src/main/res',
    'public',
    'client/src/assets',
];

// Extensions to convert
const IMAGE_EXTS = new Set(['.png', '.jpg', '.jpeg']);

// Files / patterns to exclude
const EXCLUDE_PATTERNS = [
    /ic_launcher_background/,  // Launcher background is colour-only XML, skip PNG if any
    /node_modules/,
];

function shouldExclude(filePath) {
    return EXCLUDE_PATTERNS.some((re) => re.test(filePath));
}

async function scanAndConvert(dir) {
    if (!fs.existsSync(dir)) return;

    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (shouldExclude(fullPath)) continue;

        if (entry.isDirectory()) {
            await scanAndConvert(fullPath);
        } else if (entry.isFile()) {
            const ext = path.extname(entry.name).toLowerCase();
            if (!IMAGE_EXTS.has(ext)) continue;

            const webpPath = fullPath.replace(new RegExp(`\\${ext}$`, 'i'), '.webp');

            // Skip if WebP version already exists
            if (fs.existsSync(webpPath)) {
                console.log(`SKIP (WebP exists): ${path.relative(ROOT, fullPath)}`);
                continue;
            }

            const relPath = path.relative(ROOT, fullPath);
            if (DRY_RUN) {
                console.log(`[dry-run] WOULD CONVERT: ${relPath}`);
                continue;
            }

            try {
                await sharp(fullPath)
                    .webp({ quality: 85, lossless: ext === '.png' })
                    .toFile(webpPath);

                const origSize = fs.statSync(fullPath).size;
                const newSize = fs.statSync(webpPath).size;
                const saving = Math.round((1 - newSize / origSize) * 100);

                fs.unlinkSync(fullPath);
                console.log(`CONVERTED: ${relPath}  (saved ${saving}%)`);
            } catch (err) {
                console.error(`ERROR converting ${relPath}:`, err.message);
            }
        }
    }
}

(async () => {
    if (DRY_RUN) console.log('=== DRY RUN — no files will be changed ===\n');

    for (const dir of SCAN_DIRS) {
        const absDir = path.join(ROOT, dir);
        console.log(`\nScanning: ${dir}`);
        await scanAndConvert(absDir);
    }

    console.log('\nDone.');
})();
