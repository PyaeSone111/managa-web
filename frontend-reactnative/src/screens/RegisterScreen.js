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

export default function RegisterScreen({ navigation }) {
  const { register, isAuthenticated } = useAuth();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) {
    navigation.replace('Main');
    return null;
  }

  const handleSubmit = async () => {
    setErrors({});
    setLoading(true);
    try {
      await register(form);
      navigation.replace('Main');
    } catch (err) {
      if (err.errors) {
        setErrors(err.errors);
      } else {
        setErrors({ general: [err.message || 'Registration failed'] });
      }
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
          <Text style={styles.title}>Create Account</Text>
          {errors.general && <Text style={styles.error}>{errors.general[0]}</Text>}

          <Text style={styles.label}>Name</Text>
          <TextInput
            value={form.name}
            onChangeText={(name) => setForm({ ...form, name })}
            style={styles.input}
            placeholder="Your name"
            placeholderTextColor={colors.muted}
          />
          {errors.name && <Text style={styles.fieldError}>{errors.name[0]}</Text>}

          <Text style={styles.label}>Email</Text>
          <TextInput
            value={form.email}
            onChangeText={(email) => setForm({ ...form, email })}
            keyboardType="email-address"
            autoCapitalize="none"
            style={styles.input}
            placeholder="you@example.com"
            placeholderTextColor={colors.muted}
          />
          {errors.email && <Text style={styles.fieldError}>{errors.email[0]}</Text>}

          <Text style={styles.label}>Password</Text>
          <TextInput
            value={form.password}
            onChangeText={(password) => setForm({ ...form, password })}
            secureTextEntry
            style={styles.input}
            placeholder="Min 8 characters"
            placeholderTextColor={colors.muted}
          />
          {errors.password && <Text style={styles.fieldError}>{errors.password[0]}</Text>}

          <Text style={styles.label}>Confirm Password</Text>
          <TextInput
            value={form.password_confirmation}
            onChangeText={(password_confirmation) => setForm({ ...form, password_confirmation })}
            secureTextEntry
            style={styles.input}
            placeholder="Repeat your password"
            placeholderTextColor={colors.muted}
          />

          <Pressable
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Creating account...' : 'Create Account'}
            </Text>
          </Pressable>

          <Pressable onPress={() => navigation.navigate('Login')}>
            <Text style={styles.link}>
              Already have an account? <Text style={styles.linkBold}>Sign In</Text>
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
  label: { fontSize: 14, fontWeight: '600', color: colors.navy, marginBottom: 6, marginTop: 4 },
  input: {
    borderWidth: 1,
    borderColor: colors.almondBorder,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 4,
    color: colors.navy,
  },
  button: {
    backgroundColor: colors.redOrange,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 16,
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
  fieldError: { color: colors.error, fontSize: 12, marginBottom: 8 },
  link: { marginTop: 20, textAlign: 'center', color: colors.muted, fontSize: 14 },
  linkBold: { color: colors.redOrange, fontWeight: '600' },
});
