#!/usr/bin/env node

/**
 * Screenshot generator using Playwright
 * Generates App Store screenshots for all device sizes and both themes
 *
 * Since this app uses SQLite (native only), we capture screenshots
 * by connecting to the running Expo web server and using web-compatible
 * rendering. For production screenshots, consider using native simulators.
 *
 * Usage:
 *   1. Start the Expo web server: npx expo start --web --port 8082
 *   2. Run this script: node scripts/screenshots/generate_screenshots.js
 *
 * Note: Some features may not work on web (SQLite database).
 * This script captures UI layout/styling which is consistent across platforms.
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const PORT = process.argv[2] || 8082;
const BASE_URL = `http://localhost:${PORT}`;

// Device configurations for App Store
// iOS requires specific screenshot sizes
const devices = [
    // iPhone 6.9" (iPhone 16 Pro Max) - Required for newest devices (1320 x 2868)
    { name: 'iOS 6.9-inch', width: 440, height: 956, scale: 3, dir: 'store_assets/ios/6.9inch' },
    // iPhone 6.7" (iPhone 15 Pro Max, 14 Pro Max) - Required (1290 x 2796)
    { name: 'iOS 6.7-inch', width: 430, height: 932, scale: 3, dir: 'store_assets/ios/6.7inch' },
    // iPhone 6.5" (iPhone 11 Pro Max, XS Max) - Required (1242 x 2688)
    { name: 'iOS 6.5-inch', width: 414, height: 896, scale: 3, dir: 'store_assets/ios/6.5inch' },
    // iPhone 6.1" (iPhone 14, 15, 16) - Required for standard models (1179 x 2556)
    { name: 'iOS 6.1-inch', width: 393, height: 852, scale: 3, dir: 'store_assets/ios/6.1inch' },
    // iPhone 5.5" (iPhone 8 Plus, 7 Plus, 6s Plus) - Required for older devices (1242 x 2208)
    { name: 'iOS 5.5-inch', width: 414, height: 736, scale: 3, dir: 'store_assets/ios/5.5inch' },
    // iPad Pro 12.9" 6th Gen (13-inch display) - Required for iPad (2064 x 2752)
    { name: 'iOS 13-inch iPad', width: 1032, height: 1376, scale: 2, dir: 'store_assets/ios/13inch' },
    // iPad 11" (iPad Air, iPad) - Required for iPad (1668 x 2388)
    { name: 'iOS 11-inch iPad', width: 834, height: 1194, scale: 2, dir: 'store_assets/ios/11inch' },
    // Android Phone
    { name: 'Android Phone', width: 360, height: 640, scale: 3, dir: 'store_assets/android/phone' },
    // Android 7" Tablet
    { name: 'Android 7-inch Tablet', width: 600, height: 960, scale: 2, dir: 'store_assets/android/tablet_7' },
    // Android 10" Tablet
    { name: 'Android 10-inch Tablet', width: 800, height: 1280, scale: 2, dir: 'store_assets/android/tablet_10' },
];

// Screens/tabs to capture
const screens = [
    { name: 'dashboard', path: '/', label: 'Dashboard' },
    { name: 'bills', path: '/search', label: 'My Bills' },
    { name: 'calendar', path: '/calendar', label: 'Calendar' },
    { name: 'history', path: '/history', label: 'History' },
    { name: 'add_bill', path: '/modal', label: 'Add Bill' },
];

// Sample subscription data for seeding screenshots
const sampleSubscriptions = [
    { name: 'Netflix', amount: 15.99, currency: 'USD', interval: 'monthly', category: 'Entertainment' },
    { name: 'Spotify', amount: 9.99, currency: 'USD', interval: 'monthly', category: 'Entertainment' },
    { name: 'iCloud', amount: 2.99, currency: 'USD', interval: 'monthly', category: 'Cloud Storage' },
    { name: 'Adobe Creative', amount: 54.99, currency: 'USD', interval: 'monthly', category: 'Software' },
    { name: 'Gym Membership', amount: 49.99, currency: 'USD', interval: 'monthly', category: 'Health & Fitness' },
];

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function setupPage(context, theme) {
    const page = await context.newPage();

    // Emulate color scheme preference for the browser
    // This makes useColorScheme() hook return the correct value
    await page.emulateMedia({ colorScheme: theme });

    // Set theme preference via localStorage before navigating
    // Using the correct key from ThemeContext.tsx: @app_theme
    await context.addInitScript((data) => {
        // Set theme using the app's storage key
        localStorage.setItem('@app_theme', data.theme);

        // Skip tutorials/copilot (try multiple possible keys)
        localStorage.setItem('copilot-completed', 'true');
        localStorage.setItem('tutorial-completed', 'true');
        localStorage.setItem('@copilot_completed', 'true');

        // Set Pro status to hide ads for cleaner screenshots
        localStorage.setItem('is-pro', 'true');
        localStorage.setItem('@is_pro', 'true');
    }, { theme });

    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    await sleep(2500); // Slightly longer wait for theme to apply

    return page;
}

async function captureScreen(page, screenPath, outputPath, screenName) {
    // Navigate to the screen
    if (screenPath !== '/') {
        await page.goto(`${BASE_URL}${screenPath}`, { waitUntil: 'networkidle' });
        await sleep(1500);
    }

    // Special handling for specific screens
    if (screenName === 'add_bill') {
        // Wait for modal animation
        await sleep(1000);

        // Fill in sample data for a more realistic screenshot
        try {
            const nameInput = await page.$('input[placeholder*="Service"], input[placeholder*="Netflix"]');
            if (nameInput) {
                await nameInput.fill('Netflix');
            }

            const amountInput = await page.$('input[placeholder="0.00"]');
            if (amountInput) {
                await amountInput.fill('15.99');
            }
            await sleep(500);
        } catch (e) {
            console.log('    Could not fill form fields (web limitation)');
        }
    }

    // Take screenshot
    await page.screenshot({ path: outputPath });
    console.log(`    Saved: ${outputPath}`);
}

async function captureDevice(browser, device) {
    console.log(`\n=== Capturing ${device.name} ===`);
    console.log(`Resolution: ${device.width}x${device.height} @ ${device.scale}x scale`);
    console.log(`Output: ${device.width * device.scale}x${device.height * device.scale} pixels`);

    // Ensure directory exists
    const outputDir = path.join(process.cwd(), device.dir);
    fs.mkdirSync(outputDir, { recursive: true });

    const context = await browser.newContext({
        viewport: { width: device.width, height: device.height },
        deviceScaleFactor: device.scale,
    });

    // Capture Light mode
    console.log('  Light mode:');
    let page = await setupPage(context, 'light');

    let i = 1;
    for (const screen of screens) {
        const filename = `${String(i).padStart(2, '0')}_${screen.name}_light.png`;
        const outputPath = path.join(outputDir, filename);
        await captureScreen(page, screen.path, outputPath, screen.name);
        i++;
    }

    await page.close();

    // Capture Dark mode
    console.log('  Dark mode:');
    page = await setupPage(context, 'dark');

    for (const screen of screens) {
        const filename = `${String(i).padStart(2, '0')}_${screen.name}_dark.png`;
        const outputPath = path.join(outputDir, filename);
        await captureScreen(page, screen.path, outputPath, screen.name);
        i++;
    }

    await page.close();
    await context.close();

    console.log(`  Done with ${device.name}! (${i - 1} screenshots)`);
}

async function main() {
    console.log('================================================');
    console.log('Bills Tracker - App Store Screenshot Generator');
    console.log('================================================');
    console.log(`\nUsing base URL: ${BASE_URL}\n`);

    // Check if server is running
    try {
        const response = await fetch(BASE_URL);
        if (!response.ok) throw new Error('Server not responding');
        console.log('Server is running!\n');
    } catch (e) {
        console.error(`\nERROR: Server not responding at ${BASE_URL}`);
        console.error('\nPlease start the Expo web server first:');
        console.error(`  npx expo start --web --port ${PORT}`);
        console.error('\nNote: The web version may have limited functionality');
        console.error('since this app uses SQLite which only works on native.');
        process.exit(1);
    }

    const browser = await chromium.launch({ headless: true });

    for (const device of devices) {
        await captureDevice(browser, device);
    }

    await browser.close();

    console.log('\n================================================');
    console.log('All screenshots generated!');
    console.log('================================================');
    console.log('\nOutput locations:');
    console.log('  iOS screenshots:     store_assets/ios/');
    console.log('  Android screenshots: store_assets/android/');
    console.log('\nFiles per device:');
    console.log(`  - ${screens.length} Light mode screens`);
    console.log(`  - ${screens.length} Dark mode screens`);
    console.log(`  - Total: ${screens.length * 2} screenshots per device`);
    console.log(`  - Grand total: ${devices.length * screens.length * 2} screenshots`);

    // Print App Store requirements reminder
    console.log('\n--- App Store Screenshot Requirements ---');
    console.log('iPhone 6.9": 1320 x 2868 pixels (iPhone 16 Pro Max)');
    console.log('iPhone 6.7": 1290 x 2796 pixels (iPhone 15/14 Pro Max)');
    console.log('iPhone 6.5": 1242 x 2688 pixels (iPhone 11 Pro Max, XS Max)');
    console.log('iPhone 6.1": 1179 x 2556 pixels (iPhone 14/15/16 standard)');
    console.log('iPhone 5.5": 1242 x 2208 pixels (iPhone 8/7/6s Plus)');
    console.log('iPad 13":    2064 x 2752 pixels (iPad Pro 12.9")');
    console.log('iPad 11":    1668 x 2388 pixels (iPad Air, iPad)');
}

main().catch(console.error);
