const fs = require("fs");
const path = require("path");
const https = require("https");

const GEMINI_API_KEY = "AIzaSyCS8rBCCRI0cRSX5a9byHnmp2aI1yPI44Q";

async function generateImage(prompt, outputPath) {
  // Use Gemini 2.0 Flash experimental with image generation capability
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`;

  const requestBody = JSON.stringify({
    contents: [{
      parts: [{
        text: `Generate an image: ${prompt}`
      }]
    }],
    generationConfig: {
      responseModalities: ["IMAGE", "TEXT"]
    }
  });

  return new Promise((resolve, reject) => {
    const req = https.request(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(requestBody)
      }
    }, (res) => {
      let data = "";
      res.on("data", chunk => data += chunk);
      res.on("end", () => {
        try {
          const json = JSON.parse(data);

          // Check for image in the response
          if (json.candidates && json.candidates[0] && json.candidates[0].content) {
            const parts = json.candidates[0].content.parts;
            for (const part of parts) {
              if (part.inlineData && part.inlineData.mimeType.startsWith("image/")) {
                const imageData = part.inlineData.data;
                fs.writeFileSync(outputPath, Buffer.from(imageData, "base64"));
                console.log(`Saved: ${outputPath}`);
                resolve(outputPath);
                return;
              }
            }
          }

          if (json.error) {
            reject(new Error(json.error.message || JSON.stringify(json.error)));
          } else {
            reject(new Error("No image data in response: " + JSON.stringify(json).substring(0, 500)));
          }
        } catch (e) {
          reject(new Error("Failed to parse response: " + e.message + " - " + data.substring(0, 500)));
        }
      });
    });

    req.on("error", reject);
    req.write(requestBody);
    req.end();
  });
}

async function main() {
  const outputDir = path.join(__dirname, "..", "assets", "images");

  // Ensure output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Nano Banana Pro Style - Apple Big Sur / macOS Icon aesthetic
  // 3D, depth, soft shadows, slight realism mixed with abstraction

  const iconPrompt = `Create a high-quality app icon for a bill and subscription tracker app. Style: Apple macOS Big Sur / iOS app icon aesthetic.

Requirements:
- 3D floating wallet or bill folder design with depth and soft shadows
- Include a subtle dollar sign ($) on the wallet
- Add small circular arrows suggesting recurring payments
- Background: Deep vibrant blue gradient (#2563EB to #1E40AF)
- Rounded square format (iOS app icon shape with rounded corners)
- 3D effect with subtle highlights and shadows
- Clean, modern, professional look
- No text, just iconography
- High quality render, 1024x1024 pixels
- The icon element should FILL the icon area (not be tiny in the center)`;

  const splashIconPrompt = `Create a splash screen icon for a bill subscription tracker mobile app. Style: Apple macOS Big Sur aesthetic.

Requirements:
- Same wallet/bill design as the app icon
- 3D floating wallet with dollar sign
- Small circular arrows for recurring payments
- White/cream colored icon element
- NO background (transparent background or solid color placeholder)
- The icon should be a single floating 3D element
- Clean, centered design
- 512x512 pixels
- Professional, polished look`;

  const adaptiveIconPrompt = `Create an Android adaptive icon foreground for a bill subscription tracker. Style: Apple macOS Big Sur 3D aesthetic.

Requirements:
- 3D wallet or bill folder design
- Dollar sign on the wallet
- Small circular arrows for recurring payments
- WHITE colored icon with subtle gray shadows for depth
- TRANSPARENT background (icon element only, NO background)
- Centered design with some padding from edges
- The icon should look good on any background color
- Clean vector-style but with 3D depth
- 1024x1024 pixels with icon centered`;

  const faviconPrompt = `Create a small favicon icon for a bill tracker app:
- Simple wallet or dollar sign icon
- Clean, minimal design visible at small sizes
- Blue gradient background (#2563EB to #1E40AF)
- 3D style with subtle shadows
- 48x48 style icon
- No text, just recognizable symbol`;

  const splashBackgroundPrompt = `Create a splash screen for a mobile app:
- Beautiful smooth blue gradient background
- Gradient from #2563EB (top-left) to #1E40AF (bottom-right)
- Solid color, no patterns or icons
- Clean, professional look
- 2732x2732 pixels (square format for splash screen)`;

  try {
    console.log("=".repeat(50));
    console.log("Generating App Icons with Nano Banana Pro Quality");
    console.log("=".repeat(50));

    console.log("\n1. Generating main app icon (1024x1024)...");
    await generateImage(iconPrompt, path.join(outputDir, "icon.png"));

    console.log("\n2. Generating splash icon (512x512)...");
    await generateImage(splashIconPrompt, path.join(outputDir, "splash-icon.png"));

    console.log("\n3. Generating adaptive icon (1024x1024)...");
    await generateImage(adaptiveIconPrompt, path.join(outputDir, "adaptive-icon.png"));

    console.log("\n4. Generating favicon (48x48)...");
    await generateImage(faviconPrompt, path.join(outputDir, "favicon.png"));

    console.log("\n5. Generating splash background (2732x2732)...");
    await generateImage(splashBackgroundPrompt, path.join(outputDir, "splash.png"));

    console.log("\n" + "=".repeat(50));
    console.log("All icons generated successfully!");
    console.log("=".repeat(50));
    console.log("\nGenerated files:");
    console.log("  - icon.png (1024x1024) - Main app icon");
    console.log("  - splash-icon.png (512x512) - Splash screen icon element");
    console.log("  - adaptive-icon.png (1024x1024) - Android adaptive icon");
    console.log("  - favicon.png (48x48) - Web favicon");
    console.log("  - splash.png (2732x2732) - Splash screen background");
    console.log("\nNext steps:");
    console.log("1. Run: npx expo prebuild --clean");
    console.log("2. Clear Expo cache: npx expo start --clear");
    console.log("3. Rebuild the app");
  } catch (error) {
    console.error("\nFailed to generate assets:", error.message);
    process.exit(1);
  }
}

main();
