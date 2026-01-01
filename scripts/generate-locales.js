const fs = require('fs');
const path = require('path');

// List of App Store supported languages with metadata
const languages = [
    { code: 'ar', label: 'Arabic', flag: '🇸🇦' },
    { code: 'ca', label: 'Catalan', flag: '🇪🇸' },
    { code: 'zh', label: 'Chinese (Simplified)', flag: '🇨🇳' }, // mapped to zh in file usually, or zh-CN
    { code: 'zh-CN', label: 'Chinese (Simplified)', flag: '🇨🇳' },
    { code: 'zh-TW', label: 'Chinese (Traditional)', flag: '🇹🇼' },
    { code: 'hr', label: 'Croatian', flag: '🇭🇷' },
    { code: 'cs', label: 'Czech', flag: '🇨🇿' },
    { code: 'da', label: 'Danish', flag: '🇩🇰' },
    { code: 'nl', label: 'Dutch', flag: '🇳🇱' },
    { code: 'en', label: 'English', flag: '🇺🇸' },
    { code: 'en-AU', label: 'English (Australia)', flag: '🇦🇺' },
    { code: 'en-CA', label: 'English (Canada)', flag: '🇨🇦' },
    { code: 'en-GB', label: 'English (UK)', flag: '🇬🇧' },
    { code: 'en-US', label: 'English (US)', flag: '🇺🇸' },
    { code: 'fi', label: 'Finnish', flag: '🇫🇮' },
    { code: 'fr', label: 'French', flag: '🇫🇷' },
    { code: 'fr-CA', label: 'French (Canada)', flag: '🇨🇦' },
    { code: 'de', label: 'German', flag: '🇩🇪' },
    { code: 'el', label: 'Greek', flag: '🇬🇷' },
    { code: 'he', label: 'Hebrew', flag: '🇮🇱' },
    { code: 'hi', label: 'Hindi', flag: '🇮🇳' },
    { code: 'hu', label: 'Hungarian', flag: '🇭🇺' },
    { code: 'id', label: 'Indonesian', flag: '🇮🇩' },
    { code: 'it', label: 'Italian', flag: '🇮🇹' },
    { code: 'ja', label: 'Japanese', flag: '🇯🇵' },
    { code: 'ko', label: 'Korean', flag: '🇰🇷' },
    { code: 'ms', label: 'Malay', flag: '🇲🇾' },
    { code: 'no', label: 'Norwegian', flag: '🇳🇴' },
    { code: 'pl', label: 'Polish', flag: '🇵🇱' },
    { code: 'pt', label: 'Portuguese (Brazil)', flag: '🇧🇷' }, // core pt usually maps to pt-BR in ecosystem
    { code: 'pt-BR', label: 'Portuguese (Brazil)', flag: '🇧🇷' },
    { code: 'pt-PT', label: 'Portuguese (Portugal)', flag: '🇵🇹' },
    { code: 'ro', label: 'Romanian', flag: '🇷🇴' },
    { code: 'ru', label: 'Russian', flag: '🇷🇺' },
    { code: 'sk', label: 'Slovak', flag: '🇸🇰' },
    { code: 'es', label: 'Spanish (Latin America)', flag: '🇲🇽' }, // generic es usually MX or ES depending on preference, sticking to existing
    { code: 'es-MX', label: 'Spanish (Mexico)', flag: '🇲🇽' },
    { code: 'es-ES', label: 'Spanish (Spain)', flag: '🇪🇸' },
    { code: 'sv', label: 'Swedish', flag: '🇸🇪' },
    { code: 'th', label: 'Thai', flag: '🇹🇭' },
    { code: 'tr', label: 'Turkish', flag: '🇹🇷' },
    { code: 'uk', label: 'Ukrainian', flag: '🇺🇦' },
    { code: 'vi', label: 'Vietnamese', flag: '🇻🇳' },
];

const ROOT_DIR = path.resolve(__dirname, '..');
const LOCALES_DIR = path.join(ROOT_DIR, 'src/i18n/locales');
const CONSTANTS_FILE = path.join(ROOT_DIR, 'src/constants/Languages.ts');
const I18N_INDEX_FILE = path.join(ROOT_DIR, 'src/i18n/index.ts');

// 1. Read 'en' source content
// We act dumb and just read the file as string to copy it, assuming it's export default { ... };
const enPath = path.join(LOCALES_DIR, 'en.ts');
if (!fs.existsSync(enPath)) {
    console.error('Error: src/i18n/locales/en.ts not found!');
    process.exit(1);
}
const enContent = fs.readFileSync(enPath, 'utf8');

// 2. Generate missing locale files
languages.forEach(lang => {
    // We treat 'en-US' as 'en-US.ts'
    // Normalize filename: 'pt-BR' -> 'pt_BR.ts' or just 'pt-BR.ts'? 
    // Usually standard is 'pt-BR.ts' works if we import it correctly. 
    // However, JS variables can't have hyphens. So we import as `pt_BR` from `./pt-BR`.

    // Actually, let's keep filenames with hyphens `pt-BR.ts` but imports will need handling.

    const targetFile = path.join(LOCALES_DIR, `${lang.code}.ts`);
    if (!fs.existsSync(targetFile)) {
        console.log(`Creating ${lang.code}.ts...`);
        fs.writeFileSync(targetFile, enContent);
    } else {
        console.log(`Skipping ${lang.code}.ts (already exists)`);
    }
});

// 3. Generate src/i18n/index.ts
// Imports need to be safe identifiers. 
// en-US -> en_US
const generateI18nIndex = () => {
    const imports = languages.map(lang => {
        const safeName = lang.code.replace(/-/g, '_');
        return `import ${safeName} from './locales/${lang.code}';`;
    }).join('\n');

    const i18nConfig = languages.map(lang => {
        const safeName = lang.code.replace(/-/g, '_');
        return `    '${lang.code}': ${safeName},`;
    }).join('\n');

    const content = `import { getLocales } from 'expo-localization';
import { I18n } from 'i18n-js';
${imports}

const i18n = new I18n({
${i18nConfig}
});

i18n.enableFallback = true;
i18n.locale = getLocales()[0].languageCode ?? 'en';

export default i18n;
`;

    fs.writeFileSync(I18N_INDEX_FILE, content);
    console.log('Updated src/i18n/index.ts');
};

// 4. Generate src/constants/Languages.ts
const generateConstants = () => {
    // Filter duplicates if any (we have en and en-US, do we want to show both in picker? user asked for all app store languages, so yes)
    const content = `export const SUPPORTED_LANGUAGES = ${JSON.stringify(languages, null, 2)};
`;
    fs.writeFileSync(CONSTANTS_FILE, content);
    console.log('Updated src/constants/Languages.ts');
};

generateI18nIndex();
generateConstants();
