import { Dimensions, PixelRatio, Platform, ViewStyle } from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Standard mobile baseline (e.g. iPhone 11 / Pixel standard)
const guidelineBaseWidth = 375;

// Tablet breakpoint (iPad starts at 768px width)
const TABLET_BREAKPOINT = 768;

// Maximum content width for iPad to prevent stretched layouts
// Based on Apple HIG: optimal reading width is around 600-700px
const TABLET_MAX_CONTENT_WIDTH = 600;

// Check if device is tablet/large screen (only on iOS, not web)
export const isTablet = () => Platform.OS === 'ios' && screenWidth >= TABLET_BREAKPOINT;

// Get current screen dimensions (useful for orientation changes)
export const getScreenDimensions = () => ({
    width: screenWidth,
    height: screenHeight,
    isTablet: isTablet(),
});

// Get the max content width for the current device
export const getMaxContentWidth = () => {
    if (isTablet()) {
        return TABLET_MAX_CONTENT_WIDTH;
    }
    return screenWidth;
};

// Get horizontal padding needed to center content on iPad
export const getTabletHorizontalPadding = () => {
    if (!isTablet()) return 0;
    const padding = (screenWidth - TABLET_MAX_CONTENT_WIDTH) / 2;
    return Math.max(padding, 20); // Minimum 20px padding
};

// Style helper for iPad-optimized content containers
export const tabletContentStyle: ViewStyle = isTablet() ? {
    maxWidth: TABLET_MAX_CONTENT_WIDTH,
    alignSelf: 'center',
    width: '100%',
} : {};

// Helper to get responsive padding for lists
export const getResponsivePadding = () => {
    if (isTablet()) {
        return {
            paddingHorizontal: getTabletHorizontalPadding(),
        };
    }
    return {
        paddingHorizontal: 20,
    };
};

export const scale = (size: number) => {
    const scaleFactor = screenWidth / guidelineBaseWidth;
    // Higher cap for tablets (2.0x) vs phones (1.5x) to make elements larger on iPad
    // Web uses standard 1.5x cap since it has its own maxWidth constraint
    const maxScale = isTablet() ? 2.0 : 1.5;
    const clampedScaleFactor = Math.min(scaleFactor, maxScale);

    const newSize = size * clampedScaleFactor;

    // Round to nearest pixel for crisp rendering
    return Math.round(PixelRatio.roundToNearestPixel(newSize));
};
