#!/usr/bin/env node

/**
 * Generate professional app icon using Nano Banana Pro (Gemini) API
 * Usage: NANO_BANANA_API_KEY=your_key node scripts/generate-ai-icon.js
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');

// API Configuration
const API_KEY = process.env.NANO_BANANA_API_KEY || 'AIzaSyCS8rBCCRI0cRSX5a9byHnmp2aI1yPI44Q';
const MODEL = 'gemini-2.0-flash-exp'; // Use gemini with image generation

async function generateIcon() {
    console.log('🎨 Generating professional app icon using Gemini...\n');

    const genAI = new GoogleGenerativeAI(API_KEY);

    // Use gemini-2.0-flash-exp which supports image generation
    const model = genAI.getGenerativeModel({
        model: MODEL,
        generationConfig: {
            responseModalities: ['TEXT', 'IMAGE'],
        },
    });

    const prompt = `Generate a professional, modern app icon for a "Bills Tracker" finance app.

DESIGN REQUIREMENTS:
- Style: Apple iOS App Icon style, clean and modern
- Main Element: A stylized wallet or bill/receipt icon
- Color Scheme: Primary blue (#3B82F6) with white accent elements
- Background: Solid blue (#3B82F6) with subtle gradient to darker blue (#2563EB)
- Add a small checkmark or dollar sign as a secondary element
- The icon should look professional and trustworthy (finance app)
- Design should be simple and recognizable at small sizes
- No text, just the icon graphic
- Rounded corners (iOS style, about 22% corner radius)

OUTPUT:
- Single square image, 1024x1024 pixels
- Clean, vector-like appearance
- Suitable for app store listing

Generate this as a polished, professional app icon.`;

    try {
        console.log('📡 Sending request to Gemini API...');
        const result = await model.generateContent({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
        });

        const response = await result.response;

        // Extract image from response
        const parts = response.candidates?.[0]?.content?.parts || [];
        let imageData = null;

        for (const part of parts) {
            if (part.inlineData?.mimeType?.startsWith('image/')) {
                imageData = part.inlineData.data;
                console.log('✅ Image generated successfully!');
                break;
            }
        }

        if (!imageData) {
            // Check if there's text response with explanation
            const text = response.text();
            console.log('Response text:', text);
            throw new Error('No image data in response');
        }

        // Save the image
        const outputDir = path.join(__dirname, '..', 'assets', 'images');
        const outputPath = path.join(outputDir, 'icon-ai-generated.png');

        // Ensure directory exists
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        // Write base64 image to file
        const imageBuffer = Buffer.from(imageData, 'base64');
        fs.writeFileSync(outputPath, imageBuffer);

        console.log(`\n✅ Icon saved to: ${outputPath}`);
        console.log('\nNext steps:');
        console.log('1. Review the generated icon');
        console.log('2. If satisfied, copy to assets/images/icon.png');
        console.log('3. Run: npx expo prebuild --clean');

        return outputPath;
    } catch (error) {
        console.error('❌ Error generating icon:', error.message);
        if (error.message.includes('SAFETY')) {
            console.log('\n⚠️  The model blocked the request. Try adjusting the prompt.');
        }
        throw error;
    }
}

// Run the generation
generateIcon().catch(console.error);
