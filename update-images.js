const fs = require('fs');
const path = require('path');

const IMAGES_DIR = path.join(__dirname, 'images');
const OUTPUT_FILE = path.join(__dirname, 'images.json');
const FOLDERS = ['featured', 'landscapes', 'wildlife', 'portraits'];
const IMG_EXT = /\.(jpg|jpeg|png|gif|webp)$/i;

function enc(p) { return p.split('/').map(encodeURIComponent).join('/'); }

function main() {
    const result = {};

    for (const folder of FOLDERS) {
        const folderPath = path.join(IMAGES_DIR, folder);
        const thumbPath = path.join(folderPath, 'thumbs');
        if (!fs.existsSync(folderPath)) { result[folder] = []; continue; }

        const files = fs.readdirSync(folderPath)
            .filter(f => IMG_EXT.test(f))
            .sort();

        const seen = new Map();
        for (const file of files) {
            const ext = path.extname(file).toLowerCase();
            const base = file.slice(0, -ext.length);
            if (seen.has(base)) continue;

            // Prefer WebP full image
            const webpFull = path.join(folderPath, base + '.webp');
            const finalFile = fs.existsSync(webpFull) ? base + '.webp' : file;

            // Prefer WebP thumb
            const thumbFile = base + '.webp';
            const thumbFull = path.join(thumbPath, thumbFile);
            const hasThumb = fs.existsSync(thumbFull);

            seen.set(base, {
                name: finalFile,
                url: enc(`images/${folder}/${finalFile}`),
                thumb: hasThumb ? enc(`images/${folder}/thumbs/${thumbFile}`) : enc(`images/${folder}/${finalFile}`),
                folder: folder
            });
        }

        result[folder] = [...seen.values()];
    }

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(result, null, 2) + '\n');
    const total = Object.values(result).reduce((s, a) => s + a.length, 0);
    console.log(`✅ images.json updated — ${total} images`);
    for (const [f, imgs] of Object.entries(result)) {
        if (imgs.length) console.log(`   • ${f}: ${imgs.length} (${imgs.filter(i=>i.thumb!==i.url).length} with thumbs)`);
    }
}

main();