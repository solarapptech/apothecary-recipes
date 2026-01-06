import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Path, Svg } from 'react-native-svg';

import type { IconName } from '../ui/icons';
import { FieldIcon } from '../ui/icons';
import { theme } from '../ui/theme';

type SecondaryFieldRowProps = {
  icon: IconName;
  label: string;
  value: string;
  variant?: 'card' | 'grouped';
  showDivider?: boolean;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  chevronColor?: string;
  toggleTestID?: string;
  valueTestID?: string;
  onTogglePress?: (e: any) => void;
};

export function SecondaryFieldRow({
  icon,
  label,
  value,
  variant = 'card',
  showDivider = false,
  collapsible = false,
  defaultCollapsed = false,
  chevronColor,
  toggleTestID,
  valueTestID,
  onTogglePress,
}: SecondaryFieldRowProps) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);

  const resolvedChevronColor = chevronColor ?? theme.colors.brand.primaryStrong;

  return (
    <View style={[styles.container, variant === 'grouped' && styles.containerGrouped, showDivider && styles.containerDivider]}>
      {collapsible ? (
        <Pressable
          testID={toggleTestID}
          onPress={(e) => {
            onTogglePress?.(e);
            (e as any).stopPropagation?.();
            setCollapsed((prev) => !prev);
          }}
          style={styles.headerLinePressable}
          accessibilityRole="button"
          accessibilityLabel={collapsed ? `Show ${label}` : `Hide ${label}`}
        >
          <View style={styles.headerLine}>
            <View style={styles.iconBox}>
              <FieldIcon name={icon} size={18} />
            </View>
            <Text style={styles.labelText}>{label}</Text>
          </View>
          <View style={styles.chevronBox}>
            <Svg width={20} height={20} viewBox="0 0 24 24">
              <Path
                d={collapsed ? 'M7 10l5 5 5-5' : 'M7 14l5-5 5 5'}
                fill="none"
                stroke={resolvedChevronColor}
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </View>
        </Pressable>
      ) : (
        <View style={styles.headerLine}>
          <View style={styles.iconBox}>
            <FieldIcon name={icon} size={18} />
          </View>
          <Text style={styles.labelText}>{label}</Text>
        </View>
      )}

      {!collapsible || !collapsed ? (
        <Text testID={valueTestID} style={styles.valueText}>
          {value}
        </Text>
      ) : null}
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
  headerLinePressable: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 22,
  },
  iconBox: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chevronBox: {
    width: 22,
    height: 22,
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
