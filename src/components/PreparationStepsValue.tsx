import { StyleSheet, Text, View } from 'react-native';

import { theme } from '../ui/theme';

type PreparationStepsValueProps = {
  value: string;
};

export function PreparationStepsValue({ value }: PreparationStepsValueProps) {
  const formatted = value
    .replace(/\r\n/g, '\n')
    .replace(/(\s*)(\d+\.)\s+/g, (match, _ws, stepNumber, offset) => {
      if (offset === 0) {
        return `${stepNumber} `;
      }
      return `\n${stepNumber} `;
    })
    .trim();

  const parts = formatted.length > 0 ? formatted.split(/\n(?=\d+\.\s)/) : [''];

  return (
    <View style={styles.container}>
      {parts.map((part, index) => (
        <Text key={`${index}-${part.slice(0, 10)}`} style={[styles.stepText, index > 0 && styles.stepSpacing]}>
          {part.trim()}
        </Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'stretch',
  },
  stepText: {
    ...theme.typography.caption,
    color: theme.colors.ink.primary,
    lineHeight: 18,
  },
  stepSpacing: {
    marginTop: 10,
  },
});
