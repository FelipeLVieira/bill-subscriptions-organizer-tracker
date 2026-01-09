#!/usr/bin/env node

/**
 * Convert SVG icons to PNG using sharp
 * Run with: node scripts/convert-icons.js
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const IMAGES_DIR = path.join(__dirname, '..', 'assets', 'images');

// Icon configurations
const CONFIGS = [
    {
        svg: 'icon-new.svg',
        outputs: [
            { name: 'icon.png', size: 1024, background: '#3B82F6' },
            { name: 'favicon.png', size: 196, background: '#3B82F6' },
        ]
    },
    {
        svg: 'adaptive-icon-new.svg',
        outputs: [
            { name: 'adaptive-icon.png', size: 1024, background: '#3B82F6' },
            { name: 'android-icon-foreground.png', size: 1024, background: { r: 0, g: 0, b: 0, alpha: 0 } },
        ]
    },
    {
        svg: 'splash-icon-new.svg',
        outputs: [
            { name: 'splash-icon.png', size: 512, background: { r: 0, g: 0, b: 0, alpha: 0 } },
        ]
    },
    {
        svg: 'monochrome-icon-new.svg',
        outputs: [
            { name: 'android-icon-monochrome.png', size: 1024, background: { r: 0, g: 0, b: 0, alpha: 0 } },
        ]
    }
];

async function convertSvgToPng(svgPath, outputPath, size, background) {
    const svgContent = fs.readFileSync(svgPath, 'utf8');

    let pipeline = sharp(Buffer.from(svgContent))
        .resize(size, size);

    if (background && typeof background === 'string') {
        // Solid color background
        pipeline = pipeline.flatten({ background });
    } else if (background && typeof background === 'object' && background.alpha === 0) {
        // Transparent background - don't flatten
        pipeline = pipeline.png();
    } else if (background && typeof background === 'object') {
        pipeline = pipeline.flatten({ background });
    }

    await pipeline.png().toFile(outputPath);
    console.log(`Created: ${outputPath} (${size}x${size})`);
}

async function generateAndroidBackground() {
    // Create solid blue background for Android adaptive icon
    await sharp({
        create: {
            width: 1024,
            height: 1024,
            channels: 4,
            background: { r: 59, g: 130, b: 246, alpha: 1 } // #3B82F6
        }
    })
        .png()
        .toFile(path.join(IMAGES_DIR, 'android-icon-background.png'));

    console.log('Created: android-icon-background.png (1024x1024)');
}

async function main() {
    console.log('Converting SVG icons to PNG...\n');

    for (const config of CONFIGS) {
        const svgPath = path.join(IMAGES_DIR, config.svg);

        if (!fs.existsSync(svgPath)) {
            console.warn(`Warning: ${config.svg} not found, skipping...`);
            continue;
        }

        for (const output of config.outputs) {
            const outputPath = path.join(IMAGES_DIR, output.name);
            await convertSvgToPng(svgPath, outputPath, output.size, output.background);
        }
    }

    // Generate solid background for Android
    await generateAndroidBackground();

    console.log('\nAll icons generated successfully!');
}

main().catch(console.error);
