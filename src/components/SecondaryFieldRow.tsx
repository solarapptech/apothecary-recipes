import { StyleSheet, Text, View } from 'react-native';

import type { IconName } from '../ui/icons';
import { FieldIcon } from '../ui/icons';
import { theme } from '../ui/theme';

type SecondaryFieldRowProps = {
  icon: IconName;
  label: string;
  value: string;
  variant?: 'card' | 'grouped';
  showDivider?: boolean;
};

export function SecondaryFieldRow({ icon, label, value, variant = 'card', showDivider = false }: SecondaryFieldRowProps) {
  return (
    <View style={[styles.container, variant === 'grouped' && styles.containerGrouped, showDivider && styles.containerDivider]}>
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
  containerGrouped: {
    backgroundColor: 'transparent',
    borderRadius: 0,
  },
  containerDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.border.subtle,
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
    fontSize: 12,
    fontFamily: theme.typography.fontFamily.sans.semiBold,
    fontWeight: '800',
    letterSpacing: 0.6,
    color: theme.colors.brand.primaryStrong,
    textTransform: 'uppercase',
  },
  valueText: {
    fontSize: 13,
    lineHeight: 18,
    fontFamily: theme.typography.fontFamily.sans.regular,
    color: theme.colors.ink.muted,
  },
});
