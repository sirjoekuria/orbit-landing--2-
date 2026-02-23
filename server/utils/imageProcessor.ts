/**
 * imageProcessor.ts
 *
 * Shared utility for processing uploaded image files server-side.
 * Converts any image (PNG, JPEG, GIF, TIFF…) to WebP and deletes
 * the original so only the optimised file is stored.
 *
 * Usage:
 *   import { convertToWebp } from '../utils/imageProcessor';
 *   const webpPath = await convertToWebp(file.path, file.mimetype);
 */

import sharp from 'sharp';
import path from 'path';
import fs from 'fs';

/**
 * Converts an uploaded image to WebP format.
 *
 * @param filePath    Absolute path to the uploaded file on disk.
 * @param mimetype    MIME type reported by the upload middleware.
 * @param quality     WebP quality 1-100 (default: 82).
 * @returns           Path to the newly created WebP file (same dir, .webp ext).
 *                    Returns the original path unchanged for non-image files.
 */
export async function convertToWebp(
    filePath: string,
    mimetype: string,
    quality = 82,
): Promise<string> {
    // Skip if not an image (e.g. PDFs)
    if (!mimetype.startsWith('image/')) return filePath;

    // Skip if already WebP
    if (mimetype === 'image/webp') return filePath;

    const ext = path.extname(filePath);
    const webpPath = filePath.replace(new RegExp(`\\${ext}$`, 'i'), '.webp');

    await sharp(filePath)
        .webp({ quality, effort: 4 }) // effort 4 = balanced speed/compression
        .toFile(webpPath);

    // Remove original after successful conversion
    if (fs.existsSync(filePath) && filePath !== webpPath) {
        fs.unlinkSync(filePath);
    }

    return webpPath;
}

/**
 * Process an entire `req.files` map (from multer .fields()) and convert
 * every image to WebP in-place. Modifies the file objects' `path` and
 * `filename` properties so downstream code sees the correct WebP paths.
 */
export async function processUploadedFiles(
    files: { [fieldname: string]: Express.Multer.File[] },
): Promise<void> {
    for (const field of Object.keys(files)) {
        for (const file of files[field]) {
            if (!file.mimetype.startsWith('image/') || file.mimetype === 'image/webp') {
                continue;
            }

            try {
                const webpPath = await convertToWebp(file.path, file.mimetype);
                file.path = webpPath;
                file.filename = path.basename(webpPath);
            } catch (err) {
                console.error(`[imageProcessor] Failed to convert ${file.originalname} to WebP:`, err);
                // Keep original path – conversion failure is non-fatal
            }
        }
    }
}
