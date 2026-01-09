#!/usr/bin/env node

/**
 * Generate app icon using Nano Banana Pro
 * Uses JSON-structured requests for better results
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Nano Banana Pro credentials from game-asset-tool
const API_KEY = 'AIzaSyCS8rBCCRI0cRSX5a9byHnmp2aI1yPI44Q';
const MODEL = 'nano-banana-pro-preview';

/**
 * JSON-structured request for app icon generation
 */
const iconRequest = {
    type: 'app_icon',
    description: 'Bills Tracker finance app icon',
    style: {
        artStyle: 'modern-minimal',
        colorPalette: 'monochrome-elegant',
        perspective: 'front'
    },
    design: {
        mainElement: 'dollar_sign',
        elementStyle: 'bold_geometric',
        background: 'solid_light_gray',
        composition: 'centered'
    },
    dimensions: {
        width: 1024,
        height: 1024
    },
    requirements: {
        noBorders: true,
        noFrames: true,
        fillCanvas: true,
        appleStyleRoundedCorners: false
    },
    colors: {
        background: '#F2F2F7',
        foreground: '#1C1C1E',
        accent: null
    },
    quality: {
        detail: 'high',
        antiAliasing: true,
        crisp: true
    }
};

async function generateIcon() {
    console.log('Generating app icon with Nano Banana Pro...\n');
    console.log('Request configuration:');
    console.log(JSON.stringify(iconRequest, null, 2));
    console.log('');

    const genAI = new GoogleGenerativeAI(API_KEY);

    const model = genAI.getGenerativeModel({
        model: MODEL,
        generationConfig: {
            responseModalities: ['TEXT', 'IMAGE'],
        },
    });

    // Build the prompt from JSON structure
    const prompt = `Generate a premium app icon based on this specification:

${JSON.stringify(iconRequest, null, 2)}

DETAILED REQUIREMENTS:
- Create a 1024x1024 pixel square app icon
- Background: Solid flat light gray (#F2F2F7) - NO gradients
- Main element: A BOLD, thick dollar sign ($) in near-black (#1C1C1E)
- The dollar sign should:
  - Fill approximately 65-70% of the canvas height
  - Be perfectly centered horizontally and vertically
  - Use a heavy/bold weight sans-serif style
  - Be clean, modern, and professional
  - Have no decorations, shadows, or 3D effects

CRITICAL CONSTRAINTS:
- NO border or frame around the icon
- NO rounded rectangle shape - just the design filling the canvas
- NO text other than the $ symbol
- NO gradients on the symbol itself
- Flat, minimal design aesthetic
- Apple iOS icon style quality

The result should look like a premium finance app icon similar to Apple Wallet, Cash App, or Venmo quality.`;

    try {
        console.log('Sending request to Nano Banana Pro API...');

        const result = await model.generateContent({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
        });

        const response = await result.response;
        const parts = response.candidates?.[0]?.content?.parts || [];
        let imageData = null;

        for (const part of parts) {
            if (part.inlineData?.mimeType?.startsWith('image/')) {
                imageData = part.inlineData.data;
                console.log('Icon generated successfully!');
                break;
            }
        }

        if (!imageData) {
            throw new Error('No image data in response');
        }

        const outputDir = path.join(__dirname, '..', 'assets', 'images');
        const iconPath = path.join(outputDir, 'icon.png');

        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        const imageBuffer = Buffer.from(imageData, 'base64');

        // Save the icon
        fs.writeFileSync(iconPath, imageBuffer);
        console.log(`\nIcon saved to: ${iconPath}`);

        // Also generate splash-icon.png (same design, slightly smaller on transparent background)
        await generateSplashIcon(imageBuffer, outputDir);

        return iconPath;
    } catch (error) {
        console.error('Error generating icon:', error.message);
        throw error;
    }
}

async function generateSplashIcon(iconBuffer, outputDir) {
    console.log('\nGenerating splash icon from app icon...');

    try {
        // Get the icon metadata
        const metadata = await sharp(iconBuffer).metadata();
        console.log(`Icon size: ${metadata.width}x${metadata.height}`);

        // Process the icon to extract the dollar sign with transparent background
        const { data, info } = await sharp(iconBuffer)
            .ensureAlpha()
            .raw()
            .toBuffer({ resolveWithObject: true });

        const { width, height, channels } = info;

        // Create output buffer with transparency
        const outputData = Buffer.alloc(width * height * 4);

        // Process pixels - remove light background, keep dark foreground
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const srcIdx = (y * width + x) * channels;
                const dstIdx = (y * width + x) * 4;

                const r = data[srcIdx];
                const g = data[srcIdx + 1];
                const b = data[srcIdx + 2];

                // Calculate brightness
                const brightness = (r + g + b) / 3;

                // Keep dark pixels (the dollar sign), make light pixels transparent
                // The background is ~#F2F2F7 (brightness ~242), the dollar sign is ~#1C1C1E (brightness ~28)
                if (brightness < 180) {
                    outputData[dstIdx] = r;
                    outputData[dstIdx + 1] = g;
                    outputData[dstIdx + 2] = b;
                    outputData[dstIdx + 3] = 255;
                } else {
                    // Transparent
                    outputData[dstIdx] = 0;
                    outputData[dstIdx + 1] = 0;
                    outputData[dstIdx + 2] = 0;
                    outputData[dstIdx + 3] = 0;
                }
            }
        }

        // Resize to 512x512 for splash
        const splashBuffer = await sharp(outputData, {
            raw: { width, height, channels: 4 }
        })
            .resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
            .png()
            .toBuffer();

        const splashPath = path.join(outputDir, 'splash-icon.png');
        fs.writeFileSync(splashPath, splashBuffer);
        console.log(`Splash icon saved to: ${splashPath}`);

        // Also save as adaptive icon for Android
        const adaptivePath = path.join(outputDir, 'adaptive-icon.png');
        fs.writeFileSync(adaptivePath, splashBuffer);
        console.log(`Adaptive icon saved to: ${adaptivePath}`);

    } catch (error) {
        console.error('Error generating splash icon:', error.message);
        throw error;
    }
}

generateIcon().catch(console.error);
