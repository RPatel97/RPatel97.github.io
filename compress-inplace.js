const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const IMAGES_DIR = path.join(__dirname, 'images');
const FOLDERS = ['landscapes', 'wildlife', 'portraits', 'featured'];
const IMG_EXT = /\.(jpg|jpeg|png|gif|webp)$/i;
const QUALITY = 80;

async function main() {
    let total = 0,
        saved = 0;

    for (const folder of FOLDERS) {
        const folderPath = path.join(IMAGES_DIR, folder);
        if (!fs.existsSync(folderPath)) continue;

        const files = fs.readdirSync(folderPath)
            .filter(f => IMG_EXT.test(f) && fs.statSync(path.join(folderPath, f)).isFile());

        for (const file of files) {
            const fullPath = path.join(folderPath, file);
            const ext = path.extname(file).toLowerCase();
            const tmpPath = fullPath + '.tmp';
            const origSize = fs.statSync(fullPath).size;

            try {
                let pipeline = sharp(fullPath);
                if (ext === '.webp') pipeline = pipeline.webp({ quality: QUALITY });
                else if (ext === '.png') pipeline = pipeline.png({ quality: QUALITY });
                else pipeline = pipeline.jpeg({ quality: QUALITY });

                await pipeline.toFile(tmpPath);

                const newSize = fs.statSync(tmpPath).size;
                fs.renameSync(tmpPath, fullPath);

                const pct = ((origSize - newSize) / origSize * 100).toFixed(1);
                console.log(`  ✅ ${folder}/${file} — ${(origSize/1024).toFixed(0)}KB → ${(newSize/1024).toFixed(0)}KB (${pct}% smaller)`);
                saved += origSize - newSize;
                total++;
            } catch (err) {
                if (fs.existsSync(tmpPath)) fs.unlinkSync(tmpPath);
                console.error(`  ❌ ${folder}/${file}: ${err.message}`);
            }
        }
    }

    console.log(`\nDone — ${total} images compressed, ${(saved/1024/1024).toFixed(2)}MB saved.`);
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});