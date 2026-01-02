import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import type { PremiumDownloadStatus } from '../repositories/preferencesRepository';

type PremiumDownloadModalProps = {
  visible: boolean;
  status: PremiumDownloadStatus;
  progress: number | null;
  errorMessage?: string | null;
  onRequestClose: () => void;
  onPressStart: () => void;
  onPressPause: () => void;
  onPressResume: () => void;
  onPressRetry: () => void;
};

function formatStatus(status: PremiumDownloadStatus, progress: number | null): string {
  if (status === 'downloading') {
    if (typeof progress === 'number') {
      return `Downloading… ${progress}%`;
    }
    return 'Downloading…';
  }

  if (status === 'ready') {
    return 'Ready (downloaded)';
  }

  if (status === 'not-downloaded') {
    return 'Not downloaded';
  }

  if (status === 'paused') {
    return 'Paused';
  }

  return 'Download failed';
}

export function PremiumDownloadModal({
  visible,
  status,
  progress,
  errorMessage,
  onRequestClose,
  onPressStart,
  onPressPause,
  onPressResume,
  onPressRetry,
}: PremiumDownloadModalProps) {
  const statusText = formatStatus(status, progress);
  const trimmedError = errorMessage?.trim();

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onRequestClose}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Close download status"
        onPress={onRequestClose}
        style={styles.backdrop}
        testID="premium-download-backdrop"
      >
        <Pressable style={styles.modal} onPress={() => undefined} testID="premium-download-modal">
          <Text style={styles.title}>Premium content download</Text>
          <Text style={styles.body} testID="premium-download-status-text">
            {statusText}
          </Text>

          {status === 'failed' && trimmedError ? (
            <Text style={styles.errorText} testID="premium-download-error-text">
              {trimmedError}
            </Text>
          ) : null}

          <View style={styles.actions}>
            {status === 'not-downloaded' ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Start premium content download"
                onPress={onPressStart}
                style={styles.primaryButton}
                testID="premium-download-start"
              >
                <Text style={styles.primaryButtonText}>Start download</Text>
              </Pressable>
            ) : null}

            {status === 'downloading' ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Pause premium content download"
                onPress={onPressPause}
                style={styles.secondaryButton}
                testID="premium-download-pause"
              >
                <Text style={styles.secondaryButtonText}>Pause</Text>
              </Pressable>
            ) : null}

            {status === 'paused' ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Resume premium content download"
                onPress={onPressResume}
                style={styles.primaryButton}
                testID="premium-download-resume"
              >
                <Text style={styles.primaryButtonText}>Resume</Text>
              </Pressable>
            ) : null}

            {status === 'failed' ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Retry premium content download"
                onPress={onPressRetry}
                style={styles.primaryButton}
                testID="premium-download-retry"
              >
                <Text style={styles.primaryButtonText}>Retry</Text>
              </Pressable>
            ) : null}

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close"
              onPress={onRequestClose}
              style={styles.secondaryButton}
              testID="premium-download-close"
            >
              <Text style={styles.secondaryButtonText}>Close</Text>
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
    marginBottom: 8,
  },
  body: {
    fontSize: 14,
    color: '#444',
    lineHeight: 20,
  },
  errorText: {
    marginTop: 10,
    fontSize: 13,
    color: '#8b0000',
    lineHeight: 18,
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
