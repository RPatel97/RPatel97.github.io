const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const IMAGES_DIR = path.join(__dirname, 'images');
const THUMB_WIDTH = 600; // px — enough for masonry columns, not full res
const FOLDERS = ['landscapes', 'wildlife', 'portraits', 'featured'];

async function main() {
    for (const folder of FOLDERS) {
        const src = path.join(IMAGES_DIR, folder);
        const dst = path.join(IMAGES_DIR, folder, 'thumbs');
        if (!fs.existsSync(src)) continue;
        if (!fs.existsSync(dst)) fs.mkdirSync(dst, { recursive: true });

        const files = fs.readdirSync(src).filter(f => /\.(webp|jpg|jpeg|png)$/i.test(f));
        for (const file of files) {
            const out = path.join(dst, path.basename(file, path.extname(file)) + '.webp');
            if (fs.existsSync(out)) { console.log(`  ⏭  ${folder}/thumbs/${path.basename(out)} exists`); continue; }
            await sharp(path.join(src, file))
                .resize({ width: THUMB_WIDTH, withoutEnlargement: true })
                .webp({ quality: 70 })
                .toFile(out);
            console.log(`  ✅ ${folder}/thumbs/${path.basename(out)}`);
        }
    }
    console.log('\nDone! Now run: node update-images.js');
}

main().catch(err => { console.error(err);
    process.exit(1); });