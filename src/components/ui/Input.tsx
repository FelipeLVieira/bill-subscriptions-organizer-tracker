import { useThemeColor } from '@/hooks/use-theme-color';
import { StyleSheet, TextInput, TextInputProps } from 'react-native';

type Props = TextInputProps;

export function Input({ style, ...props }: Props) {
    const backgroundColor = useThemeColor({}, 'inputBg');
    const color = useThemeColor({}, 'text');
    const borderColor = useThemeColor({}, 'border');
    const placeholderColor = useThemeColor({}, 'textSecondary');

    return (
        <TextInput
            style={[styles.input, { backgroundColor, color, borderColor }, style]}
            placeholderTextColor={placeholderColor}
            {...props}
        />
    );
}

const styles = StyleSheet.create({
    input: {
        height: 48,
        borderRadius: 8,
        paddingHorizontal: 16,
        fontSize: 16,
        borderWidth: 1,
    },
});
