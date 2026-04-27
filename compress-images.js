const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const IMAGES_DIR = path.join(__dirname, 'images');
const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];

function isImage(fileName) {
    const ext = path.extname(fileName).toLowerCase();
    return IMAGE_EXTENSIONS.includes(ext);
}

function getAllImageFiles(dir, baseDir = dir) {
    const files = [];
    const items = fs.readdirSync(dir, { withFileTypes: true });

    for (const item of items) {
        const fullPath = path.join(dir, item.name);
        if (item.isDirectory()) {
            files.push(...getAllImageFiles(fullPath, baseDir));
        } else if (isImage(item.name)) {
            // Only process non-webp files, or webp files that aren't already optimized
            const ext = path.extname(item.name).toLowerCase();
            const webpPath = fullPath.replace(ext, '.webp');

            // Skip if webp version already exists and is newer
            if (ext !== '.webp' || !fs.existsSync(webpPath)) {
                files.push({
                    fullPath,
                    relativePath: path.relative(baseDir, fullPath),
                    dir: path.relative(baseDir, path.dirname(fullPath)),
                    name: item.name,
                    ext: ext
                });
            }
        }
    }

    return files;
}

async function compressImage(fileInfo) {
    const { fullPath, dir, name, ext } = fileInfo;

    // Skip if already a webp and no original exists
    if (ext === '.webp') {
        console.log(`  ⏭️  Skipping ${name} (already WebP)`);
        return { skipped: true };
    }

    const outputName = name.replace(ext, '.webp');
    const outputDir = path.join(IMAGES_DIR, dir);
    const outputPath = path.join(outputDir, outputName);

    // Create output directory if it doesn't exist
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    try {
        // Get original file size
        const originalStats = fs.statSync(fullPath);
        const originalSize = originalStats.size;

        // Compress using sharp with high quality (85) for near-lossless visual quality
        await sharp(fullPath)
            .webp({
                quality: 85,
                effort: 6, // Higher effort = better compression, slower
                smartSubsample: true,
                nearLossless: false
            })
            .toFile(outputPath);

        const compressedStats = fs.statSync(outputPath);
        const compressedSize = compressedStats.size;
        const savings = ((originalSize - compressedSize) / originalSize * 100).toFixed(1);

        console.log(`  ✅ ${name} → ${outputName} (${(originalSize/1024/1024).toFixed(2)}MB → ${(compressedSize/1024/1024).toFixed(2)}MB, ${savings}% smaller)`);

        return {
            success: true,
            originalSize,
            compressedSize,
            savings: parseFloat(savings),
            outputName,
            outputPath
        };
    } catch (err) {
        console.error(`  ❌ Failed to compress ${name}: ${err.message}`);
        return { success: false, error: err.message };
    }
}

async function main() {
    console.log('🔍 Scanning for images...\n');

    if (!fs.existsSync(IMAGES_DIR)) {
        console.error('❌ images/ directory not found');
        process.exit(1);
    }

    const imageFiles = getAllImageFiles(IMAGES_DIR);

    if (imageFiles.length === 0) {
        console.log('No images found to compress.');
        return;
    }

    console.log(`Found ${imageFiles.length} image(s) to process.\n`);
    console.log('🗜️  Compressing images to WebP format (quality: 85)...\n');

    let totalOriginal = 0;
    let totalCompressed = 0;
    let successCount = 0;
    let skipCount = 0;

    for (const file of imageFiles) {
        const result = await compressImage(file);
        if (result.success) {
            totalOriginal += result.originalSize;
            totalCompressed += result.compressedSize;
            successCount++;
        } else if (result.skipped) {
            skipCount++;
        }
    }

    console.log('\n📊 Compression Summary:');
    console.log(`   Images processed: ${successCount}`);
    console.log(`   Images skipped:   ${skipCount}`);

    if (successCount > 0) {
        const totalSavings = ((totalOriginal - totalCompressed) / totalOriginal * 100).toFixed(1);
        console.log(`   Total original:   ${(totalOriginal/1024/1024).toFixed(2)} MB`);
        console.log(`   Total compressed: ${(totalCompressed/1024/1024).toFixed(2)} MB`);
        console.log(`   Space saved:      ${totalSavings}%`);
    }

    console.log('\n✅ Done! Run `node update-images.js` to regenerate images.json with WebP URLs.');
}

main().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
});