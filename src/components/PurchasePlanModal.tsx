import { useMemo, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInRight, FadeOutLeft } from 'react-native-reanimated';

import { ModalBackdrop } from './ModalBackdrop';
import { ModalCardBackground } from './ModalCardBackground';
import { theme } from '../ui/theme';

type PurchasePlanModalProps = {
  visible: boolean;
  onRequestClose: () => void;
};

type Step = 'methods' | 'card';

export function PurchasePlanModal({ visible, onRequestClose }: PurchasePlanModalProps) {
  const [step, setStep] = useState<Step>('methods');

  const handleRequestClose = () => {
    setStep('methods');
    onRequestClose();
  };

  const title = useMemo(() => {
    return step === 'card' ? 'Card' : 'Purchase plan';
  }, [step]);

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={handleRequestClose}>
      <ModalBackdrop
        accessibilityRole="button"
        accessibilityLabel="Close purchase"
        onPress={handleRequestClose}
        style={styles.backdrop}
        testID="purchase-plan-backdrop"
      >
        <Pressable style={styles.modal} onPress={() => undefined} testID="purchase-plan-modal">
          <ModalCardBackground style={styles.modalBackground}>
            <View style={styles.headerRow}>
              <Text style={styles.title}>{title}</Text>
              {step === 'card' ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Back"
                  onPress={() => setStep('methods')}
                  style={styles.backInline}
                  testID="purchase-plan-back"
                >
                  <Text style={styles.backInlineText}>Back</Text>
                </Pressable>
              ) : null}
            </View>

            {step === 'methods' ? (
              <Animated.View entering={FadeInRight.duration(160)} exiting={FadeOutLeft.duration(160)}>
                <Text style={styles.subtitle}>Choose a payment option</Text>

                <View style={styles.methods}>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Pay with card"
                    onPress={() => setStep('card')}
                    style={styles.methodButton}
                    testID="purchase-plan-method-card"
                  >
                    <Text style={styles.methodButtonText}>Pay with card</Text>
                    <Text style={styles.methodButtonChevron}>→</Text>
                  </Pressable>
                </View>

                <View style={styles.actions}>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Close"
                    onPress={handleRequestClose}
                    style={styles.secondaryButton}
                    testID="purchase-plan-close"
                  >
                    <Text style={styles.secondaryButtonText}>Close</Text>
                  </Pressable>
                </View>
              </Animated.View>
            ) : (
              <Animated.View entering={FadeInRight.duration(160)} exiting={FadeOutLeft.duration(160)}>
                <Text style={styles.subtitle}>Card information</Text>
                <View style={styles.cardPlaceholder} testID="purchase-plan-card-placeholder">
                  <Text style={styles.placeholderText}>To be added soon.</Text>
                </View>

                <View style={styles.actions}>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Close"
                    onPress={handleRequestClose}
                    style={styles.secondaryButton}
                    testID="purchase-plan-close-from-card"
                  >
                    <Text style={styles.secondaryButtonText}>Close</Text>
                  </Pressable>
                </View>
              </Animated.View>
            )}
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
    borderColor: theme.colors.border.subtle,
    overflow: 'hidden',
  },
  modalBackground: {
    borderRadius: 12,
    padding: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  title: {
    fontSize: 18,
    fontFamily: theme.typography.fontFamily.sans.semiBold,
    color: theme.colors.ink.primary,
  },
  backInline: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border.subtle,
    backgroundColor: theme.colors.surface.paperStrong,
  },
  backInlineText: {
    color: theme.colors.ink.primary,
    fontFamily: theme.typography.fontFamily.sans.semiBold,
  },
  subtitle: {
    marginTop: 8,
    ...theme.typography.bodyMuted,
  },
  methods: {
    marginTop: 14,
    gap: 10,
  },
  methodButton: {
    minHeight: 48,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border.subtle,
    backgroundColor: theme.colors.surface.paperStrong,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  methodButtonText: {
    color: theme.colors.ink.primary,
    fontFamily: theme.typography.fontFamily.sans.semiBold,
    fontSize: 14,
  },
  methodButtonChevron: {
    color: theme.colors.ink.subtle,
    fontSize: 16,
  },
  cardPlaceholder: {
    marginTop: 14,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border.subtle,
    backgroundColor: theme.colors.surface.paperStrong,
    padding: 14,
    minHeight: 110,
    justifyContent: 'center',
  },
  placeholderText: {
    color: theme.colors.ink.muted,
    textAlign: 'center',
    fontFamily: theme.typography.fontFamily.sans.medium,
  },
  actions: {
    marginTop: 14,
    gap: 10,
  },
  secondaryButton: {
    minHeight: 44,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border.subtle,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    backgroundColor: theme.colors.surface.paperStrong,
  },
  secondaryButtonText: {
    color: theme.colors.ink.primary,
    fontFamily: theme.typography.fontFamily.sans.semiBold,
  },
});
