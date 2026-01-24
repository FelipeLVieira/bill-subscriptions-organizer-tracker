// Curated SF Symbols for the icon picker
// Only includes icons that have cross-platform mappings in icon-symbol.tsx

export interface IconCategory {
    id: string;
    labelKey: string; // i18n key
    icons: string[];
}

// Curated icon categories for subscription/bill icon selection
export const SF_SYMBOL_CATEGORIES: IconCategory[] = [
    {
        id: 'entertainment',
        labelKey: 'iconCat_entertainment',
        icons: [
            'play.tv.fill',
            'sparkles.tv.fill',
            'play.rectangle.fill',
            'tv.fill',
            'appletv.fill',
            'music.note',
            'headphones',
            'video.fill',
            'gamecontroller.fill',
            'sparkles',
        ],
    },
    {
        id: 'finance',
        labelKey: 'iconCat_finance',
        icons: [
            'creditcard.fill',
            'dollarsign.circle.fill',
            'chart.pie.fill',
            'chart.bar.fill',
            'diamond.fill',
        ],
    },
    {
        id: 'utilities',
        labelKey: 'iconCat_utilities',
        icons: [
            'bolt.fill',
            'drop.fill',
            'flame.fill',
            'wifi',
            'lightbulb.fill',
        ],
    },
    {
        id: 'housing',
        labelKey: 'iconCat_housing',
        icons: [
            'house.fill',
            'building.2.fill',
            'key.fill',
        ],
    },
    {
        id: 'transportation',
        labelKey: 'iconCat_transportation',
        icons: [
            'car.fill',
            'bus.fill',
            'bicycle',
            'p.circle.fill',
        ],
    },
    {
        id: 'communication',
        labelKey: 'iconCat_communication',
        icons: [
            'phone.fill',
            'iphone',
            'bubble.left.and.bubble.right.fill',
            'at',
            'globe',
        ],
    },
    {
        id: 'health',
        labelKey: 'iconCat_health',
        icons: [
            'heart.fill',
            'figure.run',
            'bicycle',
            'brain.head.profile',
            'leaf.fill',
        ],
    },
    {
        id: 'technology',
        labelKey: 'iconCat_technology',
        icons: [
            'desktopcomputer',
            'iphone',
            'cloud.fill',
            'icloud.fill',
            'folder.fill',
            'app.fill',
            'square.grid.2x2.fill',
        ],
    },
    {
        id: 'security',
        labelKey: 'iconCat_security',
        icons: [
            'lock.shield.fill',
            'shield.fill',
            'key.fill',
        ],
    },
    {
        id: 'education',
        labelKey: 'iconCat_education',
        icons: [
            'graduationcap.fill',
            'book.fill',
            'books.vertical.fill',
            'character.book.closed.fill',
            'pencil.and.ruler.fill',
        ],
    },
    {
        id: 'shopping',
        labelKey: 'iconCat_shopping',
        icons: [
            'cart.fill',
            'bag.fill',
            'shippingbox.fill',
            'tag.fill',
            'tshirt.fill',
        ],
    },
    {
        id: 'food',
        labelKey: 'iconCat_food',
        icons: [
            'takeoutbag.and.cup.and.straw.fill',
            'leaf.fill',
        ],
    },
    {
        id: 'work',
        labelKey: 'iconCat_work',
        icons: [
            'doc.text.fill',
            'doc.fill',
            'folder.fill',
            'calendar',
            'calendar.badge.clock',
            'clock.fill',
            'person.fill',
            'person.2.fill',
            'list.bullet.clipboard',
        ],
    },
    {
        id: 'other',
        labelKey: 'iconCat_other',
        icons: [
            'star.fill',
            'star',
            'pawprint.fill',
            'paintbrush.fill',
            'ellipsis.circle.fill',
            'sun.max.fill',
            'moon.fill',
            'hand.wave.fill',
        ],
    },
];

// Preset colors for icon selection
export const ICON_PRESET_COLORS: string[] = [
    '#FF3B30', // Red
    '#FF9500', // Orange
    '#FFCC00', // Yellow
    '#34C759', // Green
    '#00C7BE', // Teal
    '#007AFF', // Blue
    '#5856D6', // Purple
    '#AF52DE', // Violet
    '#FF2D55', // Pink
    '#8E8E93', // Gray
    '#1C1C1E', // Black
    '#FFFFFF', // White
];

// Get all icons as a flat array
export function getAllPickerIcons(): string[] {
    return SF_SYMBOL_CATEGORIES.flatMap((category) => category.icons);
}

// Get icon category by icon name
export function getIconCategory(iconName: string): IconCategory | undefined {
    return SF_SYMBOL_CATEGORIES.find((category) => category.icons.includes(iconName));
}
