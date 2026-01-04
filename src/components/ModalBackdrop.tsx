import type { ReactNode } from 'react';
import {
  Pressable,
  StyleSheet,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

type ModalBackdropProps = {
  children: ReactNode;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
} & Omit<PressableProps, 'children' | 'onPress' | 'style'>;

export function ModalBackdrop({ children, onPress, style, ...rest }: ModalBackdropProps) {
  return (
    <Pressable onPress={onPress} style={[styles.container, style]} {...rest}>
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
});
