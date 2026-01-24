import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { isTablet } from '@/utils/responsive';

interface TabletContentWrapperProps {
    children: React.ReactNode;
    style?: ViewStyle;
    maxWidth?: number;
}

const TABLET_MAX_WIDTH = 600;

/**
 * Wrapper component that constrains content width on iPad/tablets
 * for better readability and less crowded UI.
 * On iPhone, it renders children without any constraints.
 */
export function TabletContentWrapper({
    children,
    style,
    maxWidth = TABLET_MAX_WIDTH
}: TabletContentWrapperProps) {
    if (!isTablet()) {
        // On phones, just render children directly with optional style
        return <View style={style}>{children}</View>;
    }

    // On tablets, center content with max width constraint
    return (
        <View style={[styles.tabletContainer, style]}>
            <View style={[styles.tabletContent, { maxWidth }]}>
                {children}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    tabletContainer: {
        flex: 1,
        alignItems: 'center',
    },
    tabletContent: {
        width: '100%',
    },
});
