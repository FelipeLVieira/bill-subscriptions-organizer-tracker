// Mapping of famous company names to SF Symbols icons
// This provides a rich UI/UX by showing recognizable icons for common subscriptions

export interface CompanyIcon {
    icon: string;
    color: string;
}

// Map company names (lowercase) to their icons
export const COMPANY_ICONS: Record<string, CompanyIcon> = {
    // Streaming Services
    netflix: { icon: 'play.tv.fill', color: '#E50914' },
    'disney+': { icon: 'sparkles.tv.fill', color: '#113CCF' },
    'disney plus': { icon: 'sparkles.tv.fill', color: '#113CCF' },
    hulu: { icon: 'play.rectangle.fill', color: '#1CE783' },
    'hbo max': { icon: 'play.tv.fill', color: '#5822B4' },
    hbo: { icon: 'play.tv.fill', color: '#5822B4' },
    'amazon prime': { icon: 'shippingbox.fill', color: '#FF9900' },
    'prime video': { icon: 'play.tv.fill', color: '#00A8E1' },
    'apple tv': { icon: 'appletv.fill', color: '#000000' },
    'apple tv+': { icon: 'appletv.fill', color: '#000000' },
    paramount: { icon: 'play.tv.fill', color: '#0064FF' },
    'paramount+': { icon: 'play.tv.fill', color: '#0064FF' },
    peacock: { icon: 'play.tv.fill', color: '#000000' },
    crunchyroll: { icon: 'play.rectangle.fill', color: '#F47521' },
    youtube: { icon: 'play.rectangle.fill', color: '#FF0000' },
    'youtube premium': { icon: 'play.rectangle.fill', color: '#FF0000' },
    'youtube music': { icon: 'music.note', color: '#FF0000' },

    // Music Services
    spotify: { icon: 'music.note', color: '#1DB954' },
    'apple music': { icon: 'music.note', color: '#FA243C' },
    tidal: { icon: 'music.note', color: '#000000' },
    deezer: { icon: 'music.note', color: '#FF0092' },
    pandora: { icon: 'music.note', color: '#224099' },
    soundcloud: { icon: 'music.note', color: '#FF5500' },
    'amazon music': { icon: 'music.note', color: '#00A8E1' },

    // Cloud Storage
    icloud: { icon: 'icloud.fill', color: '#3693F3' },
    'icloud+': { icon: 'icloud.fill', color: '#3693F3' },
    dropbox: { icon: 'externaldrive.fill.badge.icloud', color: '#0061FF' },
    'google drive': { icon: 'folder.fill', color: '#4285F4' },
    'google one': { icon: 'g.circle.fill', color: '#4285F4' },
    onedrive: { icon: 'cloud.fill', color: '#0078D4' },

    // Software & Tools
    adobe: { icon: 'paintbrush.fill', color: '#FF0000' },
    'adobe creative cloud': { icon: 'paintbrush.fill', color: '#FF0000' },
    photoshop: { icon: 'paintbrush.fill', color: '#31A8FF' },
    figma: { icon: 'pencil.and.ruler.fill', color: '#F24E1E' },
    notion: { icon: 'doc.text.fill', color: '#000000' },
    slack: { icon: 'bubble.left.and.bubble.right.fill', color: '#4A154B' },
    zoom: { icon: 'video.fill', color: '#2D8CFF' },
    microsoft: { icon: 'square.grid.2x2.fill', color: '#00A4EF' },
    'microsoft 365': { icon: 'square.grid.2x2.fill', color: '#D83B01' },
    office: { icon: 'doc.fill', color: '#D83B01' },
    'office 365': { icon: 'doc.fill', color: '#D83B01' },

    // Gaming
    'xbox game pass': { icon: 'gamecontroller.fill', color: '#107C10' },
    xbox: { icon: 'gamecontroller.fill', color: '#107C10' },
    playstation: { icon: 'gamecontroller.fill', color: '#003791' },
    'ps plus': { icon: 'gamecontroller.fill', color: '#003791' },
    'playstation plus': { icon: 'gamecontroller.fill', color: '#003791' },
    'nintendo switch online': { icon: 'gamecontroller.fill', color: '#E60012' },
    nintendo: { icon: 'gamecontroller.fill', color: '#E60012' },
    steam: { icon: 'gamecontroller.fill', color: '#1B2838' },
    'ea play': { icon: 'gamecontroller.fill', color: '#000000' },
    'ubisoft+': { icon: 'gamecontroller.fill', color: '#000000' },

    // Fitness & Health
    gym: { icon: 'figure.run', color: '#FF3B30' },
    'planet fitness': { icon: 'figure.run', color: '#4D148C' },
    'la fitness': { icon: 'figure.run', color: '#FF6B00' },
    peloton: { icon: 'bicycle', color: '#DF1D3D' },
    'apple fitness': { icon: 'figure.run', color: '#A2D36B' },
    'apple fitness+': { icon: 'figure.run', color: '#A2D36B' },
    strava: { icon: 'figure.run', color: '#FC4C02' },
    headspace: { icon: 'brain.head.profile', color: '#F47D31' },
    calm: { icon: 'leaf.fill', color: '#6B9EE5' },

    // Food & Delivery
    'uber eats': { icon: 'takeoutbag.and.cup.and.straw.fill', color: '#06C167' },
    doordash: { icon: 'bag.fill', color: '#FF3008' },
    grubhub: { icon: 'takeoutbag.and.cup.and.straw.fill', color: '#F63440' },
    instacart: { icon: 'cart.fill', color: '#43B02A' },
    'hello fresh': { icon: 'leaf.fill', color: '#99CC00' },
    hellofresh: { icon: 'leaf.fill', color: '#99CC00' },

    // Utilities
    electricity: { icon: 'bolt.fill', color: '#FFD60A' },
    electric: { icon: 'bolt.fill', color: '#FFD60A' },
    power: { icon: 'bolt.fill', color: '#FFD60A' },
    water: { icon: 'drop.fill', color: '#007AFF' },
    gas: { icon: 'flame.fill', color: '#FF9500' },
    internet: { icon: 'wifi', color: '#007AFF' },
    wifi: { icon: 'wifi', color: '#007AFF' },
    phone: { icon: 'phone.fill', color: '#34C759' },
    mobile: { icon: 'iphone', color: '#34C759' },

    // Insurance
    insurance: { icon: 'shield.fill', color: '#007AFF' },
    'car insurance': { icon: 'car.fill', color: '#007AFF' },
    'health insurance': { icon: 'heart.fill', color: '#FF3B30' },
    'life insurance': { icon: 'person.fill', color: '#5856D6' },
    'home insurance': { icon: 'house.fill', color: '#FF9500' },

    // Housing
    rent: { icon: 'house.fill', color: '#8E8E93' },
    mortgage: { icon: 'house.fill', color: '#007AFF' },
    hoa: { icon: 'building.2.fill', color: '#5856D6' },

    // Transportation
    uber: { icon: 'car.fill', color: '#000000' },
    lyft: { icon: 'car.fill', color: '#FF00BF' },
    'car payment': { icon: 'car.fill', color: '#007AFF' },
    parking: { icon: 'p.circle.fill', color: '#007AFF' },

    // News & Reading
    'new york times': { icon: 'newspaper.fill', color: '#000000' },
    nyt: { icon: 'newspaper.fill', color: '#000000' },
    'washington post': { icon: 'newspaper.fill', color: '#000000' },
    'wall street journal': { icon: 'newspaper.fill', color: '#000000' },
    wsj: { icon: 'newspaper.fill', color: '#000000' },
    medium: { icon: 'book.fill', color: '#000000' },
    kindle: { icon: 'book.fill', color: '#FF9900' },
    'kindle unlimited': { icon: 'books.vertical.fill', color: '#FF9900' },
    audible: { icon: 'headphones', color: '#F7991C' },

    // VPN & Security
    vpn: { icon: 'lock.shield.fill', color: '#007AFF' },
    nordvpn: { icon: 'lock.shield.fill', color: '#4687FF' },
    expressvpn: { icon: 'lock.shield.fill', color: '#DA3940' },
    '1password': { icon: 'key.fill', color: '#0094F5' },
    lastpass: { icon: 'key.fill', color: '#D32D27' },
    dashlane: { icon: 'key.fill', color: '#0E353D' },

    // Education
    coursera: { icon: 'graduationcap.fill', color: '#0056D2' },
    udemy: { icon: 'graduationcap.fill', color: '#A435F0' },
    skillshare: { icon: 'graduationcap.fill', color: '#00FF84' },
    masterclass: { icon: 'graduationcap.fill', color: '#000000' },
    duolingo: { icon: 'character.book.closed.fill', color: '#58CC02' },
    'linkedin learning': { icon: 'graduationcap.fill', color: '#0A66C2' },

    // Dating
    tinder: { icon: 'flame.fill', color: '#FE3C72' },
    bumble: { icon: 'heart.fill', color: '#FFC629' },
    hinge: { icon: 'heart.fill', color: '#784E3D' },
    match: { icon: 'heart.fill', color: '#FF6B6B' },

    // Social
    linkedin: { icon: 'person.2.fill', color: '#0A66C2' },
    'linkedin premium': { icon: 'person.2.fill', color: '#B8860B' },
    twitter: { icon: 'at', color: '#1DA1F2' },
    'x premium': { icon: 'xmark.circle.fill', color: '#000000' },

    // AI & Tech
    chatgpt: { icon: 'brain', color: '#10A37F' },
    'chatgpt plus': { icon: 'brain', color: '#10A37F' },
    openai: { icon: 'brain', color: '#10A37F' },
    claude: { icon: 'sparkles', color: '#CC785C' },
    github: { icon: 'chevron.left.forwardslash.chevron.right', color: '#24292F' },
    'github copilot': { icon: 'sparkles', color: '#24292F' },

    // Default categories
    entertainment: { icon: 'tv.fill', color: '#AF52DE' },
    software: { icon: 'app.fill', color: '#007AFF' },
    utilities: { icon: 'bolt.fill', color: '#FFD60A' },
    housing: { icon: 'house.fill', color: '#FF9500' },
    'personal care': { icon: 'heart.fill', color: '#FF2D55' },
    other: { icon: 'ellipsis.circle.fill', color: '#8E8E93' },
};

