import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const logoPath = './public/logo.png';
const resDir = './android/app/src/main/res';

const sizes = [
    { name: 'mipmap-mdpi', size: 48 },
    { name: 'mipmap-hdpi', size: 72 },
    { name: 'mipmap-xhdpi', size: 96 },
    { name: 'mipmap-xxhdpi', size: 144 },
    { name: 'mipmap-xxxhdpi', size: 192 }
];

async function generateIcons() {
    for (const { name, size } of sizes) {
        const dir = path.join(resDir, name);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

        // Generate main launcher icon
        await sharp(logoPath)
            .resize(size, size)
            .webp()
            .toFile(path.join(dir, 'ic_launcher.webp'));

        // Generate round launcher icon (same for now, as logo is circular)
        await sharp(logoPath)
            .resize(size, size)
            .webp()
            .toFile(path.join(dir, 'ic_launcher_round.webp'));

        // Generate foreground icon (for adaptive icons)
        await sharp(logoPath)
            .resize(size, size)
            .webp()
            .toFile(path.join(dir, 'ic_launcher_foreground.webp'));

        console.log(`✅ Generated icons for ${name}`);
    }
}

generateIcons().catch(console.error);
