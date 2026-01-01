#!/usr/bin/env node
/**
 * Asset Generation Script - Apple Design Language
 *
 * Creates app icons and splash screens following Apple Human Interface Guidelines:
 * - Clean, simple, recognizable at any size
 * - No transparency on final icons (system applies squircle mask)
 * - 3D depth with subtle shadows (Big Sur style)
 * - Consistent design language across all assets
 *
 * Generates:
 * - icon.png (1024x1024 app icon)
 * - splash.png (2732x2732 full-screen splash)
 * - adaptive-icon.png (1024x1024 for Android)
 * - favicon.png (48x48 for web)
 */

const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const ASSETS_DIR = path.join(__dirname, '..', 'assets', 'images');
const BRAND_COLOR = '#2563EB';
const GRADIENT_START = '#3B82F6'; // Lighter blue at top
const GRADIENT_END = '#1E40AF';   // Darker blue at bottom

// Path to AI-generated icon element (from game-asset-tool)
const AI_ICON_PATH = '/Users/felipevieira/repos/shared-assets/generated/2d/gemini_ui_1767065666071.png';

/**
 * Remove background using flood fill from corners
 * This approach samples the corner color and removes similar colors connected to edges
 */
async function removeBackground(inputPath) {
    const image = sharp(inputPath);
    const { data, info } = await image.raw().toBuffer({ resolveWithObject: true });
    const { width, height, channels } = info;

    const newData = Buffer.alloc(width * height * 4);
    const visited = new Set();

    // Get pixel color at position
    const getPixel = (x, y) => {
        if (x < 0 || x >= width || y < 0 || y >= height) return null;
        const idx = (y * width + x) * channels;
        return { r: data[idx], g: data[idx + 1], b: data[idx + 2] };
    };

    // Check if two colors are similar (within tolerance)
    const colorMatch = (c1, c2, tolerance = 25) => {
        if (!c1 || !c2) return false;
        return Math.abs(c1.r - c2.r) <= tolerance &&
               Math.abs(c1.g - c2.g) <= tolerance &&
               Math.abs(c1.b - c2.b) <= tolerance;
    };

    // Sample background color from corner
    const bgColor = getPixel(5, 5);

    // Flood fill from all edges to mark background pixels
    const queue = [];

    // Add edge pixels to queue
    for (let x = 0; x < width; x++) {
        queue.push([x, 0]);
        queue.push([x, height - 1]);
    }
    for (let y = 0; y < height; y++) {
        queue.push([0, y]);
        queue.push([width - 1, y]);
    }

    // Flood fill using BFS
    while (queue.length > 0) {
        const [x, y] = queue.shift();
        const key = `${x},${y}`;

        if (visited.has(key)) continue;
        if (x < 0 || x >= width || y < 0 || y >= height) continue;

        const pixel = getPixel(x, y);
        if (!colorMatch(pixel, bgColor)) continue;

        visited.add(key);

        queue.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
    }

    // Build output
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const srcIdx = (y * width + x) * channels;
            const dstIdx = (y * width + x) * 4;
            const key = `${x},${y}`;

            if (visited.has(key)) {
                newData[dstIdx] = 0;
                newData[dstIdx + 1] = 0;
                newData[dstIdx + 2] = 0;
                newData[dstIdx + 3] = 0;
            } else {
                newData[dstIdx] = data[srcIdx];
                newData[dstIdx + 1] = data[srcIdx + 1];
                newData[dstIdx + 2] = data[srcIdx + 2];
                newData[dstIdx + 3] = channels === 4 ? data[srcIdx + 3] : 255;
            }
        }
    }

    // Trim transparent edges to get just the icon
    return sharp(newData, {
        raw: { width, height, channels: 4 }
    }).png().trim().toBuffer();
}

/**
 * Create gradient background SVG
 */
function createGradientBg(width, height, cornerRadius = 0) {
    return `
        <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style="stop-color:${GRADIENT_START};stop-opacity:1" />
                    <stop offset="100%" style="stop-color:${GRADIENT_END};stop-opacity:1" />
                </linearGradient>
            </defs>
            <rect width="${width}" height="${height}" rx="${cornerRadius}" ry="${cornerRadius}" fill="url(#grad)"/>
        </svg>
    `;
}

/**
 * Generate main app icon (1024x1024)
 * Apple will apply the squircle mask automatically
 */
