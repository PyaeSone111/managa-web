import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import colors from '../theme/colors';

export default function LoginScreen({ navigation }) {
  const { login, isAuthenticated } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) {
    navigation.replace('Main');
    return null;
  }

  const handleSubmit = async () => {
    setError('');
    setLoading(true);
    try {
      await login(form);
      navigation.replace('Main');
    } catch (err) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          <Text style={styles.title}>Sign In</Text>
          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Text style={styles.label}>Email</Text>
          <TextInput
            value={form.email}
            onChangeText={(email) => setForm({ ...form, email })}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholder="you@example.com"
            placeholderTextColor={colors.muted}
            style={styles.input}
          />

          <Text style={styles.label}>Password</Text>
          <TextInput
            value={form.password}
            onChangeText={(password) => setForm({ ...form, password })}
            secureTextEntry
            placeholder="Your password"
            placeholderTextColor={colors.muted}
            style={styles.input}
          />

          <Pressable
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            <Text style={styles.buttonText}>{loading ? 'Signing in...' : 'Sign In'}</Text>
          </Pressable>

          <Pressable onPress={() => navigation.navigate('Register')}>
            <Text style={styles.link}>
              Don't have an account? <Text style={styles.linkBold}>Sign Up</Text>
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.almond },
  container: { flexGrow: 1, justifyContent: 'center', padding: 16 },
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.almondBorder,
    padding: 24,
  },
  title: { fontSize: 24, fontWeight: '700', color: colors.navy, marginBottom: 20, textAlign: 'center' },
  label: { fontSize: 14, fontWeight: '600', color: colors.navy, marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: colors.almondBorder,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 14,
    color: colors.navy,
    backgroundColor: colors.white,
  },
  button: {
    backgroundColor: colors.redOrange,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: colors.white, fontWeight: '700', fontSize: 16 },
  error: {
    backgroundColor: '#fef2f2',
    color: colors.error,
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
    fontSize: 13,
  },
  link: { marginTop: 20, textAlign: 'center', color: colors.muted, fontSize: 14 },
  linkBold: { color: colors.redOrange, fontWeight: '600' },
});
