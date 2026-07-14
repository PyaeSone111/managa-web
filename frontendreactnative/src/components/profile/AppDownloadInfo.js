import { Fragment } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AuthCardTitle from '../auth/AuthCardTitle';
import { useBranding } from '../../context/BrandingContext';
import { APP_VERSION } from '../../utils/appVersion';
import colors from '../../theme/colors';

function ThemeUnderline() {
  return (
    <View style={styles.themeUnderline}>
      <View style={[styles.themeSeg, styles.segNavy]} />
      <View style={[styles.themeSeg, styles.segMango]} />
      <View style={[styles.themeSeg, styles.segOrange]} />
    </View>
  );
}

function InfoRow({ icon, label, value }) {
  if (!value) return null;

  return (
    <View style={styles.row}>
      <View style={styles.rowLeft}>
        <Ionicons name={icon} size={14} color={colors.redOrange} />
        <Text style={styles.rowLabel}>{label}</Text>
      </View>
      <Text style={styles.rowValue} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

export default function AppDownloadInfo({ embedded = false }) {
  const { appDownload } = useBranding();
  const sizeLabel = appDownload.sizeMB ? `${appDownload.sizeMB} MB` : null;

  const rows = [
    { icon: 'phone-portrait-outline', label: 'Installed', value: APP_VERSION },
    { icon: 'git-branch-outline', label: 'Latest', value: appDownload.version },
    { icon: 'document-text-outline', label: 'Name', value: appDownload.fileName },
    { icon: 'archive-outline', label: 'Size', value: sizeLabel },
  ].filter((item) => item.value);

  return (
    <View style={[styles.card, embedded && styles.cardEmbedded]}>
      <AuthCardTitle variant="appInfo" compact />
      <View style={styles.infoList}>
        <ThemeUnderline />
        {rows.map((item, index) => (
          <Fragment key={item.label}>
            <InfoRow icon={item.icon} label={item.label} value={item.value} />
            {index < rows.length - 1 ? <ThemeUnderline /> : null}
          </Fragment>
        ))}
        <ThemeUnderline />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 8,
    padding: 20,
    borderRadius: 16,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.almondBorder,
  },
  cardEmbedded: {
    marginHorizontal: 0,
    marginTop: 0,
    marginBottom: 0,
    padding: 24,
  },
  infoList: {
    overflow: 'hidden',
  },
  themeUnderline: {
    flexDirection: 'row',
    height: 2,
    width: '100%',
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
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    minHeight: 34,
    paddingHorizontal: 4,
    paddingVertical: 8,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexShrink: 0,
  },
  rowLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.muted,
  },
  rowValue: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: colors.navy,
    textAlign: 'right',
  },
});
