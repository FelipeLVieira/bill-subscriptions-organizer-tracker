// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolWeight, SymbolViewProps } from 'expo-symbols';
import { ComponentProps } from 'react';
import { OpaqueColorValue, type StyleProp, type TextStyle } from 'react-native';

type IconMapping = Record<SymbolViewProps['name'], ComponentProps<typeof MaterialIcons>['name']>;
type IconSymbolName = keyof typeof MAPPING;

/**
 * Add your SF Symbols to Material Icons mappings here.
 * - see Material Icons in the [Icons Directory](https://icons.expo.fyi).
 * - see SF Symbols in the [SF Symbols](https://developer.apple.com/sf-symbols/) app.
 */
const MAPPING = {
  // Navigation & Arrows
  'house.fill': 'home',
  'paperplane.fill': 'send',
  'chevron.left.forwardslash.chevron.right': 'code',
  'chevron.right': 'chevron-right',
  'chevron.left': 'chevron-left',
  'chevron.down': 'expand-more',

  // Actions
  'plus': 'add',
  'plus.circle.fill': 'add-circle',
  'xmark': 'close',
  'xmark.circle.fill': 'cancel',
  'checkmark': 'check',
  'checkmark.circle.fill': 'check-circle',
  'pencil': 'edit',
  'pencil.and.ruler.fill': 'design-services',
  'trash': 'delete',
  'trash.fill': 'delete',
  'magnifyingglass': 'search',
  'doc.text.magnifyingglass': 'find-in-page',

  // Media & Entertainment
  'play.tv.fill': 'live-tv',
  'sparkles.tv.fill': 'live-tv',
  'play.rectangle.fill': 'play-arrow',
  'appletv.fill': 'tv',
  'tv.fill': 'tv',
  'music.note': 'music-note',
  'video.fill': 'videocam',

  // Cloud & Storage
  'icloud.fill': 'cloud',
  'cloud.fill': 'cloud',
  'externaldrive.fill.badge.icloud': 'cloud-upload',
  'folder.fill': 'folder',

  // Documents & Files
  'doc.fill': 'description',
  'doc.text.fill': 'article',
  'newspaper.fill': 'article',
  'book.fill': 'menu-book',
  'books.vertical.fill': 'library-books',
  'character.book.closed.fill': 'auto-stories',
  'list.bullet': 'format-list-bulleted',
  'rectangle.3.group': 'view-module',
  'list.bullet.clipboard': 'assignment',
  'list.bullet.rectangle.fill': 'list-alt',

  // Communication
  'bubble.left.and.bubble.right.fill': 'forum',
  'globe': 'language',
  'at': 'alternate-email',

  // Gaming & Entertainment
  'gamecontroller.fill': 'sports-esports',
  'sparkles': 'auto-awesome',

  // Health & Fitness
  'figure.run': 'directions-run',
  'bicycle': 'pedal-bike',
  'brain.head.profile': 'psychology',
  'brain': 'psychology',
  'heart.fill': 'favorite',
  'leaf.fill': 'eco',

  // Food & Shopping
  'takeoutbag.and.cup.and.straw.fill': 'fastfood',
  'bag.fill': 'shopping-bag',
  'cart.fill': 'shopping-cart',
  'shippingbox.fill': 'inventory-2',

  // Utilities
  'bolt.fill': 'bolt',
  'drop.fill': 'water-drop',
  'flame.fill': 'local-fire-department',
  'wifi': 'wifi',
  'phone.fill': 'phone',
  'iphone': 'smartphone',

  // Security & Protection
  'shield.fill': 'shield',
  'lock.shield.fill': 'security',
  'key.fill': 'vpn-key',

  // Housing & Transportation
  'building.2.fill': 'apartment',
  'car.fill': 'directions-car',
  'p.circle.fill': 'local-parking',

  // Education
  'graduationcap.fill': 'school',
  'headphones': 'headphones',

  // People & Social
  'person.fill': 'person',
  'person.2.fill': 'people',
  'hand.wave.fill': 'waving-hand',

  // Charts & Data
  'chart.pie.fill': 'pie-chart',

  // Time & History
  'clock.fill': 'schedule',
  'clock.arrow.circlepath': 'history',

  // Info & Help
  'questionmark.circle': 'help-outline',
  'lightbulb.fill': 'lightbulb',
  'ellipsis.circle.fill': 'more-horiz',

  // Finance
  'creditcard.fill': 'credit-card',
  'g.circle.fill': 'g-mobiledata',

  // Misc
  'paintbrush.fill': 'brush',
  'square.grid.2x2.fill': 'grid-view',
  'app.fill': 'apps',
} as IconMapping;

/**
 * An icon component that uses native SF Symbols on iOS, and Material Icons on Android and web.
 * This ensures a consistent look across platforms, and optimal resource usage.
 * Icon `name`s are based on SF Symbols and require manual mapping to Material Icons.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  return <MaterialIcons color={color} size={size} name={MAPPING[name]} style={style} />;
}
