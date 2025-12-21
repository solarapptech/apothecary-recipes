import { useMemo, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

function validatePremiumCode(code: string): string | null {
  const trimmed = code.trim();
  if (trimmed.length === 0) {
    return 'Enter a code.';
  }

  // Realistic placeholder: allow formats like PREMIUM2025 or PREMIUM-2025 or ABCD-1234.
  const normalized = trimmed.toUpperCase();
  const ok =
    /^[A-Z0-9]{6,24}$/.test(normalized) ||
    /^[A-Z0-9]{4,16}-[A-Z0-9]{4,8}$/.test(normalized);

  if (!ok) {
    return 'That code format does not look valid.';
  }

  return null;
}

type PremiumCodeEntryModalProps = {
  visible: boolean;
  onRequestClose: () => void;
  onSubmitCode: (code: string) => void | Promise<void>;
};

type SubmitState = 'idle' | 'loading' | 'success' | 'error';

export function PremiumCodeEntryModal({
  visible,
  onRequestClose,
  onSubmitCode,
}: PremiumCodeEntryModalProps) {
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitState, setSubmitState] = useState<SubmitState>('idle');

  const sanitized = useMemo(() => code.trim(), [code]);

  const handleRequestClose = () => {
    if (submitState === 'loading') {
      return;
    }
    setSubmitState('idle');
    setError(null);
    onRequestClose();
  };

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={handleRequestClose}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Close code entry"
        onPress={handleRequestClose}
        style={styles.backdrop}
        testID="premium-code-entry-backdrop"
      >
        <Pressable style={styles.modal} onPress={() => undefined} testID="premium-code-entry-modal">
          <Text style={styles.title}>Enter Premium Code</Text>
          <Text style={styles.subtitle}>Unlock 1,000 recipes</Text>

          <TextInput
            value={code}
            onChangeText={(value) => {
              setCode(value);
              if (error) {
                setError(null);
              }
              if (submitState === 'error') {
                setSubmitState('idle');
              }
            }}
            placeholder="e.g. PREMIUM2025"
            autoCapitalize="characters"
            accessibilityLabel="Premium code"
            style={styles.input}
            testID="premium-code-entry-input"
          />

          {submitState !== 'idle' ? (
            <View style={styles.resultRow} testID="premium-code-entry-result">
              {submitState === 'loading' ? <ActivityIndicator size="small" /> : null}
              {submitState === 'success' ? (
                <View style={[styles.resultBadge, styles.successBadge]}>
                  <Text style={styles.resultBadgeText}>✓</Text>
                </View>
              ) : null}
              {submitState === 'error' ? (
                <View style={[styles.resultBadge, styles.errorBadge]}>
                  <Text style={styles.resultBadgeText}>✕</Text>
                </View>
              ) : null}
            </View>
          ) : null}

          {error ? (
            <Text style={styles.error} testID="premium-code-entry-error">
              {error}
            </Text>
          ) : null}

          <View style={styles.actions}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Submit code"
              onPress={async () => {
                if (submitState === 'loading' || submitState === 'success') {
                  return;
                }

                const nextError = validatePremiumCode(sanitized);
                if (nextError) {
                  setError(nextError);
                  return;
                }

                setError(null);
                setSubmitState('loading');

                try {
                  await onSubmitCode(sanitized);
                  setSubmitState('success');
                  await new Promise<void>((resolve) => {
                    setTimeout(resolve, 650);
                  });
                  setSubmitState('idle');
                  setError(null);
                  onRequestClose();
                } catch (e) {
                  const message = e instanceof Error ? e.message : 'Failed to redeem code';
                  setError(message);
                  setSubmitState('error');
                }
              }}
              style={styles.primaryButton}
              testID="premium-code-entry-submit"
            >
              <Text style={styles.primaryButtonText}>Unlock</Text>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Cancel"
              onPress={handleRequestClose}
              style={styles.secondaryButton}
              testID="premium-code-entry-cancel"
            >
              <Text style={styles.secondaryButtonText}>Cancel</Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  modal: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#ddd',
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111',
    marginBottom: 4,
  },
  subtitle: {
    color: '#444',
    marginBottom: 10,
  },
  input: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    minHeight: 44,
  },
  resultRow: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 10,
    minHeight: 24,
  },
  resultBadge: {
    height: 24,
    minWidth: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  successBadge: {
    backgroundColor: '#0a7d36',
  },
  errorBadge: {
    backgroundColor: '#b00020',
  },
  resultBadgeText: {
    color: '#fff',
    fontWeight: '800',
  },
  error: {
    marginTop: 8,
    color: '#b00020',
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
