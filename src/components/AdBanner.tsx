import { AD_UNIT_IDS, usePro } from '@/contexts/ProContext';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useNativeDriver } from '@/utils/animation';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Platform, StyleSheet, View } from 'react-native';

// Dynamic import for Google Mobile Ads (only if not web)
let BannerAd: any = null;
let BannerAdSize: any = null;

if (Platform.OS !== 'web') {
    try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const mobileAds = require('react-native-google-mobile-ads');
        BannerAd = mobileAds.BannerAd;
        BannerAdSize = mobileAds.BannerAdSize;
    } catch {
        // Mobile ads not available
    }
}

interface AdBannerProps {
    style?: object;
}

export function AdBanner({ style }: AdBannerProps) {
    const { shouldShowBannerAd, isPro } = usePro();
    const [isAdLoaded, setIsAdLoaded] = useState(false);
    const [adError, setAdError] = useState(false);
    const backgroundColor = useThemeColor({}, 'card');
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (isAdLoaded && !isPro) {
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 300,
                useNativeDriver,
            }).start();
        } else {
            fadeAnim.setValue(0);
        }
    }, [isAdLoaded, isPro, fadeAnim]);

    // Don't render on web or if pro
    if (Platform.OS === 'web' || !shouldShowBannerAd || !BannerAd || adError) {
        return null;
    }

    return (
        <Animated.View
            style={[
                styles.container,
                { backgroundColor, opacity: fadeAnim },
                style
            ]}
        >
            <View style={styles.adWrapper}>
                <BannerAd
                    unitId={AD_UNIT_IDS.banner}
                    size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
                    requestOptions={{
                        requestNonPersonalizedAdsOnly: true,
                    }}
                    onAdLoaded={() => setIsAdLoaded(true)}
                    onAdFailedToLoad={(error: any) => {
                        console.log('Banner ad failed to load:', error);
                        setAdError(true);
                    }}
                />
            </View>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 4,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: 'rgba(0,0,0,0.1)',
    },
    adWrapper: {
        overflow: 'hidden',
    },
});
