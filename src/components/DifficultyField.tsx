import { StyleSheet, Text, View } from 'react-native';

import { FieldIcon } from '../ui/icons';
import { theme } from '../ui/theme';

type DifficultyFieldProps = {
  score: number;
  maxScore?: number;
};

export function DifficultyField({ score, maxScore = 3 }: DifficultyFieldProps) {
  const stars = [];
  for (let i = 1; i <= maxScore; i++) {
    stars.push(
      <FieldIcon
        key={i}
        name={i <= score ? 'star' : 'starOutline'}
        size={14}
        color={theme.colors.brand.primary}
      />
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>DIFFICULTY</Text>
      <View style={styles.starsRow}>{stars}</View>
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
    color: theme.colors.brand.primary,
    textTransform: 'uppercase',
  },
  starsRow: {
    flexDirection: 'row',
    gap: 2,
  },
});
