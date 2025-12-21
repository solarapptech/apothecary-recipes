import type { ReactNode } from 'react';
import { Platform, Pressable, SafeAreaView, StatusBar, StyleSheet, Text, View } from 'react-native';

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
    backgroundColor: '#fff',
  },
  header: {
    height: HEADER_HEIGHT,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111',
    flexShrink: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    minWidth: 44,
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
    color: '#111',
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
    borderTopColor: '#ddd',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
});
