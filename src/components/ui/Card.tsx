import { useThemeColor } from '@/hooks/use-theme-color';
import { StyleSheet, View, ViewProps } from 'react-native';

type Props = ViewProps;

export function Card({ style, ...props }: Props) {
    const backgroundColor = useThemeColor({}, 'card');
    const borderColor = useThemeColor({}, 'border');

    return (
        <View style={[styles.card, { backgroundColor, borderColor }, style]} {...props} />
    );
}

const styles = StyleSheet.create({
    card: {
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
});
