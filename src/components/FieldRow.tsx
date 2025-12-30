import { StyleSheet, Text, View } from 'react-native';

import type { IconName } from '../ui/icons';
import { FieldIcon } from '../ui/icons';
import { theme } from '../ui/theme';

type FieldRowProps = {
  icon: IconName;
  label: string;
  value: string;
  testID?: string;
  numberOfLines?: number;
  variant?: 'default' | 'collapsed';
};

export function FieldRow({ icon, label, value, testID, numberOfLines, variant = 'default' }: FieldRowProps) {
  return (
    <View style={[styles.container, variant === 'collapsed' && styles.containerCollapsed]} testID={testID}>
      <View style={styles.headerLine}>
        <View style={styles.iconBox}>
          <FieldIcon name={icon} size={18} />
        </View>
        <View style={styles.labelChip}>
          <Text style={[styles.labelText, variant === 'collapsed' && styles.labelTextCollapsed]} numberOfLines={1}>
            {label}
          </Text>
        </View>
      </View>
      <Text
        style={[styles.valueText, variant === 'collapsed' && styles.valueTextCollapsed]}
        numberOfLines={typeof numberOfLines === 'number' ? numberOfLines : undefined}
        ellipsizeMode={typeof numberOfLines === 'number' ? 'tail' : undefined}
      >
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 4,
  },
  containerCollapsed: {
    gap: 6,
  },
  headerLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minHeight: 22,
  },
  iconBox: {
    width: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  labelChip: {
    backgroundColor: theme.colors.surface.popover,
    borderRadius: 6,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border.subtle,
    paddingHorizontal: 8,
    paddingVertical: 3,
    flexShrink: 1,
  },
  labelText: {
    ...theme.typography.label,
  },
  labelTextCollapsed: {
    fontSize: 9,
    lineHeight: 13,
    fontFamily: theme.typography.fontFamily.sans.semiBold,
  },
  valueText: {
    ...theme.typography.caption,
    color: theme.colors.ink.primary,
  },
  valueTextCollapsed: {
    fontSize: 12,
    lineHeight: 16,
  },
});
