import { StyleSheet, Text, View } from 'react-native';

import { FieldIcon } from '../ui/icons';
import { theme } from '../ui/theme';

type PrepTimeFieldProps = {
  value: string;
};

export function PrepTimeField({ value }: PrepTimeFieldProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>PREP TIME</Text>
      <View style={styles.valueRow}>
        <FieldIcon name="prepTime" size={14} color={theme.colors.brand.primary} />
        <Text style={styles.value}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 4,
  },
  label: {
    fontSize: 10,
    fontFamily: theme.typography.fontFamily.sans.semiBold,
    letterSpacing: 0.8,
    color: theme.colors.ink.onBrand,
    textTransform: 'uppercase',
    backgroundColor: theme.colors.brand.prepTimeGreen,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 3,
    overflow: 'hidden',
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  value: {
    fontSize: 12,
    fontFamily: theme.typography.fontFamily.sans.medium,
    color: theme.colors.brand.primary,
  },
});
