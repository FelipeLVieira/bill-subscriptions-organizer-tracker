#!/usr/bin/env node

/**
 * Generate clean, modern app icons and splash screens
 * Run with: node scripts/generate-icons.js
 */

const fs = require('fs');
const path = require('path');

// Icon dimensions
const ICON_SIZE = 1024;
const SPLASH_WIDTH = 1284;
const SPLASH_HEIGHT = 2778;

// Modern 2025/2026 color palette - clean, flat, no gradients
const COLORS = {
    primary: '#3B82F6',       // Clean blue
    background: '#FFFFFF',    // White background
    accent: '#10B981',        // Emerald green for checkmark/success
    secondary: '#1E40AF',     // Darker blue for depth
    text: '#1F2937',          // Dark gray
};

// Generate main app icon SVG - clean, flat design
function generateIconSVG() {
    const size = ICON_SIZE;
    const center = size / 2;

    // Modern flat design: rounded square with wallet/calendar hybrid icon
    return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <!-- Background - solid color, no gradients -->
  <rect width="${size}" height="${size}" rx="224" fill="${COLORS.primary}"/>

  <!-- Wallet body - simplified flat design -->
  <rect x="200" y="320" width="624" height="420" rx="40" fill="${COLORS.background}"/>

  <!-- Wallet flap -->
  <path d="M200 400 L200 360 Q200 320 240 320 L764 320 Q824 320 824 380 L824 400 Q824 440 764 440 L280 440 Q200 440 200 400 Z" fill="${COLORS.background}"/>

  <!-- Wallet clasp circle -->
  <circle cx="780" cy="400" r="50" fill="${COLORS.primary}"/>
  <circle cx="780" cy="400" r="30" fill="${COLORS.background}"/>

  <!-- Calendar/bill icon inside wallet -->
  <rect x="300" y="480" width="200" height="200" rx="20" fill="${COLORS.primary}" opacity="0.15"/>
  <rect x="300" y="480" width="200" height="50" rx="20" fill="${COLORS.primary}"/>

  <!-- Calendar dots -->
  <circle cx="340" cy="570" r="15" fill="${COLORS.primary}"/>
  <circle cx="400" cy="570" r="15" fill="${COLORS.primary}"/>
  <circle cx="460" cy="570" r="15" fill="${COLORS.primary}"/>
  <circle cx="340" cy="630" r="15" fill="${COLORS.primary}"/>
  <circle cx="400" cy="630" r="15" fill="${COLORS.accent}"/>
  <circle cx="460" cy="630" r="15" fill="${COLORS.primary}"/>

  <!-- Dollar sign on right side -->
  <text x="620" y="600" font-family="SF Pro Display, -apple-system, system-ui, sans-serif" font-size="180" font-weight="700" fill="${COLORS.primary}" text-anchor="middle">$</text>
</svg>`;
}

// Generate simplified icon for small sizes - improved design with $ and checkmark
function generateSimpleIconSVG() {
    const size = ICON_SIZE;

    return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <!-- Background - solid blue -->
  <rect width="${size}" height="${size}" rx="224" fill="${COLORS.primary}"/>

  <!-- Main wallet card shape -->
  <rect x="180" y="280" width="664" height="464" rx="56" fill="${COLORS.background}"/>

  <!-- Wallet top flap -->
  <path d="M180 360 L180 336 Q180 280 236 280 L788 280 Q844 280 844 336 L844 360 Q844 416 788 416 L280 416 Q180 416 180 360 Z" fill="${COLORS.background}"/>

  <!-- Wallet clasp/closure circle -->
  <circle cx="800" cy="360" r="52" fill="${COLORS.primary}"/>
  <circle cx="800" cy="360" r="28" fill="${COLORS.background}"/>

  <!-- Dollar sign - prominent financial indicator -->
  <circle cx="380" cy="560" r="100" fill="${COLORS.primary}" opacity="0.12"/>
  <text x="380" y="600" font-family="SF Pro Display, -apple-system, Helvetica" font-size="140" font-weight="700" fill="${COLORS.primary}" text-anchor="middle">$</text>

  <!-- Checkmark badge - success/paid indicator -->
  <circle cx="620" cy="580" r="80" fill="${COLORS.accent}"/>
  <path d="M580 580 L605 610 L660 545" stroke="${COLORS.background}" stroke-width="20" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
</svg>`;
}

