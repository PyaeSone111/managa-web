import { useCallback } from 'react';
import {
  Alert,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { AuthCardLogo } from './navigation/HeaderBrandLogo';
import { getAppDownloadPageUrl } from '../utils/appDownload';
import { APP_VERSION } from '../utils/appVersion';
import colors from '../theme/colors';

function ThemeUnderline() {
  return (
    <View style={styles.themeUnderline}>
      <View style={[styles.themeSeg, styles.segNavy]} />
      <View style={[styles.themeSeg, styles.segMango]} />
      <View style={[styles.themeSeg, styles.segOrange]} />
    </View>
  );
}

export default function ForceUpdateScreen({ appDownload, installedVersion = APP_VERSION }) {
  const insets = useSafeAreaInsets();
  const sizeLabel = appDownload.sizeMB ? `${appDownload.sizeMB} MB` : null;

  const handleOpenDownloadPage = useCallback(async () => {
    const url = getAppDownloadPageUrl();

    try {
      const canOpen = await Linking.canOpenURL(url);
      if (!canOpen) {
        Alert.alert('Download unavailable', 'Unable to open the download page on this device.');
        return;
      }
      await Linking.openURL(url);
    } catch {
      Alert.alert('Could not open page', 'Please open the Myangar download page in your browser.');
    }
  }, []);

  return (
    <View style={[styles.root, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        bounces={false}
      >
        <View style={styles.card}>
          <AuthCardLogo />
          <ThemeUnderline />

          <View style={styles.iconWrap}>
            <Ionicons name="cloud-download-outline" size={40} color={colors.redOrange} />
          </View>

          <Text style={styles.title}>Update required</Text>
          <Text style={styles.message}>
            A newer version of Myangar is available. Open the download page in your browser
            and install the latest version to continue using the app.
          </Text>

          <View style={styles.versionBox}>
            <View style={styles.versionRow}>
              <Text style={styles.versionLabel}>Your version</Text>
              <Text style={styles.versionValueOld}>{installedVersion}</Text>
            </View>
            <ThemeUnderline />
            <View style={styles.versionRow}>
              <Text style={styles.versionLabel}>Latest version</Text>
              <Text style={styles.versionValueNew}>{appDownload.version}</Text>
            </View>
          </View>

          {appDownload.fileName ? (
            <Text style={styles.fileName} numberOfLines={2}>
              {appDownload.fileName}
              {sizeLabel ? ` · ${sizeLabel}` : ''}
            </Text>
          ) : null}

          <Pressable style={styles.button} onPress={handleOpenDownloadPage}>
            <Ionicons name="open-outline" size={18} color={colors.white} />
            <Text style={styles.buttonText}>Get latest version</Text>
          </Pressable>

          <Text style={styles.hint}>
            Download the APK from the website, install it, then reopen the app.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.almond,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 16,
  },
  card: {
    padding: 24,
    borderRadius: 16,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.almondBorder,
    alignItems: 'stretch',
  },
  themeUnderline: {
    flexDirection: 'row',
    height: 2,
    width: '100%',
    marginVertical: 16,
  },
  themeSeg: {
    flex: 1,
  },
  segNavy: {
    backgroundColor: colors.navy,
  },
  segMango: {
    backgroundColor: colors.mango,
  },
  segOrange: {
    backgroundColor: colors.redOrange,
  },
  iconWrap: {
    alignSelf: 'center',
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: `${colors.redOrange}18`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.navy,
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    lineHeight: 21,
    color: colors.muted,
    textAlign: 'center',
    marginBottom: 20,
  },
  versionBox: {
    borderWidth: 1,
    borderColor: colors.almondBorder,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
  },
  versionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 12,
  },
  versionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.muted,
  },
  versionValueOld: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.muted,
  },
  versionValueNew: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.redOrange,
  },
  fileName: {
    fontSize: 12,
    color: colors.muted,
    textAlign: 'center',
    marginBottom: 16,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.navy,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.white,
  },
  hint: {
    marginTop: 14,
    fontSize: 12,
    lineHeight: 18,
    color: colors.muted,
    textAlign: 'center',
  },
});
