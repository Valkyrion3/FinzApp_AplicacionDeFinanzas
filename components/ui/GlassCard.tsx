import { ReactNode } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';

import { Colors } from '../../constants/Colors';

type Props = {
  children: ReactNode;
  style?: ViewStyle;
  padded?: boolean;
  highlight?: boolean;
};

export function GlassCard({ children, style, padded = true, highlight = false }: Props) {
  return (
    <View
      style={[
        styles.card,
        padded && styles.padded,
        highlight && styles.highlight,
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    borderRadius: 20,
    shadowColor: Colors.cardShadow,
    shadowOpacity: 0.5,
    shadowOffset: { width: 0, height: 12 },
    shadowRadius: 24,
    elevation: 12,
    overflow: 'hidden',
  },
  padded: {
    padding: 20,
  },
  highlight: {
    borderColor: Colors.primary,
    shadowColor: Colors.primary,
  },
});

