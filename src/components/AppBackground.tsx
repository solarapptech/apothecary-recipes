import type { ReactNode } from 'react';
import { ImageBackground, StyleSheet, View } from 'react-native';

import { theme } from '../ui/theme';

type AppBackgroundProps = {
  children: ReactNode;
};

export function AppBackground({ children }: AppBackgroundProps) {
  const parchment = require('../../assets/apothecary-recipe-ref-img2.jpeg');

  return (
    <ImageBackground source={parchment} resizeMode="cover" style={styles.background} imageStyle={styles.image}>
      <View style={styles.overlay}>{children}</View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: theme.colors.surface.paperStrong,
  },
  image: {
    opacity: 0.8,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(240,240,239,0.50)',
  },
});
