#!/usr/bin/env node

/**
 * Generate splash screen icon using Nano Banana Pro (Gemini) API
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');

const API_KEY = process.env.NANO_BANANA_API_KEY || 'AIzaSyCS8rBCCRI0cRSX5a9byHnmp2aI1yPI44Q';
const MODEL = 'gemini-2.0-flash-exp';

async function generateSplashIcon() {
    console.log('🎨 Generating splash screen icon using Gemini...\n');

    const genAI = new GoogleGenerativeAI(API_KEY);

    const model = genAI.getGenerativeModel({
        model: MODEL,
        generationConfig: {
            responseModalities: ['TEXT', 'IMAGE'],
        },
    });

    const prompt = `Generate a professional splash screen icon for a "Bills Tracker" finance app.

DESIGN REQUIREMENTS:
- Style: Modern, clean, Apple-like design
- Main Element: A stylized wallet with a checkmark or dollar sign
- Colors:
  - White/light colored icon elements
  - The icon itself should be on a TRANSPARENT background
  - Icon elements: white (#FFFFFF) with subtle shadows
- Design: Simple, recognizable silhouette that works on any background
- Size: 512x512 pixels, centered
- The icon should be JUST the graphic element (wallet/bills with checkmark)
- NO background color - transparent background only
- NO rounded corners on the icon itself
- Clean vector-like appearance

This icon will be displayed on a solid blue splash screen, so it needs to contrast well.
Generate a white/light-colored icon on transparent background.`;

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
            const text = response.text();
            console.log('Response text:', text);
            throw new Error('No image data in response');
        }

        const outputDir = path.join(__dirname, '..', 'assets', 'images');
        const outputPath = path.join(outputDir, 'splash-icon-ai.png');

        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        const imageBuffer = Buffer.from(imageData, 'base64');
        fs.writeFileSync(outputPath, imageBuffer);

        console.log(`\n✅ Splash icon saved to: ${outputPath}`);

        // Also copy to splash-icon.png
        const splashIconPath = path.join(outputDir, 'splash-icon.png');
        fs.writeFileSync(splashIconPath, imageBuffer);
        console.log(`✅ Also copied to: ${splashIconPath}`);

        return outputPath;
    } catch (error) {
        console.error('❌ Error generating splash icon:', error.message);
        throw error;
    }
}

generateSplashIcon().catch(console.error);
