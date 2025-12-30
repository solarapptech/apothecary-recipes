import type { ReactNode } from 'react';
import { useRef } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  Extrapolate,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { motionDurationMs } from '../app/motionPolicy';
import { theme } from '../ui/theme';

type WavePressableProps = {
  children: ReactNode;
  onPress?: (event?: any) => void;
  style?: any;
  testID?: string;
  accessibilityRole?: any;
  accessibilityLabel?: string;
  disabled?: boolean;
  reduceMotionEnabled?: boolean;
};

export function WavePressable({
  children,
  onPress,
  style,
  testID,
  accessibilityRole,
  accessibilityLabel,
  disabled,
  reduceMotionEnabled = false,
}: WavePressableProps) {
  const layoutRef = useRef({ width: 0, height: 0 });

  const originX = useSharedValue(0);
  const originY = useSharedValue(0);
  const diameter = useSharedValue(0);
  const progress = useSharedValue(0);

  const triggerWave = (event?: any) => {
    if (reduceMotionEnabled) {
      onPress?.(event);
      return;
    }

    const { width, height } = layoutRef.current;
    if (width <= 0 || height <= 0) {
      onPress?.(event);
      return;
    }

    const x = typeof event?.nativeEvent?.locationX === 'number' ? event.nativeEvent.locationX : width / 2;
    const y = typeof event?.nativeEvent?.locationY === 'number' ? event.nativeEvent.locationY : height / 2;

    const distTL = Math.hypot(x - 0, y - 0);
    const distTR = Math.hypot(x - width, y - 0);
    const distBL = Math.hypot(x - 0, y - height);
    const distBR = Math.hypot(x - width, y - height);
    const radius = Math.max(distTL, distTR, distBL, distBR);

    originX.value = x;
    originY.value = y;
    diameter.value = radius * 2;

    progress.value = 0;
    progress.value = withTiming(1, { duration: motionDurationMs(reduceMotionEnabled, 320) }, () => {
      progress.value = 0;
    });

    onPress?.(event);
  };

  const waveStyle = useAnimatedStyle(() => {
    if (progress.value <= 0 || diameter.value <= 0) {
      return {
        opacity: 0,
      };
    }

    const scale = interpolate(progress.value, [0, 1], [0.15, 1], Extrapolate.CLAMP);
    const opacity = interpolate(progress.value, [0, 0.2, 1], [0.32, 0.22, 0], Extrapolate.CLAMP);

    const size = diameter.value;
    const radius = size / 2;

    return {
      opacity,
      transform: [{ scale }],
      width: size,
      height: size,
      borderRadius: radius,
      left: originX.value - radius,
      top: originY.value - radius,
    };
  });

  return (
    <Pressable
      testID={testID}
      accessibilityRole={accessibilityRole}
      accessibilityLabel={accessibilityLabel}
      style={style}
      disabled={disabled}
      onLayout={(e) => {
        layoutRef.current = {
          width: e.nativeEvent.layout.width,
          height: e.nativeEvent.layout.height,
        };
      }}
      onPress={(e) => triggerWave(e)}
    >
      {children}
      <View style={styles.overlay} pointerEvents="none">
        <Animated.View style={[styles.wave, waveStyle]} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  wave: {
    position: 'absolute',
    backgroundColor: theme.colors.surface.wave,
  },
});
