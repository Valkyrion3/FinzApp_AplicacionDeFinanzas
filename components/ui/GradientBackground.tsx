import { ReactNode } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';

import { Colors } from '../../constants/Colors';

type GradientVariant = 'primary' | 'secondary';

type Props = {
  children: ReactNode;
  style?: ViewStyle;
  variant?: GradientVariant;
};

const gradientMap: Record<GradientVariant, string[]> = {
  primary: Colors.gradientPrimary,
  secondary: Colors.gradientSecondary,
};

export function GradientBackground({ children, style, variant = 'primary' }: Props) {
  const gradient = gradientMap[variant];

  return (
    <View style={[styles.container, style]}>
      <Svg pointerEvents="none" style={StyleSheet.absoluteFill}>
        <Defs>
          <RadialGradient id="bgPrimary" cx="20%" cy="-10%" r="70%">
            <Stop offset="0%" stopColor={gradient[0]} stopOpacity="0.9" />
            <Stop offset="100%" stopColor={Colors.background} stopOpacity="0" />
          </RadialGradient>
          <RadialGradient id="bgAccent" cx="85%" cy="0%" r="65%">
            <Stop offset="0%" stopColor={gradient[1]} stopOpacity="0.6" />
            <Stop offset="100%" stopColor={Colors.background} stopOpacity="0" />
          </RadialGradient>
          <RadialGradient id="bgGlow" cx="50%" cy="100%" r="75%">
            <Stop offset="0%" stopColor={gradient[2]} stopOpacity="0.35" />
            <Stop offset="100%" stopColor={Colors.background} stopOpacity="0" />
          </RadialGradient>
        </Defs>
        <Circle cx="18%" cy="-8%" r="240" fill="url(#bgPrimary)" />
        <Circle cx="90%" cy="12%" r="200" fill="url(#bgAccent)" />
        <Circle cx="50%" cy="110%" r="320" fill="url(#bgGlow)" />
      </Svg>
      <View style={styles.overlay} />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.backgroundOverlay,
  },
});

