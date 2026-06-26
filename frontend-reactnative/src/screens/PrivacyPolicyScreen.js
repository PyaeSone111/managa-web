import { ScrollView, StyleSheet, Text } from 'react-native';
import colors from '../theme/colors';

export default function PrivacyPolicyScreen() {
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Privacy Policy</Text>
      <Text style={styles.updated}>Last updated: {new Date().toLocaleDateString('en-US')}</Text>

      <Text style={styles.heading}>1. Introduction</Text>
      <Text style={styles.body}>
        Myangar is committed to protecting your privacy. This Privacy Policy explains how we
        collect, use, and safeguard your information when you use our app and services for reading
        manga, manhwa, and manhua.
      </Text>

      <Text style={styles.heading}>2. Information We Collect</Text>
      <Text style={styles.body}>
        We may collect information you provide directly (account registration, ratings, favorites,
        reading progress) and information collected automatically when you use our app (device type,
        pages visited). We use this to operate the service and improve your experience.
      </Text>

      <Text style={styles.heading}>3. How We Use Information</Text>
      <Text style={styles.body}>
        We use your information to provide and maintain the service, personalize content, process
        favorites and ratings, and communicate with you about your account.
      </Text>

      <Text style={styles.heading}>4. Data Security</Text>
      <Text style={styles.body}>
        We implement appropriate security measures to protect your personal information. However, no
        method of transmission over the internet is 100% secure.
      </Text>

      <Text style={styles.heading}>5. Contact</Text>
      <Text style={styles.body}>
        If you have questions about this Privacy Policy, please contact us through the Contact Us
        screen in the app.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.almond },
  content: { padding: 16, paddingBottom: 32 },
  title: { fontSize: 26, fontWeight: '700', color: colors.navy, marginBottom: 8 },
  updated: { fontSize: 13, color: colors.muted, marginBottom: 20 },
  heading: { fontSize: 17, fontWeight: '600', color: colors.navy, marginTop: 16, marginBottom: 8 },
  body: { fontSize: 14, color: `${colors.navy}CC`, lineHeight: 22 },
});
