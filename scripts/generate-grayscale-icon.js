#!/usr/bin/env node

/**
 * Generate minimalist grayscale app icon
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');

const API_KEY = 'AIzaSyCS8rBCCRI0cRSX5a9byHnmp2aI1yPI44Q';
const MODEL = 'gemini-2.0-flash-exp-image-generation';

async function generateIcon() {
    console.log('🎨 Generating minimalist grayscale app icon...\n');

    const genAI = new GoogleGenerativeAI(API_KEY);

    const model = genAI.getGenerativeModel({
        model: MODEL,
        generationConfig: {
            responseModalities: ['TEXT', 'IMAGE'],
        },
    });

    const prompt = `Generate a SIMPLE, MINIMAL app icon for a bills tracking app.

EXACT DESIGN SPECIFICATION:
- Background: Solid flat color #F2F2F7 (light gray) - NO gradients
- Single centered element: A BOLD dollar sign "$" in color #1C1C1E (near black)
- The dollar sign should be:
  - VERY LARGE - fills about 70% of the canvas height
  - THICK stroke weight (bold/heavy font weight)
  - Simple sans-serif style like SF Pro Bold or Helvetica Bold
  - Perfectly centered both horizontally and vertically
  - NO decorations, NO shadows, NO 3D effects
  - Just a clean, flat, bold "$" symbol

CRITICAL:
- Canvas: 1024x1024 pixels square
- NO borders, NO frames, NO circles around the dollar sign
- NO other elements - ONLY the dollar sign on solid background
- Flat design - NO gradients on the symbol
- The simpler the better - like the Apple Calculator or Clock app icons

This should look like a professional Apple-style app icon - extremely minimal and clean.`;

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
                console.log('✅ Icon generated successfully!');
                break;
            }
        }

        if (!imageData) {
            throw new Error('No image data in response');
        }

        const outputDir = path.join(__dirname, '..', 'assets', 'images');
        const outputPath = path.join(outputDir, 'icon.png');

        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        const imageBuffer = Buffer.from(imageData, 'base64');
        fs.writeFileSync(outputPath, imageBuffer);

        console.log(`\n✅ Icon saved to: ${outputPath}`);
        return outputPath;
    } catch (error) {
        console.error('❌ Error generating icon:', error.message);
        throw error;
    }
}

generateIcon().catch(console.error);
