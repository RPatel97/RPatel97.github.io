const fs = require('fs');
const path = require('path');

const IMAGES_DIR = path.join(__dirname, 'images');
const OUTPUT_FILE = path.join(__dirname, 'images.json');
const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];

function isImage(fileName) {
    const ext = path.extname(fileName).toLowerCase();
    return IMAGE_EXTENSIONS.includes(ext);
}

function encodeUrl(filePath) {
    // Encode each path segment separately so slashes stay intact
    return filePath.split('/').map(encodeURIComponent).join('/');
}

function scanImages() {
    const result = {
        featured: [],
        landscapes: [],
        wildlife: [],
        portraits: []
    };

    if (!fs.existsSync(IMAGES_DIR)) {
        console.error('images/ directory not found');
        process.exit(1);
    }

    const folders = fs.readdirSync(IMAGES_DIR, { withFileTypes: true })
        .filter(d => d.isDirectory())
        .map(d => d.name);

    folders.forEach(folder => {
        const folderPath = path.join(IMAGES_DIR, folder);
        const files = fs.readdirSync(folderPath)
            .filter(isImage)
            .sort();

        const seen = new Map();

        files.forEach(file => {
            const ext = path.extname(file).toLowerCase();
            const baseName = file.slice(0, -ext.length);
            const webpFile = baseName + '.webp';
            const webpPath = path.join(folderPath, webpFile);
            const hasWebP = fs.existsSync(webpPath);

            if (seen.has(baseName)) return;

            const finalFile = hasWebP ? webpFile : file;
            const relativePath = `images/${folder}/${finalFile}`;

            seen.set(baseName, {
                name: finalFile,
                url: encodeUrl(relativePath),
                folder: folder
            });
        });

        seen.forEach(entry => {
            if (result[folder]) {
                result[folder].push(entry);
            } else {
                if (!result[folder]) result[folder] = [];
                result[folder].push(entry);
            }
        });

    });

    return result;
}

function main() {
    const data = scanImages();
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(data, null, 4) + '\n');

    const total = Object.values(data).reduce((sum, arr) => sum + arr.length, 0);
    const webpCount = Object.values(data).flat().filter(img => img.name.endsWith('.webp')).length;

    console.log(`✅ images.json updated — ${total} images across ${Object.keys(data).length} folders.`);
    if (webpCount > 0) {
        console.log(`   🗜️  ${webpCount} image(s) using compressed WebP format`);
    }
    Object.entries(data).forEach(([folder, imgs]) => {
        if (imgs.length) console.log(`   • ${folder}: ${imgs.length} image(s)`);
    });
}

main();