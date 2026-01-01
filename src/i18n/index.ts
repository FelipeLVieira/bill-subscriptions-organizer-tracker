import { getLocales } from 'expo-localization';
import { I18n } from 'i18n-js';
import ar from './locales/ar';
import ca from './locales/ca';
import zh_CN from './locales/zh-CN';
import zh_TW from './locales/zh-TW';
import hr from './locales/hr';
import cs from './locales/cs';
import da from './locales/da';
import nl from './locales/nl';
import en from './locales/en';
import en_AU from './locales/en-AU';
import en_CA from './locales/en-CA';
import en_GB from './locales/en-GB';
import en_US from './locales/en-US';
import fi from './locales/fi';
import fr from './locales/fr';
import fr_CA from './locales/fr-CA';
import de from './locales/de';
import el from './locales/el';
import he from './locales/he';
import hi from './locales/hi';
import hu from './locales/hu';
import id from './locales/id';
import it from './locales/it';
import ja from './locales/ja';
import ko from './locales/ko';
import ms from './locales/ms';
import no from './locales/no';
import pl from './locales/pl';
import pt_BR from './locales/pt-BR';
import pt_PT from './locales/pt-PT';
import ro from './locales/ro';
import ru from './locales/ru';
import sk from './locales/sk';
import es from './locales/es';
import es_MX from './locales/es-MX';
import es_ES from './locales/es-ES';
import sv from './locales/sv';
import th from './locales/th';
import tr from './locales/tr';
import uk from './locales/uk';
import vi from './locales/vi';

const i18n = new I18n({
    'ar': ar,
    'ca': ca,
    'zh': zh_CN, // Map base 'zh' to Simplified Chinese
    'zh-CN': zh_CN,
    'zh-TW': zh_TW,
    'hr': hr,
    'cs': cs,
    'da': da,
    'nl': nl,
    'en': en,
    'en-AU': en_AU,
    'en-CA': en_CA,
    'en-GB': en_GB,
    'en-US': en_US,
    'fi': fi,
    'fr': fr,
    'fr-CA': fr_CA,
    'de': de,
    'el': el,
    'he': he,
    'hi': hi,
    'hu': hu,
    'id': id,
    'it': it,
    'ja': ja,
    'ko': ko,
    'ms': ms,
    'no': no,
    'pl': pl,
    'pt': pt_BR, // Map base 'pt' to Brazilian Portuguese
    'pt-BR': pt_BR,
    'pt-PT': pt_PT,
    'ro': ro,
    'ru': ru,
    'sk': sk,
    'es': es,
    'es-MX': es_MX,
    'es-ES': es_ES,
    'sv': sv,
    'th': th,
    'tr': tr,
    'uk': uk,
    'vi': vi,
});

i18n.enableFallback = true;
i18n.locale = getLocales()[0].languageCode ?? 'en';

export default i18n;
