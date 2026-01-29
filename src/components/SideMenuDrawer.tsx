import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  BackHandler,
  Dimensions,
  Modal,
  Platform,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { theme } from '../ui/theme';

const DRAWER_WIDTH = Math.min(300, Dimensions.get('window').width * 0.8);
const ANIMATION_DURATION = 280;

type MenuItem = {
  id: string;
  label: string;
  icon: 'home' | 'premium' | 'categories' | 'favorites' | 'settings' | 'about';
  onPress: () => void;
};

type SideMenuDrawerProps = {
  visible: boolean;
  onRequestClose: () => void;
  menuItems: MenuItem[];
  appTitle?: string;
  reduceMotionEnabled?: boolean;
};

function MenuIcon({ name, size = 22, color }: { name: MenuItem['icon']; size?: number; color: string }) {
  switch (name) {
    case 'home':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path
            d="M3 9.5L12 3L21 9.5V20C21 20.55 20.55 21 20 21H4C3.45 21 3 20.55 3 20V9.5Z"
            stroke={color}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Path
            d="M9 21V12H15V21"
            stroke={color}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      );
    case 'premium':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path
            d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
            stroke={color}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      );
    case 'categories':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path
            d="M10 3H3V10H10V3Z"
            stroke={color}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Path
            d="M21 3H14V10H21V3Z"
            stroke={color}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Path
            d="M21 14H14V21H21V14Z"
            stroke={color}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Path
            d="M10 14H3V21H10V14Z"
            stroke={color}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      );
    case 'favorites':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path
            d="M20.84 4.61C20.33 4.1 19.72 3.7 19.05 3.42C18.38 3.14 17.66 3 16.93 3C16.2 3 15.48 3.14 14.81 3.42C14.14 3.7 13.53 4.1 13.02 4.61L12 5.64L10.98 4.61C9.95 3.58 8.57 3 7.13 3C5.69 3 4.31 3.58 3.28 4.61C2.25 5.64 1.67 7.02 1.67 8.46C1.67 9.9 2.25 11.28 3.28 12.31L4.3 13.33L12 21.03L19.7 13.33L20.72 12.31C21.23 11.8 21.63 11.19 21.91 10.52C22.19 9.85 22.33 9.13 22.33 8.4C22.33 7.67 22.19 6.95 21.91 6.28C21.63 5.61 21.23 5 20.72 4.49L20.84 4.61Z"
            stroke={color}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      );
    case 'settings':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path
            d="M12 15C13.66 15 15 13.66 15 12C15 10.34 13.66 9 12 9C10.34 9 9 10.34 9 12C9 13.66 10.34 15 12 15Z"
            stroke={color}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Path
            d="M19.4 15C19.28 15.3 19.25 15.63 19.3 15.95C19.36 16.27 19.5 16.56 19.71 16.8L19.79 16.88C19.96 17.05 20.09 17.25 20.18 17.47C20.27 17.69 20.32 17.93 20.32 18.17C20.32 18.41 20.27 18.65 20.18 18.87C20.09 19.09 19.96 19.29 19.79 19.46C19.62 19.63 19.42 19.76 19.2 19.85C18.98 19.94 18.74 19.99 18.5 19.99C18.26 19.99 18.02 19.94 17.8 19.85C17.58 19.76 17.38 19.63 17.21 19.46L17.13 19.38C16.89 19.17 16.6 19.03 16.28 18.97C15.96 18.92 15.63 18.95 15.33 19.07C15.04 19.18 14.78 19.37 14.6 19.62C14.41 19.87 14.3 20.17 14.28 20.48L14.28 20.67C14.28 21.16 14.09 21.63 13.75 21.97C13.41 22.31 12.94 22.5 12.45 22.5C11.96 22.5 11.49 22.31 11.15 21.97C10.81 21.63 10.62 21.16 10.62 20.67V20.56C10.59 20.24 10.46 19.93 10.26 19.68C10.06 19.43 9.78 19.25 9.47 19.15C9.17 19.03 8.84 19 8.52 19.05C8.2 19.11 7.91 19.25 7.67 19.46L7.59 19.54C7.42 19.71 7.22 19.84 7 19.93C6.78 20.02 6.54 20.07 6.3 20.07C6.06 20.07 5.82 20.02 5.6 19.93C5.38 19.84 5.18 19.71 5.01 19.54C4.84 19.37 4.71 19.17 4.62 18.95C4.53 18.73 4.48 18.49 4.48 18.25C4.48 18.01 4.53 17.77 4.62 17.55C4.71 17.33 4.84 17.13 5.01 16.96L5.09 16.88C5.3 16.64 5.44 16.35 5.49 16.03C5.55 15.71 5.52 15.38 5.4 15.08C5.29 14.79 5.1 14.53 4.85 14.35C4.6 14.16 4.3 14.05 3.99 14.03H3.8C3.31 14.03 2.84 13.84 2.5 13.5C2.16 13.16 1.97 12.69 1.97 12.2C1.97 11.71 2.16 11.24 2.5 10.9C2.84 10.56 3.31 10.37 3.8 10.37H3.91C4.23 10.34 4.54 10.21 4.79 10.01C5.04 9.81 5.22 9.53 5.32 9.22C5.44 8.92 5.47 8.59 5.42 8.27C5.36 7.95 5.22 7.66 5.01 7.42L4.93 7.34C4.76 7.17 4.63 6.97 4.54 6.75C4.45 6.53 4.4 6.29 4.4 6.05C4.4 5.81 4.45 5.57 4.54 5.35C4.63 5.13 4.76 4.93 4.93 4.76C5.1 4.59 5.3 4.46 5.52 4.37C5.74 4.28 5.98 4.23 6.22 4.23C6.46 4.23 6.7 4.28 6.92 4.37C7.14 4.46 7.34 4.59 7.51 4.76L7.59 4.84C7.83 5.05 8.12 5.19 8.44 5.24C8.76 5.3 9.09 5.27 9.39 5.15H9.47C9.76 5.04 10.02 4.85 10.2 4.6C10.39 4.35 10.5 4.05 10.52 3.74V3.55C10.52 3.06 10.71 2.59 11.05 2.25C11.39 1.91 11.86 1.72 12.35 1.72C12.84 1.72 13.31 1.91 13.65 2.25C13.99 2.59 14.18 3.06 14.18 3.55V3.66C14.2 3.97 14.31 4.27 14.5 4.52C14.68 4.77 14.94 4.96 15.23 5.07C15.53 5.19 15.86 5.22 16.18 5.17C16.5 5.11 16.79 4.97 17.03 4.76L17.11 4.68C17.28 4.51 17.48 4.38 17.7 4.29C17.92 4.2 18.16 4.15 18.4 4.15C18.64 4.15 18.88 4.2 19.1 4.29C19.32 4.38 19.52 4.51 19.69 4.68C19.86 4.85 19.99 5.05 20.08 5.27C20.17 5.49 20.22 5.73 20.22 5.97C20.22 6.21 20.17 6.45 20.08 6.67C19.99 6.89 19.86 7.09 19.69 7.26L19.61 7.34C19.4 7.58 19.26 7.87 19.21 8.19C19.15 8.51 19.18 8.84 19.3 9.14V9.22C19.41 9.51 19.6 9.77 19.85 9.95C20.1 10.14 20.4 10.25 20.71 10.27H20.9C21.39 10.27 21.86 10.46 22.2 10.8C22.54 11.14 22.73 11.61 22.73 12.1C22.73 12.59 22.54 13.06 22.2 13.4C21.86 13.74 21.39 13.93 20.9 13.93H20.79C20.48 13.95 20.18 14.06 19.93 14.25C19.68 14.43 19.49 14.69 19.38 14.98L19.4 15Z"
            stroke={color}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      );
    case 'about':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path
            d="M12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22Z"
            stroke={color}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Path d="M12 16V12" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
          <Path d="M12 8H12.01" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      );
    default:
      return null;
  }
}

