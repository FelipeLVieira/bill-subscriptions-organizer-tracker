#!/usr/bin/env node

/**
 * Create a splash screen icon from the app icon
 * Extracts the dollar sign design and places it on a transparent background
 */

const sharp = require('sharp');
const path = require('path');

async function createSplashFromIcon() {
    console.log('Creating splash screen from app icon...\n');

    const iconPath = path.join(__dirname, '..', 'assets', 'images', 'icon.png');
    const splashPath = path.join(__dirname, '..', 'assets', 'images', 'splash-icon.png');
    const adaptivePath = path.join(__dirname, '..', 'assets', 'images', 'adaptive-icon.png');

    try {
        // Read the icon
        const icon = sharp(iconPath);
        const metadata = await icon.metadata();

        console.log(`Icon size: ${metadata.width}x${metadata.height}`);

        // The icon has a light background (~#F5F5F7) and dark dollar sign (~#1C1C1E)
        // The icon also has rounded corners that we need to ignore

        // First, crop the center of the icon to avoid rounded corners
        // The rounded corners are typically ~12-15% of the icon size
        const cropMargin = Math.floor(metadata.width * 0.12);

        const processed = await sharp(iconPath)
            // Crop to remove rounded corners area
            .extract({
                left: cropMargin,
                top: cropMargin,
                width: metadata.width - (cropMargin * 2),
                height: metadata.height - (cropMargin * 2)
            })
            // Resize to final splash size
            .resize(400, 400, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
            .raw()
            .toBuffer({ resolveWithObject: true });

        const { data, info } = processed;
        const { width, height, channels } = info;

        // Create a 512x512 canvas with the 400x400 icon centered
        const canvasSize = 512;
        const offset = (canvasSize - width) / 2;

        // Create a new buffer with alpha channel for 512x512
        const outputData = Buffer.alloc(canvasSize * canvasSize * 4);

        // Process each pixel of the cropped icon
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const srcIdx = (y * width + x) * channels;
                const dstX = Math.floor(offset + x);
                const dstY = Math.floor(offset + y);
                const dstIdx = (dstY * canvasSize + dstX) * 4;

                const r = data[srcIdx];
                const g = data[srcIdx + 1];
                const b = data[srcIdx + 2];

                // Calculate brightness (0-255, where 0 is black, 255 is white)
                const brightness = (r + g + b) / 3;

                // If pixel is dark (part of the dollar sign), keep it
                // If pixel is light (background), make it transparent
                // Threshold around 200 (light gray background is ~245)
                if (brightness < 180) {
                    // Keep the dark pixel with full opacity
                    outputData[dstIdx] = r;         // R
                    outputData[dstIdx + 1] = g;     // G
                    outputData[dstIdx + 2] = b;     // B
                    outputData[dstIdx + 3] = 255;   // A (fully opaque)
                }
                // Light pixels stay as transparent (buffer is initialized to 0)
            }
        }

        // Create the output image
        await sharp(outputData, {
            raw: {
                width: canvasSize,
                height: canvasSize,
                channels: 4
            }
        })
            .png()
            .toFile(splashPath);

        console.log(`Splash icon saved to: ${splashPath}`);

        // Also save as adaptive icon
        await sharp(outputData, {
            raw: {
                width: canvasSize,
                height: canvasSize,
                channels: 4
            }
        })
            .png()
            .toFile(adaptivePath);

        console.log(`Adaptive icon saved to: ${adaptivePath}`);

        console.log('\nDone! Splash screen created with transparent background.');
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

createSplashFromIcon();
