#!/usr/bin/env node

/**
 * Generate minimalist grayscale splash icon
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');

const API_KEY = 'AIzaSyCS8rBCCRI0cRSX5a9byHnmp2aI1yPI44Q';
const MODEL = 'gemini-2.0-flash-exp';

async function generateSplashIcon() {
    console.log('🎨 Generating minimalist grayscale splash icon...\n');

    const genAI = new GoogleGenerativeAI(API_KEY);

    const model = genAI.getGenerativeModel({
        model: MODEL,
        generationConfig: {
            responseModalities: ['TEXT', 'IMAGE'],
        },
    });

    const prompt = `Generate a modern, premium splash screen icon for a "Bills Tracker" finance app.

CRITICAL REQUIREMENTS:
- NO BORDER around the icon - just the icon graphic itself
- NO frame, NO outline box - the design floats freely
- TRANSPARENT background (PNG with alpha channel)
- MUST MATCH the app icon design style exactly

DESIGN REQUIREMENTS:
- Style: Modern, premium, bold - matching the app icon
- Color: Dark charcoal (#1C1C1E) or black with subtle depth
- Background: TRANSPARENT - icon floats on its own
- Main Element: The SAME design as the app icon but optimized for splash:
  - If app icon is a dollar sign - use the same stylized dollar sign
  - If app icon is a wallet - use the same wallet silhouette
  - If app icon is a receipt - use the same receipt design
  - MUST be visually consistent with the app icon
- Design characteristics:
  - BOLD shapes, solid fills
  - Clean, modern silhouette
  - Works on light background (#F5F5F7)
  - Centered in canvas
  - Fills about 70-80% of the 512x512 canvas
- Design Philosophy:
  - Premium tech company aesthetic
  - Instantly recognizable
  - Matches app icon perfectly
- Size: 512x512 pixels, centered

Create the SAME bold, modern design as the app icon but as a dark silhouette on TRANSPARENT background.`;

    try {
        console.log('📡 Sending request to Gemini API...');
        const result = await model.generateContent({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
        });

        const response = await result.response;
        const parts = response.candidates?.[0]?.content?.parts || [];
        let imageData = null;

        for (const part of parts) {
            if (part.inlineData?.mimeType?.startsWith('image/')) {
                imageData = part.inlineData.data;
                console.log('✅ Splash icon generated successfully!');
                break;
            }
        }

        if (!imageData) {
            throw new Error('No image data in response');
        }

        const outputDir = path.join(__dirname, '..', 'assets', 'images');

        const imageBuffer = Buffer.from(imageData, 'base64');

        // Save to both locations
        fs.writeFileSync(path.join(outputDir, 'splash-icon.png'), imageBuffer);
        fs.writeFileSync(path.join(outputDir, 'adaptive-icon.png'), imageBuffer);

        console.log(`\n✅ Splash icon saved`);
        console.log(`✅ Adaptive icon saved`);
    } catch (error) {
        console.error('❌ Error generating splash icon:', error.message);
        throw error;
    }
}

generateSplashIcon().catch(console.error);
