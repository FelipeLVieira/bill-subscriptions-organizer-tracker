#!/usr/bin/env node
/**
 * Translation Checker Script
 *
 * This script checks all locale files against the English (en.ts) base file
 * and reports missing translations for each language.
 *
 * Usage: node scripts/check-translations.js
 */

const fs = require('fs');
const path = require('path');

const LOCALES_DIR = path.join(__dirname, '..', 'src', 'i18n', 'locales');

// Get all translation keys from a file content
function extractKeys(content) {
    const keys = [];
    // Match patterns like: key: "value" or key: 'value'
    const regex = /^\s*(\w+):\s*["'`]/gm;
    let match;
    while ((match = regex.exec(content)) !== null) {
        keys.push(match[1]);
    }
    return keys;
}

// Read and parse a locale file
function readLocaleFile(filename) {
    const filepath = path.join(LOCALES_DIR, filename);
    if (!fs.existsSync(filepath)) {
        return null;
    }
    const content = fs.readFileSync(filepath, 'utf-8');
    return extractKeys(content);
}

// Main function
function main() {
    console.log('🔍 Translation Checker\n');
    console.log('='.repeat(60) + '\n');

    // Read base English file
    const enKeys = readLocaleFile('en.ts');
    if (!enKeys) {
        console.error('❌ Could not read en.ts base file');
        process.exit(1);
    }
    console.log(`📖 Base file (en.ts) has ${enKeys.length} keys\n`);

    // Get all locale files
    const files = fs.readdirSync(LOCALES_DIR).filter(f => f.endsWith('.ts') && f !== 'en.ts');

    const results = [];
    let totalMissing = 0;

    files.forEach(file => {
        const keys = readLocaleFile(file);
        if (!keys) {
            console.log(`⚠️  Could not read ${file}`);
            return;
        }

        const missing = enKeys.filter(k => !keys.includes(k));
        const extra = keys.filter(k => !enKeys.includes(k));

        if (missing.length > 0 || extra.length > 0) {
            results.push({
                file,
                keyCount: keys.length,
                missing,
                extra
            });
            totalMissing += missing.length;
        }
    });

    // Sort by number of missing keys (worst first)
    results.sort((a, b) => b.missing.length - a.missing.length);

    // Print results
    if (results.length === 0) {
        console.log('✅ All translations are complete!\n');
    } else {
        console.log(`Found issues in ${results.length} files:\n`);

        results.forEach(({ file, keyCount, missing, extra }) => {
            const status = missing.length > 10 ? '🔴' : missing.length > 0 ? '🟡' : '🟢';
            console.log(`${status} ${file} (${keyCount}/${enKeys.length} keys)`);

            if (missing.length > 0) {
                console.log(`   Missing ${missing.length} keys:`);
                missing.forEach(k => console.log(`     - ${k}`));
            }

            if (extra.length > 0) {
                console.log(`   Extra ${extra.length} keys (not in en.ts):`);
                extra.slice(0, 5).forEach(k => console.log(`     + ${k}`));
                if (extra.length > 5) {
                    console.log(`     ... and ${extra.length - 5} more`);
                }
            }
            console.log('');
        });

        console.log('='.repeat(60));
        console.log(`\n📊 Summary:`);
        console.log(`   - Total languages checked: ${files.length}`);
        console.log(`   - Languages with issues: ${results.length}`);
        console.log(`   - Total missing translations: ${totalMissing}`);
        console.log(`   - Base keys count: ${enKeys.length}\n`);

        // Print unique missing keys across all files
        const allMissingKeys = [...new Set(results.flatMap(r => r.missing))];
        if (allMissingKeys.length > 0) {
            console.log('🔑 Keys that need translation (across all files):');
            allMissingKeys.forEach(k => console.log(`   - ${k}`));
        }
    }

    // Exit with error if there are missing translations
    process.exit(totalMissing > 0 ? 1 : 0);
}

main();
