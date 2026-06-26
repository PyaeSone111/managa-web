import { Linking, Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { CONTACT_EMAIL } from '../utils/constants';
import colors from '../theme/colors';

export default function ContactUsScreen({ navigation }) {
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Contact Us</Text>
      <Text style={styles.subtitle}>We'd love to hear from you.</Text>

      <Text style={styles.heading}>Email</Text>
      <Text style={styles.body}>For general inquiries, feedback, or support:</Text>
      <Pressable style={styles.button} onPress={() => Linking.openURL(`mailto:${CONTACT_EMAIL}`)}>
        <Text style={styles.buttonText}>{CONTACT_EMAIL}</Text>
      </Pressable>

      <Text style={styles.heading}>Privacy & Data</Text>
      <Text style={styles.body}>
        For privacy-related requests, see our Privacy Policy.
      </Text>
      <Pressable onPress={() => navigation.navigate('PrivacyPolicy')}>
        <Text style={styles.link}>View Privacy Policy</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.almond },
  content: { padding: 16, paddingBottom: 32 },
  title: { fontSize: 26, fontWeight: '700', color: colors.navy, marginBottom: 6 },
  subtitle: { fontSize: 14, color: colors.muted, marginBottom: 20 },
  heading: { fontSize: 17, fontWeight: '600', color: colors.navy, marginTop: 16, marginBottom: 8 },
  body: { fontSize: 14, color: `${colors.navy}CC`, lineHeight: 22, marginBottom: 12 },
  button: {
    alignSelf: 'flex-start',
    backgroundColor: colors.redOrange,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  buttonText: { color: colors.white, fontWeight: '600' },
  link: { color: colors.redOrange, fontWeight: '600', marginTop: 8 },
});
