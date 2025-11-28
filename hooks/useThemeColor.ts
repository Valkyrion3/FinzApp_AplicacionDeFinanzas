/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof typeof Colors
) {
  const theme = useColorScheme() ?? 'light';
  const colorFromProps = props[theme];

  if (colorFromProps) {
    return colorFromProps;
  } else {
    // Colors may contain gradients (string[]). For places that expect a
    // single ColorValue (e.g. backgroundColor / color) return a string.
    // If a gradient array is provided, use the first color as a sensible
    // default.
    const c = Colors[colorName] as string | string[];
    return Array.isArray(c) ? c[0] : c;
  }
}
