import { Modal, Pressable, StyleSheet, Text } from 'react-native';
import { ModalCardBackground } from './ModalCardBackground';
import { ModalBackdrop } from './ModalBackdrop';

type OverflowMenuProps = {
  visible: boolean;
  onRequestClose: () => void;
  onPressSettings: () => void;
};

export function OverflowMenu({
  visible,
  onRequestClose,
  onPressSettings,
}: OverflowMenuProps) {
  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onRequestClose}>
      <ModalBackdrop
        accessibilityRole="button"
        accessibilityLabel="Close menu"
        onPress={onRequestClose}
        style={styles.backdrop}
        testID="overflow-menu-backdrop"
      >
        <Pressable style={styles.menu} onPress={() => undefined}>
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
    top: 56,
    right: 12,
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