export function SideMenuDrawer({
  visible,
  onRequestClose,
  menuItems,
  appTitle = 'Forgotten Home Apothecary',
  reduceMotionEnabled = false,
}: SideMenuDrawerProps) {
  const slideAnim = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;
  const isFirstRender = useRef(true);
  const [shouldRender, setShouldRender] = useState(visible);

  const androidTopInset = Platform.OS === 'android' ? StatusBar.currentHeight ?? 0 : 0;

  useEffect(() => {
    if (visible) {
      setShouldRender(true);
    }
  }, [visible]);

  useEffect(() => {
    if (!shouldRender) {
      return;
    }

    if (visible) {
      if (isFirstRender.current) {
        slideAnim.setValue(-DRAWER_WIDTH);
        backdropAnim.setValue(0);
        isFirstRender.current = false;
      }

      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: reduceMotionEnabled ? 0 : ANIMATION_DURATION,
          useNativeDriver: true,
        }),
        Animated.timing(backdropAnim, {
          toValue: 1,
          duration: reduceMotionEnabled ? 0 : ANIMATION_DURATION,
          useNativeDriver: true,
        }),
      ]).start();
      return;
    }

    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -DRAWER_WIDTH,
        duration: reduceMotionEnabled ? 0 : ANIMATION_DURATION,
        useNativeDriver: true,
      }),
      Animated.timing(backdropAnim, {
        toValue: 0,
        duration: reduceMotionEnabled ? 0 : ANIMATION_DURATION,
        useNativeDriver: true,
      }),
    ]).start(() => {
      slideAnim.setValue(-DRAWER_WIDTH);
      backdropAnim.setValue(0);
      setShouldRender(false);
    });
  }, [visible, shouldRender, slideAnim, backdropAnim, reduceMotionEnabled]);

  useEffect(() => {
    if (!visible) {
      return;
    }

    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      onRequestClose();
      return true;
    });

    return () => subscription.remove();
  }, [visible, onRequestClose]);

  if (!shouldRender) {
    return null;
  }

  return (
    <Modal transparent visible={shouldRender} animationType="none" onRequestClose={onRequestClose}>
      <View style={styles.container}>
        <Animated.View
          style={[
            styles.backdrop,
            {
              opacity: backdropAnim,
            },
          ]}
        >
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={onRequestClose}
            accessibilityRole="button"
            accessibilityLabel="Close menu"
            testID="side-menu-backdrop"
          />
        </Animated.View>

        <Animated.View
          style={[
            styles.drawer,
            { width: DRAWER_WIDTH, transform: [{ translateX: slideAnim }] },
            androidTopInset > 0 ? { paddingTop: androidTopInset } : null,
          ]}
        >
          <View style={styles.header}>
            <View style={styles.headerLeaf}>
              <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
                <Path
                  d="M20 4C14 4 9.5 6.5 7.2 9.9C5.7 12.1 5 14.7 5 17.5V20H7.5C10.3 20 12.9 19.3 15.1 17.8C18.5 15.5 21 11 21 5V4H20Z"
                  fill={theme.colors.ink.onBrand}
                />
                <Path
                  d="M6.2 18.3C9.4 14.5 13.1 11.7 18.7 9.6"
                  stroke={theme.colors.brand.primary}
                  strokeWidth={1.6}
                  strokeLinecap="round"
                  opacity={0.55}
                />
              </Svg>
            </View>
            <Text style={styles.headerTitle} numberOfLines={2}>
              {appTitle}
            </Text>
          </View>

          <View style={styles.menuList}>
            {menuItems.map((item, index) => (
              <Pressable
                key={item.id}
                accessibilityRole="button"
                accessibilityLabel={item.label}
                onPress={() => {
                  item.onPress();
                }}
                style={({ pressed }) => [
                  styles.menuItem,
                  index === 0 && styles.menuItemFirst,
                  pressed && styles.menuItemPressed,
                ]}
                testID={`side-menu-item-${item.id}`}
              >
                <MenuIcon name={item.icon} color={theme.colors.ink.primary} />
                <Text style={styles.menuItemLabel}>{item.label}</Text>
              </Pressable>
            ))}
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Made with 🌿 for herbalists</Text>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: theme.colors.backdrop.modal,
  },
  drawer: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    backgroundColor: theme.colors.surface.paperStrong,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 16,
    shadowOffset: { width: 4, height: 0 },
    elevation: 16,
  },
  header: {
    backgroundColor: theme.colors.brand.primary,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerLeaf: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    fontFamily: theme.typography.fontFamily.serif.semiBold,
    fontSize: 18,
    lineHeight: 22,
    color: theme.colors.ink.onBrand,
  },
  menuList: {
    flex: 1,
    paddingTop: 12,
    paddingHorizontal: 12,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 4,
  },
  menuItemFirst: {
    backgroundColor: theme.colors.brand.moreInfoGreen,
  },
  menuItemPressed: {
    backgroundColor: theme.colors.surface.secondaryField,
  },
  menuItemLabel: {
    fontFamily: theme.typography.fontFamily.sans.medium,
    fontSize: 15,
    color: theme.colors.ink.primary,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.colors.border.subtle,
  },
  footerText: {
    fontFamily: theme.typography.fontFamily.sans.regular,
    fontSize: 12,
    color: theme.colors.ink.muted,
    textAlign: 'center',
  },
});
