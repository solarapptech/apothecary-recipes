import { useEffect, type ReactNode } from 'react';
import { ActivityIndicator, BackHandler, Pressable, StyleSheet, Switch, Text, View } from 'react-native';

import { ScreenFrame } from '../components/ScreenFrame';
import { ENABLE_DEV_RESET } from '../config/devFlags';
import { PLAN_RECIPE_COUNTS } from '../config/plans';
import { maskPremiumCode } from '../repositories/preferencesRepository';
import type { PremiumDownloadStatus } from '../repositories/preferencesRepository';
import type { Plan } from '../types/plan';

type SettingsScreenProps = {
  onBackPress: () => void;
  footer?: ReactNode;
  plan: Plan;
  reduceMotionEnabled: boolean;
  onToggleReduceMotionEnabled: (enabled: boolean) => void;
  closeAsYouTapEnabled: boolean;
  onToggleCloseAsYouTapEnabled: (enabled: boolean) => void;
  autoScrollEnabled: boolean;
  onToggleAutoScrollEnabled: (enabled: boolean) => void;
  premiumCode: string | null;
  premiumDownloadStatus: PremiumDownloadStatus;
  premiumDownloadProgress: number | null;
  onPressUpgrade: () => void;
  onPressStartPremiumDownload: () => void;
  onPressPausePremiumDownload: () => void;
  onPressResumePremiumDownload: () => void;
  onPressRetryPremiumDownload: () => void;
  onPressShowPremiumDownload: () => void;
  onPressDevResetPremium: () => void;
};

