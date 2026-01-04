import { StyleSheet, Text, View } from 'react-native';

import { FieldIcon } from '../ui/icons';
import { theme } from '../ui/theme';

type TimePeriodRegionRowProps = {
  usedFor: string;
  region: string;
};

export function TimePeriodRegionRow({ usedFor, region }: TimePeriodRegionRowProps) {
  const usedForItems = usedFor
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);

  return (
    <View style={styles.container}>
      <View style={styles.column}>
        <View style={styles.headerRow}>
          <FieldIcon name="usedFor" size={18} color={theme.colors.ink.subtle} />
          <View style={styles.headerChip}>
            <Text style={styles.headerChipLabel}>USED FOR</Text>
          </View>
        </View>
        <View style={styles.usedForValueContainer}>
          {usedForItems.map((value, index) => (
            <Text key={`${index}-${value}`} style={styles.usedForValueText}>
              {`${index + 1}. ${value}`}
            </Text>
          ))}
        </View>
      </View>
      <View style={styles.column}>
        <View style={styles.headerRow}>
          <FieldIcon name="region" size={18} color={theme.colors.ink.subtle} />
          <View style={styles.headerChip}>
            <Text style={styles.headerChipLabel}>REGION</Text>
          </View>
        </View>
        <Text style={styles.valueText} numberOfLines={2}>
          {region}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 8,
  },
  column: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  headerChip: {
    backgroundColor: theme.colors.brand.prepTimeGreen,
    borderRadius: theme.radii.pill,
    paddingHorizontal: 12,
    paddingVertical: 2,
  },
  headerChipLabel: {
    fontSize: 12,
    fontFamily: theme.typography.fontFamily.sans.semiBold,
    fontWeight: '800',
    letterSpacing: 0.6,
    color: theme.colors.ink.onBrand,
    textTransform: 'uppercase',
  },
  valueText: {
    fontSize: 13,
    lineHeight: 18,
    fontFamily: theme.typography.fontFamily.sans.regular,
    color: theme.colors.ink.primary,
    textAlign: 'center',
  },
  usedForValueContainer: {
    alignSelf: 'stretch',
    alignItems: 'flex-start',
    gap: 2,
    paddingLeft: 10,
  },
  usedForValueText: {
    fontSize: 13,
    lineHeight: 18,
    fontFamily: theme.typography.fontFamily.sans.regular,
    color: theme.colors.ink.primary,
    textAlign: 'left',
  },
});
