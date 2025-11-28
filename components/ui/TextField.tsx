import { forwardRef, useState } from 'react';
import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';

import { Colors } from '../../constants/Colors';

type Props = TextInputProps & {
  label?: string;
  helperText?: string;
  error?: string;
};

export const TextField = forwardRef<TextInput, Props>(function TextField(
  { label, helperText, error, style, value, multiline, onFocus, onBlur, ...rest },
  ref,
) {
  const [isFocused, setIsFocused] = useState(false);
  const hasValue = value != null && String(value).length > 0;

  return (
  <View style={style as any}>
      {label && (
        <Text style={[styles.label, (isFocused || hasValue) && styles.labelActive]}>
          {label}
        </Text>
      )}
      <View
        style={[
          styles.wrapper,
          (isFocused || hasValue) && styles.wrapperFocused,
          error && styles.wrapperError,
          multiline && styles.wrapperMultiline,
        ]}
      >
        <TextInput
          ref={ref}
          value={value}
          multiline={multiline}
          placeholderTextColor={Colors.textMuted}
          {...rest}
          style={[styles.input, multiline && styles.inputMultiline]}
          onFocus={(event) => {
            // Log focus events for debugging keyboard flicker
            // eslint-disable-next-line no-console
            console.log('TextField onFocus', { label });
            setIsFocused(true);
            onFocus?.(event);
          }}
          onBlur={(event) => {
            // Log blur events for debugging keyboard flicker
            // eslint-disable-next-line no-console
            console.log('TextField onBlur', { label });
            setIsFocused(false);
            onBlur?.(event);
          }}
        />
      </View>
      {(helperText || error) && (
        <Text style={[styles.helper, error && styles.helperError]}>
          {error ?? helperText}
        </Text>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  label: {
    color: Colors.textMuted,
    marginBottom: 6,
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  labelActive: {
    color: Colors.textSecondary,
  },
  wrapper: {
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  wrapperFocused: {
    borderColor: Colors.primary,
    // Reduced visual effect to avoid layout shifts that can affect keyboard behaviour on Android
  },
  wrapperError: {
    borderColor: Colors.red,
  },
  wrapperMultiline: {
    paddingVertical: 16,
  },
  input: {
    color: Colors.textPrimary,
    fontSize: 16,
  },
  inputMultiline: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  helper: {
    color: Colors.textMuted,
    fontSize: 12,
    marginTop: 8,
  },
  helperError: {
    color: Colors.red,
  },
});

