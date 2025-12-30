import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { IconName } from '../ui/icons';
import { FieldIcon } from '../ui/icons';
import { theme } from '../ui/theme';

type FieldRowProps = {
  icon: IconName;
  label: string;
  value: string;
  valueNode?: ReactNode;
  testID?: string;
  numberOfLines?: number;
  variant?: 'default' | 'collapsed';
  align?: 'left' | 'center';
  lineHeightBoost?: number;
  headerAlign?: 'left' | 'center';
  valueAlign?: 'left' | 'center';
  hideIcon?: boolean;
  hideLabelChip?: boolean;
};

export function FieldRow({
  icon,
  label,
  value,
  valueNode,
  testID,
  numberOfLines,
  variant = 'default',
  align = 'left',
  lineHeightBoost,
  headerAlign,
  valueAlign,
  hideIcon,
  hideLabelChip,
}: FieldRowProps) {
  const resolvedHeaderAlign = headerAlign ?? align;
  const resolvedValueAlign = valueAlign ?? align;

  return (
    <View
      style={[
        styles.container,
        variant === 'collapsed' && styles.containerCollapsed,
        resolvedValueAlign === 'center' && styles.containerCentered,
      ]}
      testID={testID}
    >
      <View style={[styles.headerLine, resolvedHeaderAlign === 'center' && styles.headerLineCentered]}>
        {!hideIcon && (
          <View style={styles.iconBox}>
            <FieldIcon name={icon} size={18} />
          </View>
        )}
        {hideLabelChip ? (
          <Text style={[styles.labelText, variant === 'collapsed' && styles.labelTextCollapsed]} numberOfLines={1}>
            {label}
          </Text>
        ) : (
          <View style={styles.labelChip}>
            <Text style={[styles.labelText, variant === 'collapsed' && styles.labelTextCollapsed]} numberOfLines={1}>
              {label}
            </Text>
          </View>
        )}
      </View>
      {valueNode ? (
        <View style={[resolvedValueAlign === 'center' && styles.valueNodeCentered]}>{valueNode}</View>
      ) : (
        <Text
          style={[
            styles.valueText,
            variant === 'collapsed' && styles.valueTextCollapsed,
            resolvedValueAlign === 'center' && styles.valueTextCentered,
            lineHeightBoost ? { lineHeight: lineHeightBoost } : undefined,
          ]}
          numberOfLines={typeof numberOfLines === 'number' ? numberOfLines : undefined}
          ellipsizeMode={typeof numberOfLines === 'number' ? 'tail' : undefined}
        >
          {value}
        </Text>
      )}
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
  containerCentered: {
    alignItems: 'center',
  },
  headerLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minHeight: 22,
  },
  headerLineCentered: {
    justifyContent: 'center',
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
  valueTextCentered: {
    textAlign: 'center',
  },
  valueNodeCentered: {
    alignItems: 'center',
  },
  valueTextCollapsed: {
    fontSize: 12,
    lineHeight: 16,
  },
});
