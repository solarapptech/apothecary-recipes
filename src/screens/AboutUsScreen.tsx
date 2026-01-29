import { Platform, Pressable, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { theme } from '../ui/theme';

const HEADER_HEIGHT = 56;

type AboutUsScreenProps = {
  onBackPress: () => void;
};

export function AboutUsScreen({ onBackPress }: AboutUsScreenProps) {
  const androidTopInset = Platform.OS === 'android' ? StatusBar.currentHeight ?? 0 : 0;

  return (
    <SafeAreaView style={styles.container}>
      <View
        style={[
          styles.header,
          androidTopInset > 0 ? { paddingTop: androidTopInset, height: HEADER_HEIGHT + androidTopInset } : null,
        ]}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back"
          onPress={onBackPress}
          style={styles.backButton}
          testID="about-back-button"
        >
          <Text style={styles.backButtonText}>←</Text>
        </Pressable>
        <Text style={styles.headerTitle}>About Us</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroSection}>
          <View style={styles.logoContainer}>
            <Svg width={64} height={64} viewBox="0 0 24 24" fill="none">
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
          <Text style={styles.appName}>Forgotten Home Apothecary</Text>
          <Text style={styles.tagline}>Rediscovering Nature's Wisdom</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Our Story</Text>
          <Text style={styles.paragraph}>
            Welcome to Forgotten Home Apothecary! We're passionate about preserving and sharing the timeless wisdom of herbal remedies that our ancestors relied upon for generations.
          </Text>
          <Text style={styles.paragraph}>
            Our collection features carefully researched recipes from historical sources, traditional herbal practices, and time-tested home remedies. Each recipe has been thoughtfully compiled to help you explore the fascinating world of natural wellness.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What We Offer</Text>
          <Text style={styles.paragraph}>
            From soothing tinctures and healing salves to aromatic herbal teas and traditional elixirs, our growing library includes hundreds of recipes spanning centuries of herbal knowledge. Whether you're a curious beginner or an experienced herbalist, you'll find something to inspire your journey.
          </Text>
        </View>

        <View style={styles.disclaimerSection}>
          <View style={styles.disclaimerHeader}>
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
              <Path
                d="M12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22Z"
                stroke={theme.colors.ink.muted}
                strokeWidth={2}
              />
              <Path d="M12 8V12" stroke={theme.colors.ink.muted} strokeWidth={2} strokeLinecap="round" />
              <Path d="M12 16H12.01" stroke={theme.colors.ink.muted} strokeWidth={2} strokeLinecap="round" />
            </Svg>
            <Text style={styles.disclaimerTitle}>Important Disclaimer</Text>
          </View>
          <Text style={styles.disclaimerText}>
            The recipes and information provided in this app are for educational and historical purposes only. They are not intended to diagnose, treat, cure, or prevent any disease or health condition.
          </Text>
          <Text style={styles.disclaimerText}>
            Always consult with a qualified healthcare professional before using any herbal remedy, especially if you are pregnant, nursing, taking medications, or have any medical conditions. Some herbs may interact with medications or cause allergic reactions.
          </Text>
          <Text style={styles.disclaimerText}>
            The creators of this app are not responsible for any adverse effects or consequences resulting from the use of any recipes or suggestions herein. Use all information at your own discretion and risk.
          </Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Made with 🌿 for herbalists everywhere</Text>
          <Text style={styles.versionText}>Version 1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  header: {
    height: HEADER_HEIGHT,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    height: 44,
    width: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonText: {
    fontSize: 18,
    color: theme.colors.ink.primary,
  },
  headerTitle: {
    ...theme.typography.headerTitle,
  },
  headerSpacer: {
    width: 44,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  heroSection: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: theme.colors.brand.moreInfoGreen,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  appName: {
    fontFamily: theme.typography.fontFamily.serif.bold,
    fontSize: 24,
    lineHeight: 30,
    color: theme.colors.ink.primary,
    textAlign: 'center',
    marginBottom: 8,
  },
  tagline: {
    fontFamily: theme.typography.fontFamily.sans.medium,
    fontSize: 14,
    color: theme.colors.brand.primary,
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontFamily: theme.typography.fontFamily.serif.semiBold,
    fontSize: 18,
    lineHeight: 24,
    color: theme.colors.ink.primary,
    marginBottom: 12,
  },
  paragraph: {
    fontFamily: theme.typography.fontFamily.sans.regular,
    fontSize: 15,
    lineHeight: 22,
    color: theme.colors.ink.muted,
    marginBottom: 12,
  },
  disclaimerSection: {
    backgroundColor: theme.colors.surface.secondaryField,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  disclaimerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  disclaimerTitle: {
    fontFamily: theme.typography.fontFamily.sans.semiBold,
    fontSize: 14,
    color: theme.colors.ink.primary,
  },
  disclaimerText: {
    fontFamily: theme.typography.fontFamily.sans.regular,
    fontSize: 13,
    lineHeight: 19,
    color: theme.colors.ink.muted,
    marginBottom: 10,
  },
  footer: {
    alignItems: 'center',
    paddingTop: 16,
    paddingBottom: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.colors.border.subtle,
  },
  footerText: {
    fontFamily: theme.typography.fontFamily.sans.regular,
    fontSize: 13,
    color: theme.colors.ink.muted,
    marginBottom: 4,
  },
  versionText: {
    fontFamily: theme.typography.fontFamily.sans.regular,
    fontSize: 12,
    color: theme.colors.ink.subtle,
  },
});