export function SettingsScreen({
  onBackPress,
  footer,
  plan,
  reduceMotionEnabled,
  onToggleReduceMotionEnabled,
  closeAsYouTapEnabled,
  onToggleCloseAsYouTapEnabled,
  autoScrollEnabled,
  onToggleAutoScrollEnabled,
  premiumCode,
  premiumDownloadStatus,
  premiumDownloadProgress,
  onPressUpgrade,
  onPressStartPremiumDownload,
  onPressPausePremiumDownload,
  onPressResumePremiumDownload,
  onPressRetryPremiumDownload,
  onPressShowPremiumDownload,
  onPressDevResetPremium,
}: SettingsScreenProps) {
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      onBackPress();
      return true;
    });
    return () => backHandler.remove();
  }, [onBackPress]);

  const masked = maskPremiumCode(premiumCode);
  const recipeCount = plan === 'premium' ? PLAN_RECIPE_COUNTS.premium : PLAN_RECIPE_COUNTS.free;

  const animationsEnabled = !reduceMotionEnabled;

  const premiumStatusText =
    premiumDownloadStatus === 'downloading'
      ? `Downloading ${premiumDownloadProgress ?? 0}%`
      : premiumDownloadStatus === 'ready'
        ? 'Ready'
        : premiumDownloadStatus === 'paused'
          ? 'Paused'
          : premiumDownloadStatus === 'failed'
            ? 'Failed'
            : 'Not downloaded';

  return (
    <ScreenFrame title="Settings" onBackPress={onBackPress} footer={footer}>
      <View style={styles.container}>
        <View style={styles.planRow}>
          <View style={styles.planInfo}>
            <Text style={styles.sectionTitle}>Plan</Text>
            <Text style={styles.body} testID="settings-plan-text">
              {plan === 'premium' ? 'Premium' : 'Free'} ({recipeCount} recipes)
            </Text>
          </View>
          {!premiumCode ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Upgrade"
              onPress={onPressUpgrade}
              style={styles.upgradeButton}
              testID="settings-upgrade-button"
            >
              <Text style={styles.upgradeButtonText}>Upgrade</Text>
            </Pressable>
          ) : null}
        </View>

        <Text style={styles.sectionTitle}>Preferences</Text>
        <View style={styles.toggleRow} testID="settings-auto-scroll-row">
          <Text style={styles.body}>Auto-scroll</Text>
          <Switch
            value={autoScrollEnabled}
            onValueChange={onToggleAutoScrollEnabled}
            accessibilityLabel="Auto-scroll"
            testID="settings-auto-scroll-switch"
          />
        </View>

        <View style={styles.toggleRow} testID="settings-animations-row">
          <Text style={styles.body}>Animations</Text>
          <Switch
            value={animationsEnabled}
            onValueChange={(enabled) => onToggleReduceMotionEnabled(!enabled)}
            accessibilityLabel="Animations"
            testID="settings-animations-switch"
          />
        </View>

        <View style={styles.toggleRow} testID="settings-behavior-row">
          <Text style={styles.body}>Close as you tap</Text>
          <Switch
            value={closeAsYouTapEnabled}
            onValueChange={onToggleCloseAsYouTapEnabled}
            accessibilityLabel="Behavior"
            testID="settings-behavior-switch"
          />
        </View>

        {masked ? (
          <Text style={styles.body} testID="settings-code-masked">
            Code: {masked}
          </Text>
        ) : null}

        {plan === 'premium' ? (
          <View style={styles.premiumContentSection}>
            <Text style={styles.sectionTitle}>Premium recipes</Text>
            <View style={styles.premiumStatusRow} testID="settings-premium-download-status">
              <Text style={styles.body}>Status: {premiumStatusText}</Text>
              {premiumDownloadStatus === 'downloading' ? <ActivityIndicator size="small" /> : null}
            </View>

            <View style={styles.actions}>
              {premiumDownloadStatus === 'not-downloaded' ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Download Premium Recipes"
                  onPress={onPressStartPremiumDownload}
                  style={styles.primaryButton}
                  testID="settings-premium-download-start"
                >
                  <View style={styles.primaryButtonRow}>
                    <Text style={styles.primaryButtonText}>Download Premium Recipes</Text>
                  </View>
                </Pressable>
              ) : null}

              {premiumDownloadStatus === 'downloading' ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Pause premium download"
                  onPress={onPressPausePremiumDownload}
                  style={styles.secondaryButton}
                  testID="settings-premium-download-pause"
                >
                  <Text style={styles.secondaryButtonText}>Pause</Text>
                </Pressable>
              ) : null}

              {premiumDownloadStatus === 'paused' ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Resume premium download"
                  onPress={onPressResumePremiumDownload}
                  style={styles.primaryButton}
                  testID="settings-premium-download-resume"
                >
                  <Text style={styles.primaryButtonText}>Resume</Text>
                </Pressable>
              ) : null}

              {premiumDownloadStatus === 'failed' ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Retry premium download"
                  onPress={onPressRetryPremiumDownload}
                  style={styles.primaryButton}
                  testID="settings-premium-download-retry"
                >
                  <Text style={styles.primaryButtonText}>Retry</Text>
                </Pressable>
              ) : null}

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Show premium download"
                onPress={onPressShowPremiumDownload}
                style={styles.secondaryButton}
                testID="settings-premium-download-show"
              >
                <Text style={styles.secondaryButtonText}>Show download</Text>
              </Pressable>
            </View>

            {(__DEV__ || ENABLE_DEV_RESET) && premiumCode ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Reset premium (dev)"
                onPress={onPressDevResetPremium}
                style={styles.dangerButton}
                testID="settings-premium-dev-reset"
              >
                <Text style={styles.dangerButtonText}>Reset Premium (dev)</Text>
              </Pressable>
            ) : null}
          </View>
        ) : null}
      </View>
    </ScreenFrame>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 10,
  },
  dangerButton: {
    minHeight: 44,
    borderRadius: 10,
    backgroundColor: '#7f1d1d',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  dangerButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
  toggleRow: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  planRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  planInfo: {
    flex: 1,
    gap: 4,
  },
  upgradeButton: {
    minHeight: 44,
    borderRadius: 10,
    backgroundColor: '#111',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  upgradeButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  premiumContentSection: {
    marginTop: 10,
    gap: 10,
  },
  premiumStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111',
  },
  body: {
    color: '#444',
  },
  actions: {
    marginTop: 10,
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
  primaryButtonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
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
