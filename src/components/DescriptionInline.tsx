import { StyleSheet, Text, View } from 'react-native';

import { FieldIcon } from '../ui/icons';
import { theme } from '../ui/theme';

type DescriptionInlineProps = {
  value: string;
  numberOfLines?: number;
};

export function DescriptionInline({ value, numberOfLines }: DescriptionInlineProps) {
  return (
    <Text
      style={styles.text}
      numberOfLines={numberOfLines}
      ellipsizeMode={numberOfLines ? 'tail' : undefined}
    >
      <View style={styles.iconWrapper}>
        <FieldIcon name="description" size={14} style={styles.iconWide} />
      </View>
      {' '}
      {value}
    </Text>
  );
}

const styles = StyleSheet.create({
  text: {
    fontSize: 13,
    lineHeight: 18,
    fontFamily: theme.typography.fontFamily.sans.regular,
    color: theme.colors.ink.muted,
  },
  iconWrapper: {
    display: 'flex',
  },
  iconWide: {
    transform: [{ scaleX: 1.2 }],
  },
});
