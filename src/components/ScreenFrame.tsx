import { useRef, useState, type ReactNode } from 'react';
import { Keyboard, Platform, Pressable, SafeAreaView, StatusBar, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { theme } from '../ui/theme';

const HEADER_HEIGHT = 56;

type ScreenFrameProps = {
  title: string;
  onBackPress?: () => void;
  onTitlePress?: () => void;
  headerTopBannerText?: string;
  onPressHeaderTopBanner?: () => void;
  headerRight?: ReactNode;
  controls?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
};

export function ScreenFrame({
  title,
  onBackPress,
  onTitlePress,
  headerTopBannerText,
  onPressHeaderTopBanner,
  headerRight,
  controls,
  footer,
  children,
}: ScreenFrameProps) {
  const androidTopInset = Platform.OS === 'android' ? StatusBar.currentHeight ?? 0 : 0;
  const bottomSafeSpace = Platform.OS === 'android' ? 16 : 0;

  const headerAndroidTopInset = headerTopBannerText ? 0 : androidTopInset;

  const window = useWindowDimensions();
  const headerTopBannerHeight = Math.max(36, Math.round(window.height * 0.05));

  const [headerTitleFlashVisible, setHeaderTitleFlashVisible] = useState(false);
  const headerTitleFlashTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  return (
    <SafeAreaView style={styles.container}>
      {headerTopBannerText ? (
        <Pressable
          accessibilityRole={onPressHeaderTopBanner ? 'button' : 'none'}
          accessibilityLabel={onPressHeaderTopBanner ? headerTopBannerText : undefined}
          onPress={onPressHeaderTopBanner}
          disabled={!onPressHeaderTopBanner}
          style={[
            styles.headerTopBanner,
            androidTopInset > 0 ? { paddingTop: androidTopInset, height: headerTopBannerHeight + androidTopInset } : { height: headerTopBannerHeight },
          ]}
          testID="header-top-banner"
        >
          <Text style={styles.headerTopBannerText} numberOfLines={2}>
            {headerTopBannerText}
          </Text>
        </Pressable>
      ) : null}
      <View
        style={[
          styles.header,
          headerAndroidTopInset > 0
            ? {
                paddingTop: headerAndroidTopInset,
                height: HEADER_HEIGHT + headerAndroidTopInset,
              }
            : null,
        ]}
      >
        <Pressable
          accessibilityLabel="Dismiss keyboard"
          onPress={() => {
            Keyboard.dismiss();
          }}
          style={styles.headerBackdrop}
          testID="header-dismiss-keyboard"
        />
        <Pressable
          accessibilityRole={onTitlePress ? 'button' : 'none'}
          accessibilityLabel={onTitlePress ? 'Go to dashboard' : undefined}
          onPress={() => {
            if (!onTitlePress) {
              return;
            }

            setHeaderTitleFlashVisible(true);
            if (headerTitleFlashTimeoutRef.current) {
              clearTimeout(headerTitleFlashTimeoutRef.current);
            }
            headerTitleFlashTimeoutRef.current = setTimeout(() => {
              setHeaderTitleFlashVisible(false);
              headerTitleFlashTimeoutRef.current = null;
            }, 160);

            Keyboard.dismiss();
            onTitlePress();
          }}
          style={styles.headerLeft}
          disabled={!onTitlePress}
          testID={onTitlePress ? 'header-title-button' : undefined}
        >
          {onBackPress ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Back"
              onPress={onBackPress}
              style={styles.backButton}
              testID="header-back-button"
            >
              <Text style={styles.backButtonText}>←</Text>
            </Pressable>
          ) : null}
          <View style={styles.leafIcon} pointerEvents="none">
            <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
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
          <Text style={[styles.title, headerTitleFlashVisible ? styles.titleFlash : null]} numberOfLines={1}>
            {title}
          </Text>
        </Pressable>

        <View style={styles.headerRight}>{headerRight}</View>
      </View>

      {controls ? <View style={styles.controls}>{controls}</View> : null}

      <View style={styles.content}>{children}</View>

      {footer ? (
        <View style={[styles.footer, bottomSafeSpace > 0 ? { paddingBottom: bottomSafeSpace } : null]}>
          {footer}
        </View>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  headerTopBanner: {
    width: '100%',
    backgroundColor: theme.colors.brand.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  headerTopBannerText: {
    fontFamily: theme.typography.fontFamily.sans.medium,
    fontSize: 16,
    lineHeight: 20,
    color: theme.colors.ink.onBrand,
    textAlign: 'center',
  },
  header: {
    height: HEADER_HEIGHT,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
    zIndex: 1,
  },
  leafIcon: {
    marginRight: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    ...theme.typography.headerTitle,
    flexShrink: 1,
  },
  titleFlash: {
    color: 'rgba(107, 112, 91, 0.47)',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    minWidth: 44,
    zIndex: 1,
  },
  backButton: {
    height: 44,
    width: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 4,
  },
  backButtonText: {
    fontSize: 18,
    color: theme.colors.ink.primary,
  },
  controls: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: 8,
    marginBottom: 16,
  },
  content: {
    flex: 1,
  },
  footer: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.colors.border.subtle,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
});
