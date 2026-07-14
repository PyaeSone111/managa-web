import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import colors from '../../theme/colors';

export default function PasswordInput({
  value,
  onChangeText,
  placeholder,
  autoComplete,
  textContentType,
  importantForAutofill,
  style,
  containerStyle,
}) {
  const [visible, setVisible] = useState(false);

  return (
    <View style={[styles.wrap, containerStyle]}>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={!visible}
        autoComplete={autoComplete}
        textContentType={textContentType}
        importantForAutofill={importantForAutofill}
        placeholder={placeholder}
        placeholderTextColor={colors.muted}
        style={[styles.input, style]}
      />
      <Pressable
        onPress={() => setVisible((v) => !v)}
        style={styles.toggle}
        accessibilityRole="button"
        accessibilityLabel={visible ? 'Hide password' : 'Show password'}
      >
        <Ionicons
          name={visible ? 'eye-off-outline' : 'eye-outline'}
          size={20}
          color={colors.muted}
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'relative',
    marginBottom: 14,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.almondBorder,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingRight: 44,
    paddingVertical: 12,
    color: colors.navy,
    backgroundColor: colors.white,
  },
  toggle: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
