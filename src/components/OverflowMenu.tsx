import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

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
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Close menu"
        onPress={onRequestClose}
        style={styles.backdrop}
        testID="overflow-menu-backdrop"
      >
        <Pressable style={styles.menu} onPress={() => undefined}>
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
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  menu: {
    position: 'absolute',
    top: 56,
    right: 12,
    backgroundColor: '#fff',
    borderRadius: 10,
    minWidth: 160,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#ddd',
    overflow: 'hidden',
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
