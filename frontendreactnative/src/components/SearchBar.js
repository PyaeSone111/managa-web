import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import colors from '../theme/colors';

export default function SearchBar({ onSearch, placeholder = 'Search manga...' }) {
  const [query, setQuery] = useState('');

  const submit = () => {
    const trimmed = query.trim();
    if (trimmed) onSearch?.(trimmed);
  };

  return (
    <View style={styles.container}>
      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder={placeholder}
        placeholderTextColor={colors.muted}
        returnKeyType="search"
        onSubmitEditing={submit}
        style={styles.input}
      />
      <Pressable onPress={submit} style={styles.button}>
        <Text style={styles.buttonText}>Search</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 8,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.almondBorder,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: colors.white,
    color: colors.navy,
  },
  button: {
    backgroundColor: colors.redOrange,
    borderRadius: 10,
    paddingHorizontal: 14,
    justifyContent: 'center',
  },
  buttonText: {
    color: colors.white,
    fontWeight: '600',
    fontSize: 14,
  },
});