// Get icon for a company/subscription name
export function getCompanyIcon(name: string): CompanyIcon | null {
    const normalizedName = name.toLowerCase().trim();

    // Direct match
    if (COMPANY_ICONS[normalizedName]) {
        return COMPANY_ICONS[normalizedName];
    }

    // Partial match - check if any key is contained in the name
    for (const [key, value] of Object.entries(COMPANY_ICONS)) {
        if (normalizedName.includes(key) || key.includes(normalizedName)) {
            return value;
        }
    }

    return null;
}

// Default icon for unknown subscriptions
export const DEFAULT_ICON: CompanyIcon = {
    icon: 'creditcard.fill',
    color: '#8E8E93',
};

// Get icon for a subscription with priority: custom > auto-detected > default
export function getSubscriptionIcon(subscription: {
    name: string;
    customIcon?: string | null;
    customIconColor?: string | null;
}): CompanyIcon {
    // Priority 1: Custom icon (user override)
    if (subscription.customIcon && subscription.customIconColor) {
        return {
            icon: subscription.customIcon,
            color: subscription.customIconColor,
        };
    }

    // Priority 2: Auto-detected company icon
    const companyIcon = getCompanyIcon(subscription.name);
    if (companyIcon) {
        return companyIcon;
    }

    // Priority 3: Default fallback
    return DEFAULT_ICON;
}
