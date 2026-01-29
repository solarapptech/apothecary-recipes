import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { ModalBackdrop } from './ModalBackdrop';
import { ModalCardBackground } from './ModalCardBackground';
import { theme } from '../ui/theme';

type NoFavoritesModalProps = {
  visible: boolean;
  onRequestClose: () => void;
  reduceMotionEnabled?: boolean;
};

export function NoFavoritesModal({
  visible,
  onRequestClose,
  reduceMotionEnabled = false,
}: NoFavoritesModalProps) {
  return (
    <Modal
      transparent
      visible={visible}
      animationType={reduceMotionEnabled ? 'none' : 'fade'}
      onRequestClose={onRequestClose}
    >
      <ModalBackdrop onPress={onRequestClose} style={styles.backdrop} testID="no-favorites-backdrop">
        <View style={styles.modalContainer}>
          <ModalCardBackground style={styles.card}>
            <View style={styles.decorativeLeaf} pointerEvents="none">
              <Svg width={120} height={120} viewBox="0 0 24 24" fill="none">
                <Path
                  d="M20 4C14 4 9.5 6.5 7.2 9.9C5.7 12.1 5 14.7 5 17.5V20H7.5C10.3 20 12.9 19.3 15.1 17.8C18.5 15.5 21 11 21 5V4H20Z"
                  fill={theme.colors.brand.primary}
                />
                <Path
                  d="M6.2 18.3C9.4 14.5 13.1 11.7 18.7 9.6"
                  stroke={theme.colors.ink.onBrand}
                  strokeWidth={1.6}
                  strokeLinecap="round"
                  opacity={0.55}
                />
              </Svg>
            </View>

            <Text style={styles.title}>No Favorites Yet</Text>
            <Text style={styles.message}>
              You haven't added any recipes to your favorites collection. Tap the heart icon on any recipe to save it here for quick access.
            </Text>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Got it"
              onPress={onRequestClose}
              style={styles.button}
              testID="no-favorites-close-button"
            >
              <Text style={styles.buttonText}>Got it</Text>
            </Pressable>
          </ModalCardBackground>
        </View>
      </ModalBackdrop>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border.subtle,
    overflow: 'hidden',
  },
  card: {
    borderRadius: 16,
    padding: 24,
    paddingTop: 32,
    alignItems: 'center',
    overflow: 'hidden',
  },
  decorativeLeaf: {
    position: 'absolute',
    top: -20,
    right: -20,
    opacity: 0.15,
  },
  title: {
    fontFamily: theme.typography.fontFamily.serif.semiBold,
    fontSize: 20,
    lineHeight: 26,
    color: theme.colors.ink.primary,
    textAlign: 'center',
    marginBottom: 12,
  },
  message: {
    fontFamily: theme.typography.fontFamily.sans.regular,
    fontSize: 14,
    lineHeight: 20,
    color: theme.colors.ink.muted,
    textAlign: 'center',
    marginBottom: 24,
  },
  button: {
    width: '100%',
    minHeight: 48,
    borderRadius: 12,
    backgroundColor: theme.colors.brand.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  buttonText: {
    fontFamily: theme.typography.fontFamily.sans.semiBold,
    fontSize: 15,
    color: theme.colors.ink.onBrand,
  },
});