// Generate adaptive icon foreground (Android) - with wallet card visible
function generateAdaptiveIconSVG() {
    const size = ICON_SIZE;

    return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <!-- Main wallet card - centered in safe zone with shadow -->
  <rect x="200" y="300" width="624" height="440" rx="52" fill="${COLORS.background}" filter="url(#shadow)"/>

  <!-- Shadow filter -->
  <defs>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="4" stdDeviation="8" flood-opacity="0.15"/>
    </filter>
  </defs>

  <!-- Wallet top flap -->
  <path d="M200 380 L200 352 Q200 300 252 300 L772 300 Q824 300 824 352 L824 380 Q824 432 772 432 L280 432 Q200 432 200 380 Z" fill="${COLORS.background}"/>

  <!-- Wallet clasp -->
  <circle cx="780" cy="380" r="44" fill="${COLORS.primary}"/>
  <circle cx="780" cy="380" r="24" fill="${COLORS.background}"/>

  <!-- Dollar sign background -->
  <circle cx="380" cy="540" r="88" fill="${COLORS.primary}" opacity="0.12"/>
  <text x="380" y="576" font-family="SF Pro Display, -apple-system, Helvetica" font-size="120" font-weight="700" fill="${COLORS.primary}" text-anchor="middle">$</text>

  <!-- Check badge -->
  <circle cx="600" cy="555" r="70" fill="${COLORS.accent}"/>
  <path d="M565 555 L587 580 L635 522" stroke="${COLORS.background}" stroke-width="18" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
</svg>`;
}

// Generate splash icon SVG - with wallet card visible (matches main icon)
function generateSplashIconSVG() {
    const size = 512;

    return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <!-- Shadow filter -->
  <defs>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="2" stdDeviation="4" flood-opacity="0.15"/>
    </filter>
  </defs>

  <!-- Main wallet card -->
  <rect x="56" y="130" width="400" height="280" rx="36" fill="${COLORS.background}" filter="url(#shadow)"/>

  <!-- Wallet top flap -->
  <path d="M56 190 L56 166 Q56 130 92 130 L420 130 Q456 130 456 166 L456 190 Q456 226 420 226 L116 226 Q56 226 56 190 Z" fill="${COLORS.background}"/>

  <!-- Wallet clasp -->
  <circle cx="424" cy="185" r="30" fill="${COLORS.primary}"/>
  <circle cx="424" cy="185" r="16" fill="${COLORS.background}"/>

  <!-- Dollar sign background -->
  <circle cx="180" cy="305" r="60" fill="${COLORS.primary}" opacity="0.12"/>
  <text x="180" y="332" font-family="SF Pro Display, -apple-system, Helvetica" font-size="82" font-weight="700" fill="${COLORS.primary}" text-anchor="middle">$</text>

  <!-- Check badge -->
  <circle cx="332" cy="315" r="50" fill="${COLORS.accent}"/>
  <path d="M305 315 L322 335 L360 288" stroke="${COLORS.background}" stroke-width="14" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
</svg>`;
}

// Generate monochrome icon for Android
function generateMonochromeIconSVG() {
    const size = ICON_SIZE;

    return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <!-- Monochrome wallet shape -->
  <rect x="280" y="380" width="464" height="300" rx="36" fill="#FFFFFF"/>
  <rect x="280" y="360" width="464" height="80" rx="36" fill="#FFFFFF"/>
  <circle cx="704" cy="410" r="36" fill="#000000"/>
  <circle cx="704" cy="410" r="20" fill="#FFFFFF"/>

  <!-- Check badge -->
  <circle cx="620" cy="540" r="48" fill="#FFFFFF"/>
  <path d="M595 540 L610 555 L645 515" stroke="#000000" stroke-width="12" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
</svg>`;
}

// Save SVG files
function saveFile(filename, content) {
    const filepath = path.join(__dirname, '..', 'assets', 'images', filename);
    fs.writeFileSync(filepath, content);
    console.log(`Created: ${filepath}`);
}

// Main execution
console.log('Generating clean, modern app icons...\n');

// Generate all icon variants
saveFile('icon-new.svg', generateSimpleIconSVG());
saveFile('adaptive-icon-new.svg', generateAdaptiveIconSVG());
saveFile('splash-icon-new.svg', generateSplashIconSVG());
saveFile('monochrome-icon-new.svg', generateMonochromeIconSVG());

console.log('\nSVG files generated!');
console.log('\nTo convert to PNG, you can use:');
console.log('1. Online tool: https://svgtopng.com');
console.log('2. Inkscape: inkscape -w 1024 -h 1024 icon-new.svg -o icon.png');
console.log('3. ImageMagick: convert -background none icon-new.svg icon.png');
console.log('4. sharp npm package (install with: npm install sharp)');

console.log('\nOr run the PNG conversion script below after installing sharp.');
