import { useThemeColor } from '@/hooks/use-theme-color';
import { StyleSheet, Text, TouchableOpacity, TouchableOpacityProps } from 'react-native';

type ButtonType = 'primary' | 'secondary' | 'danger';

type Props = TouchableOpacityProps & {
    title: string;
    type?: ButtonType;
};

export function Button({ title, type = 'primary', style, ...props }: Props) {
    const primaryColor = useThemeColor({}, 'primary');
    const dangerColor = useThemeColor({}, 'danger');
    const textColor = '#FFFFFF'; // Always white for primary/danger buttons

    let backgroundColor = primaryColor;
    if (type === 'danger') backgroundColor = dangerColor;

    return (
        <TouchableOpacity style={[styles.button, { backgroundColor }, style]} activeOpacity={0.8} {...props}>
            <Text style={[styles.text, { color: textColor }]}>{title}</Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    button: {
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    text: {
        fontSize: 16,
        fontWeight: '600',
    },
});
