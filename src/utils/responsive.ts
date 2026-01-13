import { Dimensions, PixelRatio, Platform } from 'react-native';

const { width } = Dimensions.get('window');

// Standard mobile baseline (e.g. iPhone 11 / Pixel standard)
const guidelineBaseWidth = 375;

// Tablet breakpoint (iPad starts at 768px width)
const TABLET_BREAKPOINT = 768;

// Check if device is tablet/large screen (only on iOS, not web)
export const isTablet = () => Platform.OS === 'ios' && width >= TABLET_BREAKPOINT;

export const scale = (size: number) => {
    const scaleFactor = width / guidelineBaseWidth;
    // Higher cap for tablets (2.0x) vs phones (1.5x) to make elements larger on iPad
    // Web uses standard 1.5x cap since it has its own maxWidth constraint
    const maxScale = isTablet() ? 2.0 : 1.5;
    const clampedScaleFactor = Math.min(scaleFactor, maxScale);

    const newSize = size * clampedScaleFactor;

    // Round to nearest pixel for crisp rendering
    return Math.round(PixelRatio.roundToNearestPixel(newSize));
};
