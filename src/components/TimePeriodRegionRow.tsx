import { StyleSheet, Text, View } from 'react-native';

import { FieldIcon } from '../ui/icons';
import { theme } from '../ui/theme';

type TimePeriodRegionRowProps = {
  timePeriod: string;
  region: string;
};

export function TimePeriodRegionRow({ timePeriod, region }: TimePeriodRegionRowProps) {
  return (
    <View style={styles.container}>
      <View style={styles.pill}>
        <View style={styles.pillHeader}>
          <FieldIcon name="timePeriod" size={12} color={theme.colors.ink.onBrand} />
          <Text style={styles.pillLabel}>TIME PERIOD</Text>
        </View>
        <Text style={styles.pillValue} numberOfLines={2}>{timePeriod}</Text>
      </View>
      <View style={styles.pill}>
        <View style={styles.pillHeader}>
          <FieldIcon name="region" size={12} color={theme.colors.ink.onBrand} />
          <Text style={styles.pillLabel}>REGION</Text>
        </View>
        <Text style={styles.pillValue} numberOfLines={2}>{region}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 8,
  },
  pill: {
    flex: 1,
    backgroundColor: theme.colors.brand.prepTimeGreen,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 4,
  },
  pillHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  pillLabel: {
    fontSize: 9,
    fontFamily: theme.typography.fontFamily.sans.semiBold,
    letterSpacing: 0.6,
    color: theme.colors.ink.onBrand,
    textTransform: 'uppercase',
  },
  pillValue: {
    fontSize: 11,
    lineHeight: 14,
    fontFamily: theme.typography.fontFamily.sans.medium,
    color: theme.colors.ink.onBrand,
  },
});
