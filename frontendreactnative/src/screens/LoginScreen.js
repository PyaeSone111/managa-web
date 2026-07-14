import { useEffect, useState } from 'react';
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
import Ionicons from 'react-native-vector-icons/Ionicons';
import { AuthCardLogo } from '../components/navigation/HeaderBrandLogo';
import AuthCardTitle from '../components/auth/AuthCardTitle';
import PasswordInput from '../components/auth/PasswordInput';
import { useAuth } from '../context/AuthContext';
import {
  clearRememberedLogin,
  getRememberedLogin,
  saveRememberedLogin,
} from '../services/rememberLoginStorage';
import colors from '../theme/colors';

export default function LoginScreen({ navigation }) {
  const { login, isAuthenticated } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const saved = await getRememberedLogin();
      if (mounted && saved) {
        setForm({ email: saved.email, password: saved.password });
        setRememberMe(true);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  if (isAuthenticated) {
    navigation.replace('Main');
    return null;
  }

  const handleSubmit = async () => {
    setError('');
    setLoading(true);
    try {
      await login(form);
      if (rememberMe) {
        await saveRememberedLogin(form);
      } else {
        await clearRememberedLogin();
      }
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
          <AuthCardLogo />
          <AuthCardTitle variant="login" />
          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Text style={styles.label}>Email</Text>
          <TextInput
            value={form.email}
            onChangeText={(email) => setForm({ ...form, email })}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            textContentType="emailAddress"
            importantForAutofill="yes"
            placeholder="you@example.com"
            placeholderTextColor={colors.muted}
            style={styles.input}
          />

          <Text style={styles.label}>Password</Text>
          <PasswordInput
            value={form.password}
            onChangeText={(password) => setForm({ ...form, password })}
            autoComplete="password"
            textContentType="password"
            importantForAutofill="yes"
            placeholder="Your password"
          />

          <Pressable
            style={styles.rememberRow}
            onPress={() => setRememberMe((value) => !value)}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: rememberMe }}
            accessibilityLabel="Remember me"
          >
            <Ionicons
              name={rememberMe ? 'checkbox' : 'square-outline'}
              size={22}
              color={rememberMe ? colors.redOrange : colors.muted}
            />
            <Text style={styles.rememberLabel}>Remember me</Text>
          </Pressable>

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
  rememberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  rememberLabel: {
    fontSize: 14,
    color: colors.navy,
    fontWeight: '500',
  },
  button: {
    backgroundColor: colors.redOrange,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
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
