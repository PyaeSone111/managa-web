import { Image, ImageBackground, Pressable, StyleSheet, Text, View } from 'react-native';
import { useBranding } from '../context/BrandingContext';
import colors from '../theme/colors';

export default function HeroBanner({ onBrowsePress }) {
  const { heroBackgroundUrl, heroImageUrl } = useBranding();
  const hasBg = Boolean(heroBackgroundUrl);

  const content = (
    <View style={styles.overlay}>
      <View style={styles.textBlock}>
        <Text style={styles.title}>Discover New Stories</Text>
        <Text style={styles.subtitle}>
          Read the latest manga, manhwa, and manhua. New releases added weekly.
        </Text>
        <Pressable onPress={onBrowsePress} style={styles.button}>
          <Text style={styles.buttonText}>Browse All</Text>
        </Pressable>
      </View>
      {/* {heroImageUrl ? (
        <Image source={{ uri: heroImageUrl }} style={styles.heroImage} resizeMode="cover" />
      ) : null} */}
    </View>
  );

  if (hasBg) {
    return (
      <ImageBackground source={{ uri: heroBackgroundUrl }} style={styles.banner} imageStyle={styles.bgImage}>
        <View style={styles.bgOverlay}>{content}</View>
      </ImageBackground>
    );
  }

  return <View style={[styles.banner, styles.bannerSolid]}>{content}</View>;
}

const styles = StyleSheet.create({
  banner: {
    minHeight: 200,
    borderBottomWidth: 1,
    borderBottomColor: colors.almondBorder,
  },
  bannerSolid: {
    backgroundColor: colors.navy,
  },
  bgImage: {
    resizeMode: 'cover',
  },
  bgOverlay: {
    flex: 1,
    backgroundColor: `${colors.navy}B3`,
    padding: 20,
  },
  overlay: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    gap: 16,
  },
  textBlock: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.white,
  },
  subtitle: {
    marginTop: 8,
    fontSize: 14,
    color: `${colors.almond}E6`,
    lineHeight: 20,
  },
  button: {
    marginTop: 16,
    alignSelf: 'flex-start',
    backgroundColor: colors.redOrange,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
  },
  buttonText: {
    color: colors.white,
    fontWeight: '600',
    fontSize: 14,
  },
  heroImage: {
    width: 96,
    height: 96,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
});
