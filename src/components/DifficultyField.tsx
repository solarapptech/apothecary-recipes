import { StyleSheet, Text, View } from 'react-native';

import { theme } from '../ui/theme';

type DifficultyFieldProps = {
  score: number;
  maxScore?: number;
};

export function DifficultyField({ score, maxScore = 3 }: DifficultyFieldProps) {
  const difficultyLabel = (() => {
    const safeMax = Math.max(1, Math.round(maxScore));
    const safeScore = Math.max(1, Math.min(safeMax, Math.round(score)));

    if (safeMax === 3) {
      if (safeScore === 1) return 'Easy';
      if (safeScore === 2) return 'Normal';
      return 'Hard';
    }

    if (safeScore <= safeMax / 3) return 'Easy';
    if (safeScore <= (2 * safeMax) / 3) return 'Normal';
    return 'Hard';
  })();

  return (
    <View style={styles.container}>
      <Text style={styles.label}>DIFFICULTY</Text>
      <Text style={styles.value}>{difficultyLabel}</Text>
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
  value: {
    fontSize: 12,
    fontFamily: theme.typography.fontFamily.sans.semiBold,
    color: theme.colors.brand.primary,
  },
});
