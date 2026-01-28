import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Path, Svg } from 'react-native-svg';

import type { IconName } from '../ui/icons';
import { FieldIcon } from '../ui/icons';
import { theme } from '../ui/theme';
import { WavePressable } from './WavePressable';

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
  reduceMotionEnabled?: boolean;
  tone?: 'default' | 'accent';
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
  reduceMotionEnabled = false,
  tone = 'default',
}: SecondaryFieldRowProps) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);

  const resolvedChevronColor = chevronColor ?? theme.colors.brand.primaryStrong;
  const isExpanded = collapsible && !collapsed;
  const activeHeaderColor = theme.colors.ink.primary;
  const iconColor = isExpanded ? activeHeaderColor : undefined;
  const chevronStroke = isExpanded ? activeHeaderColor : resolvedChevronColor;

  const containerStyles = [
    styles.container,
    variant === 'grouped' && styles.containerGrouped,
    showDivider && styles.containerDivider,
    tone === 'accent' && styles.containerAccent,
  ];

  const headerContent = collapsible ? (
    <WavePressable
      testID={toggleTestID}
      onPress={(e) => {
        onTogglePress?.(e);
        (e as any).stopPropagation?.();
        setCollapsed((prev) => !prev);
      }}
      style={[
        styles.headerLinePressable,
        variant === 'grouped' && styles.headerLinePressableGrouped,
        isExpanded && styles.headerLinePressableActive,
      ]}
      accessibilityRole="button"
      accessibilityLabel={collapsed ? `Show ${label}` : `Hide ${label}`}
      reduceMotionEnabled={reduceMotionEnabled}
    >
      <View style={styles.headerLine}>
        <View style={styles.iconBox}>
          <FieldIcon name={icon} size={18} color={iconColor} />
        </View>
        <Text style={[styles.labelText, isExpanded && styles.labelTextActive]}>{label}</Text>
      </View>
      <View style={styles.chevronBox}>
        <Svg width={20} height={20} viewBox="0 0 24 24">
          <Path
            d={collapsed ? 'M7 10l5 5 5-5' : 'M7 14l5-5 5 5'}
            fill="none"
            stroke={chevronStroke}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      </View>
    </WavePressable>
  ) : (
    <View style={styles.headerLine}>
      <View style={styles.iconBox}>
        <FieldIcon name={icon} size={18} />
      </View>
      <Text style={styles.labelText}>{label}</Text>
    </View>
  );

  const content = (
    <>
      {headerContent}
      {!collapsible || !collapsed ? (
        <Text testID={valueTestID} style={styles.valueText} selectable>
          {value}
        </Text>
      ) : null}
    </>
  );

  return <View style={containerStyles}>{content}</View>;
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
    paddingHorizontal: 4,
  },
  containerDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.border.subtle,
  },
  containerAccent: {
    backgroundColor: 'transparent',
    borderRadius: 0,
    paddingHorizontal: 10,
    paddingVertical: 8,
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
    backgroundColor: 'rgba(46, 96, 67, 0.08)',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  headerLinePressableActive: {
    backgroundColor: theme.colors.brand.moreInfoGreen,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.brand.primary,
  },
  headerLinePressableGrouped: {
    paddingHorizontal: 4,
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
  labelTextActive: {
    color: theme.colors.ink.primary,
  },
  valueText: {
    fontSize: 13,
    lineHeight: 18,
    fontFamily: theme.typography.fontFamily.sans.regular,
    color: theme.colors.ink.muted,
    paddingLeft: 4,
  },
});