async function generateIcon(iconElement) {
    console.log('Generating icon.png (1024x1024)...');

    const size = 1024;
    const iconSize = 1024; // Full size - fills entire icon area
    const padding = (size - iconSize) / 2;

    // Create gradient background (no rounded corners - Apple applies mask)
    const bgSvg = createGradientBg(size, size, 0);

    // Resize icon element
    const resizedIcon = await sharp(iconElement)
        .resize(iconSize, iconSize, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .toBuffer();

    await sharp(Buffer.from(bgSvg))
        .composite([{
            input: resizedIcon,
            top: Math.round(padding),
            left: Math.round(padding)
        }])
        .png()
        .toFile(path.join(ASSETS_DIR, 'icon.png'));

    console.log('  Done: icon.png');
}

/**
 * Generate splash screen (2732x2732)
 * Centered icon on gradient background
 */
async function generateSplash(iconElement) {
    console.log('Generating splash.png (2732x2732)...');

    const size = 2732;
    const iconSize = 1400; // Large icon for splash (before trim)

    const bgSvg = createGradientBg(size, size, 0);

    // Resize icon element
    const resizedIcon = await sharp(iconElement)
        .resize(iconSize, iconSize, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .toBuffer();

    await sharp(Buffer.from(bgSvg))
        .composite([{
            input: resizedIcon,
            gravity: 'center'
        }])
        .png()
        .toFile(path.join(ASSETS_DIR, 'splash.png'));

    console.log('  Done: splash.png');
}

/**
 * Generate Android adaptive icon (1024x1024)
 */
async function generateAdaptiveIcon(iconElement) {
    console.log('Generating adaptive-icon.png (1024x1024)...');

    const size = 1024;
    const iconSize = 780; // Larger but respecting Android safe zone
    const padding = (size - iconSize) / 2;

    const bgSvg = createGradientBg(size, size, 0);

    const resizedIcon = await sharp(iconElement)
        .resize(iconSize, iconSize, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .toBuffer();

    await sharp(Buffer.from(bgSvg))
        .composite([{
            input: resizedIcon,
            top: Math.round(padding),
            left: Math.round(padding)
        }])
        .png()
        .toFile(path.join(ASSETS_DIR, 'adaptive-icon.png'));

    console.log('  Done: adaptive-icon.png');
}

/**
 * Generate favicon (48x48)
 */
async function generateFavicon(iconElement) {
    console.log('Generating favicon.png (48x48)...');

    const size = 48;
    const iconSize = 36;
    const padding = (size - iconSize) / 2;

    const bgSvg = createGradientBg(size, size, 8);

    const resizedIcon = await sharp(iconElement)
        .resize(iconSize, iconSize, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .toBuffer();

    await sharp(Buffer.from(bgSvg))
        .composite([{
            input: resizedIcon,
            top: Math.round(padding),
            left: Math.round(padding)
        }])
        .png()
        .toFile(path.join(ASSETS_DIR, 'favicon.png'));

    console.log('  Done: favicon.png');
}

/**
 * Generate splash icon (1024x1024 transparent)
 * Doubled size for better visibility on large screens like iPhone 16 Pro Max
 */
async function generateSplashIcon(iconElement) {
    console.log('Generating splash-icon.png (1024x1024)...');

    await sharp(iconElement)
        .resize(1024, 1024, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .png()
        .toFile(path.join(ASSETS_DIR, 'splash-icon.png'));

    console.log('  Done: splash-icon.png');
}

async function main() {
    console.log('');
    console.log('='.repeat(50));
    console.log('  Apple-Style App Asset Generator');
    console.log('='.repeat(50));
    console.log('');

    try {
        // Ensure output directory exists
        if (!fs.existsSync(ASSETS_DIR)) {
            fs.mkdirSync(ASSETS_DIR, { recursive: true });
        }

        // Check if AI-generated icon exists
        if (!fs.existsSync(AI_ICON_PATH)) {
            throw new Error(`AI icon not found at: ${AI_ICON_PATH}`);
        }

        console.log('Processing AI-generated icon...');
        console.log(`  Source: ${AI_ICON_PATH}`);

        // Remove background from AI icon (white + dark blue)
        const cleanIcon = await removeBackground(AI_ICON_PATH);
        console.log('  Background removed successfully');
        console.log('');

        // Generate all assets
        await generateIcon(cleanIcon);
        await generateAdaptiveIcon(cleanIcon);
        await generateSplash(cleanIcon);
        await generateFavicon(cleanIcon);
        await generateSplashIcon(cleanIcon);

        // Also save the clean icon element for reference
        await sharp(cleanIcon)
            .toFile(path.join(ASSETS_DIR, 'icon-element.png'));
        console.log('  Done: icon-element.png (transparent element)');

        console.log('');
        console.log('='.repeat(50));
        console.log('  All assets generated successfully!');
        console.log('='.repeat(50));
        console.log('');
        console.log('Generated files:');
        console.log('  - icon.png (1024x1024) - Main app icon');
        console.log('  - adaptive-icon.png (1024x1024) - Android adaptive icon');
        console.log('  - splash.png (2732x2732) - Splash screen');
        console.log('  - favicon.png (48x48) - Web favicon');
        console.log('  - splash-icon.png (1024x1024) - Transparent icon');
        console.log('  - icon-element.png - Clean icon element');
        console.log('');
        console.log('Next steps:');
        console.log('  1. Review the generated assets');
        console.log('  2. Run: npx expo start --clear');
        console.log('');
    } catch (error) {
        console.error('');
        console.error('Error:', error.message);
        console.error(error.stack);
        process.exit(1);
    }
}

main();
