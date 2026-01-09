import { Modal, Pressable, StyleSheet, Text, useWindowDimensions } from 'react-native';
import { ModalCardBackground } from './ModalCardBackground';
import { ModalBackdrop } from './ModalBackdrop';

type OverflowMenuProps = {
  visible: boolean;
  anchor?: { x: number; y: number; width: number; height: number } | null;
  onRequestClose: () => void;
  onPressSettings: () => void;
};

export function OverflowMenu({
  visible,
  anchor,
  onRequestClose,
  onPressSettings,
}: OverflowMenuProps) {
  const window = useWindowDimensions();

  const gutter = 12;
  const menuTop = (anchor?.y ?? 56) + (anchor?.height ?? 0) + 8;
  const menuRight = anchor ? Math.max(gutter, window.width - (anchor.x + anchor.width) - gutter) : gutter;

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onRequestClose}>
      <ModalBackdrop
        accessibilityRole="button"
        accessibilityLabel="Close menu"
        onPress={onRequestClose}
        style={styles.backdrop}
        testID="overflow-menu-backdrop"
      >
        <Pressable style={[styles.menu, { top: menuTop, right: menuRight }]} onPress={() => undefined}>
          <ModalCardBackground style={styles.menuBackground}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Settings"
              onPress={() => {
                onPressSettings();
                onRequestClose();
              }}
              style={styles.item}
              testID="overflow-menu-settings"
            >
              <Text style={styles.itemText}>Settings</Text>
            </Pressable>
          </ModalCardBackground>
        </Pressable>
      </ModalBackdrop>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
  },
  menu: {
    position: 'absolute',
    borderRadius: 10,
    minWidth: 160,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#ddd',
    overflow: 'hidden',
  },
  menuBackground: {
    borderRadius: 10,
  },
  item: {
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  itemText: {
    fontSize: 16,
    color: '#111',
  },
});
