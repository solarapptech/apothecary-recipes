import type { ReactNode } from 'react';
import { Keyboard, Platform, Pressable, SafeAreaView, StatusBar, StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { theme } from '../ui/theme';

const HEADER_HEIGHT = 56;

type ScreenFrameProps = {
  title: string;
  onBackPress?: () => void;
  headerRight?: ReactNode;
  controls?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
};

export function ScreenFrame({
  title,
  onBackPress,
  headerRight,
  controls,
  footer,
  children,
}: ScreenFrameProps) {
  const androidTopInset = Platform.OS === 'android' ? StatusBar.currentHeight ?? 0 : 0;
  const bottomSafeSpace = Platform.OS === 'android' ? 16 : 0;

  return (
    <SafeAreaView style={styles.container}>
      <View
        style={[
          styles.header,
          androidTopInset > 0
            ? {
                paddingTop: androidTopInset,
                height: HEADER_HEIGHT + androidTopInset,
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
        <View style={styles.headerLeft}>
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
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
        </View>

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
