import type { ReactNode } from 'react';
import { ImageBackground, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

type ModalCardBackgroundProps = {
  style?: StyleProp<ViewStyle>;
  children?: ReactNode;
};

export function ModalCardBackground({ style, children }: ModalCardBackgroundProps) {
  const imageSource = require('../assets/component-graph.jpeg');
  const flat = StyleSheet.flatten(style);
  const radius = typeof flat?.borderRadius === 'number' ? flat.borderRadius : undefined;

  return (
    <ImageBackground
      source={imageSource}
      resizeMode="cover"
      style={[styles.container, style]}
      imageStyle={[styles.image, radius != null ? { borderRadius: radius } : null]}
    >
      <View style={styles.overlay} pointerEvents="none" />
      <View style={styles.content}>{children}</View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f0f0ef',
  },
  image: {
    opacity: 0.8,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(240,240,239,0.50)',
  },
  content: {
    position: 'relative',
  },
});
