import { StyleSheet, View } from 'react-native';
import { Svg, Path } from 'react-native-svg';

import { theme } from './theme';

type DecorativeLeavesProps = {
  size?: number;
};

export function DecorativeLeaves({ size = 32 }: DecorativeLeavesProps) {
  const leafSize = size * 0.7;
  const containerSize = size;

  return (
    <View style={[styles.container, { width: containerSize, height: containerSize }]}>
      <View style={[styles.leafBack, { transform: [{ rotate: '-25deg' }] }]}>
        <Svg width={leafSize} height={leafSize} viewBox="0 0 24 24">
          <Path
            d="M20 4C13 4 8 7.5 6 12.5c-1.1 2.7-.7 5.2 1 7 1.8 1.7 4.3 2.1 7 1 5-2 8.5-7 8.5-14.5Z"
            fill="none"
            stroke={theme.colors.brand.primary}
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={0.4}
          />
          <Path
            d="M6.5 19.5c2.5-3 6.5-6 12-8"
            fill="none"
            stroke={theme.colors.brand.primary}
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={0.4}
          />
        </Svg>
      </View>
      <View style={[styles.leafFront, { transform: [{ rotate: '15deg' }] }]}>
        <Svg width={leafSize} height={leafSize} viewBox="0 0 24 24">
          <Path
            d="M20 4C13 4 8 7.5 6 12.5c-1.1 2.7-.7 5.2 1 7 1.8 1.7 4.3 2.1 7 1 5-2 8.5-7 8.5-14.5Z"
            fill="none"
            stroke={theme.colors.brand.primary}
            strokeWidth={1.8}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Path
            d="M6.5 19.5c2.5-3 6.5-6 12-8"
            fill="none"
            stroke={theme.colors.brand.primary}
            strokeWidth={1.8}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  leafBack: {
    position: 'absolute',
    left: 0,
    top: 2,
  },
  leafFront: {
    position: 'absolute',
    left: 6,
    top: 0,
  },
});
