import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { MONETAG_SMART_LINK } from '../utils/constants';
import colors from '../theme/colors';

const CLOSE_DELAY_MS = 15000;

export default function MonetagAdView({ visible = true, onClose }) {
  const [canClose, setCanClose] = useState(false);

  useEffect(() => {
    if (!visible) {
      setCanClose(false);
      return undefined;
    }

    setCanClose(false);
    const timer = setTimeout(() => setCanClose(true), CLOSE_DELAY_MS);
    return () => clearTimeout(timer);
  }, [visible]);

  if (!visible) {
    return null;
  }

  const handleClose = () => {
    if (canClose) {
      onClose?.();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.backdrop}>
        <View style={styles.modalCard}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Advertisement</Text>
            {canClose ? (
              <Pressable
                onPress={handleClose}
                style={styles.closeBtn}
                accessibilityRole="button"
                accessibilityLabel="Close advertisement"
              >
                <Text style={styles.closeBtnText}>Close Ad ✕</Text>
              </Pressable>
            ) : null}
          </View>
          <View style={styles.webviewWrap}>
            <WebView
              source={{ uri: MONETAG_SMART_LINK }}
              style={styles.webview}
              startInLoadingState
              renderLoading={() => (
                <View style={styles.loadingWrap}>
                  <ActivityIndicator size="large" color={colors.redOrange} />
                </View>
              )}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(30, 61, 89, 0.72)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 420,
    height: '78%',
    maxHeight: 640,
    backgroundColor: colors.almond,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: colors.almondBorder,
    overflow: 'hidden',
    shadowColor: colors.navy,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.almondBorder,
    backgroundColor: colors.navy,
    minHeight: 48,
  },
  headerTitle: {
    color: colors.almond,
    fontWeight: '600',
    fontSize: 14,
  },
  closeBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: colors.redOrange,
  },
  closeBtnText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 14,
  },
  webviewWrap: {
    flex: 1,
  },
  webview: {
    flex: 1,
    backgroundColor: colors.almond,
  },
  loadingWrap: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.almond,
  },
});
