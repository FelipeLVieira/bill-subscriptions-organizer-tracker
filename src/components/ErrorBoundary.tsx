import { Button } from '@/components/ui/Button';
import { IconSymbol } from '@/components/ui/icon-symbol';
import i18n from '@/i18n';
import { Component, ErrorInfo, ReactNode } from 'react';
import { StyleSheet, Text, TouchableOpacity, useColorScheme, View } from 'react-native';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

/**
 * Error Boundary Component
 *
 * Catches JavaScript errors anywhere in child component tree,
 * logs them, and displays a fallback UI instead of the crashed component tree.
 */
export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    handleRetry = () => {
        this.setState({ hasError: false, error: null });
    };

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return <ErrorFallback onRetry={this.handleRetry} error={this.state.error} />;
        }

        return this.props.children;
    }
}

interface ErrorFallbackProps {
    onRetry: () => void;
    error: Error | null;
}

// Standalone fallback component that doesn't rely on theme context
function ErrorFallback({ onRetry, error }: ErrorFallbackProps) {
    // Use system color scheme directly to avoid dependency on ThemeContext
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const bgColor = isDark ? '#000000' : '#FFFFFF';
    const textColor = isDark ? '#FFFFFF' : '#000000';
    const secondaryTextColor = isDark ? '#8E8E93' : '#6B7280';
    const dangerColor = '#EF4444';
    const buttonBgColor = '#3B82F6';

    return (
        <View style={[styles.container, { backgroundColor: bgColor }]}>
            <View style={styles.content}>
                <IconSymbol name="exclamationmark.triangle.fill" size={60} color={dangerColor} />
                <Text style={[styles.title, { color: textColor }]}>
                    {i18n.t('somethingWentWrong')}
                </Text>
                <Text style={[styles.message, { color: secondaryTextColor }]}>
                    {i18n.t('errorOccurred')}
                </Text>
                {__DEV__ && error && (
                    <Text style={[styles.errorDetails, { color: secondaryTextColor }]}>
                        {error.message}
                    </Text>
                )}
                <TouchableOpacity
                    style={[styles.button, { backgroundColor: buttonBgColor }]}
                    onPress={onRetry}
                    activeOpacity={0.8}
                >
                    <Text style={styles.buttonText}>{i18n.t('tryAgain')}</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    content: {
        alignItems: 'center',
        maxWidth: 320,
    },
    title: {
        marginTop: 16,
        textAlign: 'center',
        fontSize: 22,
        fontWeight: '700',
    },
    message: {
        marginTop: 8,
        textAlign: 'center',
        fontSize: 15,
    },
    errorDetails: {
        marginTop: 16,
        fontSize: 12,
        fontFamily: 'monospace',
        textAlign: 'center',
    },
    button: {
        marginTop: 24,
        minWidth: 160,
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderRadius: 12,
        alignItems: 'center',
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
});
