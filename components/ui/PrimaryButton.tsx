import { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';

import { Colors } from '../../constants/Colors';

type Props = {
  label: string;
  onPress: () => void;
  icon?: ReactNode;
  disabled?: boolean;
  small?: boolean;
  style?: ViewStyle;
};

export function PrimaryButton({ label, onPress, icon, disabled = false, small = false, style }: Props) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        small && styles.small,
        style,
        (pressed || disabled) && styles.pressed,
      ]}
    >
      <View style={styles.content}>
        {icon && <View style={styles.icon}>{icon}</View>}
        <Text style={styles.label}>{label}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: Colors.primary,
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 22,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
    shadowColor: Colors.primary,
    shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 18 },
    shadowRadius: 22,
    elevation: 10,
  },
  small: {
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 16,
  },
  pressed: {
    opacity: 0.75,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 10,
  },
  icon: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    color: Colors.white,
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 0.4,
  },
});

