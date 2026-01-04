import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { PLAN_RECIPE_COUNTS } from '../config/plans';
import { ModalCardBackground } from './ModalCardBackground';
import { ModalBackdrop } from './ModalBackdrop';

type PremiumPaywallModalProps = {
  visible: boolean;
  onRequestClose: () => void;
  onPressEnterCode: () => void;
};

export function PremiumPaywallModal({
  visible,
  onRequestClose,
  onPressEnterCode,
}: PremiumPaywallModalProps) {
  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onRequestClose}>
      <ModalBackdrop
        accessibilityRole="button"
        accessibilityLabel="Close upgrade prompt"
        onPress={onRequestClose}
        style={styles.backdrop}
        testID="premium-paywall-backdrop"
      >
        <Pressable style={styles.modal} onPress={() => undefined} testID="premium-paywall-modal">
          <ModalCardBackground style={styles.modalBackground}>
            <Text style={styles.title}>Upgrade to Premium</Text>
            <Text style={styles.body}>
              Free: {PLAN_RECIPE_COUNTS.free} recipes{`\n`}Premium: {PLAN_RECIPE_COUNTS.premium} recipes
            </Text>

            <View style={styles.actions}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Enter premium code"
                onPress={onPressEnterCode}
                style={styles.primaryButton}
                testID="premium-paywall-enter-code"
              >
                <Text style={styles.primaryButtonText}>Enter code</Text>
              </Pressable>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Close"
                onPress={onRequestClose}
                style={styles.secondaryButton}
                testID="premium-paywall-close"
              >
                <Text style={styles.secondaryButtonText}>Not now</Text>
              </Pressable>
            </View>
          </ModalCardBackground>
        </Pressable>
      </ModalBackdrop>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  modal: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#ddd',
    overflow: 'hidden',
  },
  modalBackground: {
    borderRadius: 12,
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111',
    marginBottom: 8,
  },
  body: {
    fontSize: 14,
    color: '#444',
    lineHeight: 20,
  },
  actions: {
    marginTop: 14,
    gap: 10,
  },
  primaryButton: {
    minHeight: 44,
    borderRadius: 10,
    backgroundColor: '#111',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  secondaryButton: {
    minHeight: 44,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#ddd',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  secondaryButtonText: {
    color: '#111',
    fontWeight: '500',
  },
});
