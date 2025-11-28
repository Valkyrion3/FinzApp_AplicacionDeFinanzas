import { Ionicons } from '@expo/vector-icons';
import { Component, ReactNode } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Colors } from '../constants/Colors';
import { logger } from '../lib/logger';
import { GradientBackground } from './ui/GradientBackground';

interface Props {
  children: ReactNode;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: string | null;
  errorCount: number;
}

/**
 * Error Boundary component to catch and handle runtime errors
 * Prevents white screen of death and provides user-friendly error UI
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
      errorCount: 1
    };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    // Log the error
    logger.error('Error boundary caught error', {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack
    });

    this.setState(prev => ({
      errorInfo: errorInfo.componentStack,
      errorCount: prev.errorCount + 1
    }));
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0
    });
    this.props.onReset?.();
  };

  handleShare = () => {
    const errorMessage = `
Error: ${this.state.error?.message}

Stack: ${this.state.error?.stack}

Component Stack: ${this.state.errorInfo}
    `.trim();

    // Could implement sharing via share API
    console.log('Error details:', errorMessage);
  };

  render() {
    if (this.state.hasError && this.state.error) {
      return (
        <GradientBackground>
          <View style={styles.container}>
            <ScrollView
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              {/* Error Icon */}
              <View style={styles.iconContainer}>
                <View style={styles.iconWrapper}>
                  <Ionicons
                    name="alert-circle"
                    size={64}
                    color={Colors.white}
                  />
                </View>
              </View>

              {/* Error Title */}
              <Text style={styles.title}>¡Algo salió mal!</Text>

              {/* Error Message */}
              <Text style={styles.message}>
                La aplicación encontró un error inesperado. No te preocupes, estamos trabajando en
                solucionarlo.
              </Text>

              {/* Error Details (Development only) */}
              {__DEV__ && (
                <View style={styles.detailsContainer}>
                  <Text style={styles.detailsTitle}>Detalles del Error:</Text>
                  <View style={styles.errorBox}>
                    <Text style={styles.errorText}>
                      {this.state.error.message}
                    </Text>
                  </View>

                  {this.state.errorInfo && (
                    <View style={styles.errorBox}>
                      <Text style={styles.errorText} numberOfLines={10}>
                        {this.state.errorInfo}
                      </Text>
                    </View>
                  )}

                  <Text style={styles.errorCount}>
                    Errores: {this.state.errorCount}
                  </Text>
                </View>
              )}

              {/* Action Buttons */}
              <View style={styles.buttonsContainer}>
                <TouchableOpacity
                  style={[styles.button, styles.primaryButton]}
                  onPress={this.handleReset}
                >
                  <Ionicons name="refresh" size={20} color={Colors.white} />
                  <Text style={styles.buttonText}>Reintentar</Text>
                </TouchableOpacity>

                {__DEV__ && (
                  <TouchableOpacity
                    style={[styles.button, styles.secondaryButton]}
                    onPress={this.handleShare}
                  >
                    <Ionicons name="share-social" size={20} color={Colors.primary} />
                    <Text style={[styles.buttonText, { color: Colors.primary }]}>
                      Compartir Error
                    </Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Help Text */}
              <Text style={styles.helpText}>
                Si el problema persiste, intenta cerrar y abrir la aplicación nuevamente.
              </Text>
            </ScrollView>
          </View>
        </GradientBackground>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconWrapper: {
    backgroundColor: 'rgba(244, 67, 54, 0.2)',
    borderRadius: 80,
    padding: 24,
    borderWidth: 2,
    borderColor: 'rgba(244, 67, 54, 0.4)',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 16,
  },
  message: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  detailsContainer: {
    marginBottom: 32,
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
    borderRadius: 16,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#F44336',
  },
  detailsTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  errorBox: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  errorText: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontFamily: 'monospace',
    lineHeight: 18,
  },
  errorCount: {
    fontSize: 12,
    color: Colors.textMuted,
    fontWeight: '600',
  },
  buttonsContainer: {
    gap: 12,
    marginBottom: 24,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 16,
    gap: 10,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 16,
    elevation: 8,
  },
  secondaryButton: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  buttonText: {
    color: Colors.white,
    fontWeight: '600',
    fontSize: 16,
  },
  helpText: {
    fontSize: 13,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 16,
  },
});
