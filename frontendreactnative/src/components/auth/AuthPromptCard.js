import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { AuthCardLogo } from '../navigation/HeaderBrandLogo';
import AuthCardTitle from './AuthCardTitle';
import colors from '../../theme/colors';

export default function AuthPromptCard({
  variant = 'favorites',
  message,
  primaryLabel = 'Sign In',
  onPrimaryPress,
  secondaryPrefix,
  secondaryActionLabel,
  onSecondaryPress,
  footer,
}) {
  return (
    <ScrollView
      contentContainerStyle={[styles.container, footer && styles.containerWithFooter]}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.card}>
        <AuthCardLogo />
        <AuthCardTitle variant={variant} />
        {message ? <Text style={styles.message}>{message}</Text> : null}
        <Pressable style={styles.button} onPress={onPrimaryPress}>
          <Text style={styles.buttonText}>{primaryLabel}</Text>
        </Pressable>
        {secondaryActionLabel ? (
          <Pressable onPress={onSecondaryPress}>
            <Text style={styles.link}>
              {secondaryPrefix}{' '}
              <Text style={styles.linkBold}>{secondaryActionLabel}</Text>
            </Text>
          </Pressable>
        ) : null}
      </View>
      {footer ? <View style={styles.footer}>{footer}</View> : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'stretch',
    padding: 16,
    backgroundColor: colors.almond,
  },
  containerWithFooter: {
    justifyContent: 'flex-start',
    paddingTop: 24,
    paddingBottom: 32,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.almondBorder,
    padding: 24,
    width: '100%',
  },
  footer: {
    marginTop: 16,
    width: '100%',
  },
  message: {
    color: colors.muted,
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 20,
  },
  button: {
    backgroundColor: colors.redOrange,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 16,
  },
  link: {
    marginTop: 20,
    textAlign: 'center',
    color: colors.muted,
    fontSize: 14,
  },
  linkBold: {
    color: colors.redOrange,
    fontWeight: '600',
  },
});
