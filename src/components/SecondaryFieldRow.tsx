import { StyleSheet, Text, View } from 'react-native';

import type { IconName } from '../ui/icons';
import { FieldIcon } from '../ui/icons';
import { theme } from '../ui/theme';

type SecondaryFieldRowProps = {
  icon: IconName;
  label: string;
  value: string;
};

export function SecondaryFieldRow({ icon, label, value }: SecondaryFieldRowProps) {
  return (
    <View style={styles.container}>
      <View style={styles.headerLine}>
        <View style={styles.iconBox}>
          <FieldIcon name={icon} size={18} />
        </View>
        <Text style={styles.labelText}>{label}</Text>
      </View>
      <Text style={styles.valueText}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.surface.secondaryField,
    borderRadius: 10,
    padding: 12,
    gap: 6,
  },
  headerLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  iconBox: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  labelText: {
    fontSize: 11,
    fontFamily: theme.typography.fontFamily.sans.semiBold,
    letterSpacing: 0.6,
    color: theme.colors.ink.primary,
    textTransform: 'uppercase',
  },
  valueText: {
    fontSize: 13,
    lineHeight: 18,
    fontFamily: theme.typography.fontFamily.sans.regular,
    color: theme.colors.ink.muted,
  },
});
