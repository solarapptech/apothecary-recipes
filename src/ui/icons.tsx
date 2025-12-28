import type { ComponentProps } from 'react';
import { Svg, Path, Circle, Rect } from 'react-native-svg';

import { theme } from './theme';

export type IconName =
  | 'leaf'
  | 'difficulty'
  | 'prepTime'
  | 'timePeriod'
  | 'region'
  | 'ingredients'
  | 'detailedMeasurements'
  | 'preparationSteps'
  | 'usage'
  | 'warning'
  | 'historical'
  | 'evidence'
  | 'description';

type FieldIconProps = {
  name: IconName;
  size?: number;
  color?: string;
  strokeWidth?: number;
} & Omit<ComponentProps<typeof Svg>, 'width' | 'height'>;

export function FieldIcon({
  name,
  size = 18,
  color = theme.colors.brand.primary,
  strokeWidth = 1.8,
  ...rest
}: FieldIconProps) {
  const common = {
    fill: 'none',
    stroke: color,
    strokeWidth,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };

  if (name === 'leaf' || name === 'ingredients') {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" {...rest}>
        <Path
          d="M20 4C13 4 8 7.5 6 12.5c-1.1 2.7-.7 5.2 1 7 1.8 1.7 4.3 2.1 7 1 5-2 8.5-7 8.5-14.5Z"
          {...common}
        />
        <Path d="M6.5 19.5c2.5-3 6.5-6 12-8" {...common} />
      </Svg>
    );
  }

  if (name === 'difficulty') {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" {...rest}>
        <Path d="M12 3l2.2 6.1L21 12l-6.8 2.9L12 21l-2.2-6.1L3 12l6.8-2.9L12 3Z" {...common} />
      </Svg>
    );
  }

  if (name === 'prepTime') {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" {...rest}>
        <Circle cx="12" cy="13" r="8" {...common} />
        <Path d="M12 13l3.5-2" {...common} />
        <Path d="M9 3h6" {...common} />
        <Path d="M12 5V3" {...common} />
      </Svg>
    );
  }

  if (name === 'timePeriod') {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" {...rest}>
        <Path d="M7 3h10" {...common} />
        <Path d="M7 21h10" {...common} />
        <Path d="M8 3v4c0 2.2 1.4 4.2 3.4 5l.6.3-.6.3C9.4 13.8 8 15.8 8 18v3" {...common} />
        <Path d="M16 3v4c0 2.2-1.4 4.2-3.4 5l-.6.3.6.3c2 .8 3.4 2.8 3.4 5V21" {...common} />
      </Svg>
    );
  }

  if (name === 'region') {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" {...rest}>
        <Path d="M12 21s7-4.5 7-11a7 7 0 0 0-14 0c0 6.5 7 11 7 11Z" {...common} />
        <Circle cx="12" cy="10" r="2" {...common} />
      </Svg>
    );
  }

  if (name === 'detailedMeasurements') {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" {...rest}>
        <Rect x="5" y="7" width="14" height="10" rx="2" {...common} />
        <Path d="M8 10h2" {...common} />
        <Path d="M8 12h4" {...common} />
        <Path d="M8 14h2" {...common} />
      </Svg>
    );
  }

  if (name === 'preparationSteps') {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" {...rest}>
        <Path d="M7 7h14" {...common} />
        <Path d="M7 12h14" {...common} />
        <Path d="M7 17h14" {...common} />
        <Circle cx="4" cy="7" r="1" {...common} />
        <Circle cx="4" cy="12" r="1" {...common} />
        <Circle cx="4" cy="17" r="1" {...common} />
      </Svg>
    );
  }

  if (name === 'usage') {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" {...rest}>
        <Path d="M8 12v-6a2 2 0 0 1 4 0v6" {...common} />
        <Path d="M12 12V7a2 2 0 0 1 4 0v7" {...common} />
        <Path d="M16 14V9a2 2 0 0 1 4 0v7c0 3-2.5 5-6 5H10c-3.3 0-6-2.2-6-5v-3a2 2 0 0 1 4 0v1" {...common} />
      </Svg>
    );
  }

  if (name === 'warning') {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" {...rest}>
        <Path d="M12 3l10 18H2L12 3Z" {...common} />
        <Path d="M12 9v5" {...common} />
        <Path d="M12 17h.01" {...common} />
      </Svg>
    );
  }

  if (name === 'historical') {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" {...rest}>
        <Path d="M7 4h11a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H9a3 3 0 0 0-3 3V6a2 2 0 0 1 2-2Z" {...common} />
        <Path d="M9 8h8" {...common} />
        <Path d="M9 12h8" {...common} />
        <Path d="M9 16h6" {...common} />
      </Svg>
    );
  }

  if (name === 'evidence') {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" {...rest}>
        <Path d="M10 2h4" {...common} />
        <Path d="M10 2v4l-5.5 9.5A4 4 0 0 0 8 22h8a4 4 0 0 0 3.5-6.5L14 6V2" {...common} />
        <Path d="M8 14h8" {...common} />
      </Svg>
    );
  }

  // description
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" {...rest}>
      <Path d="M6 7h12" {...common} />
      <Path d="M6 12h12" {...common} />
      <Path d="M6 17h8" {...common} />
      <Path d="M5 4h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H8l-3 2v-4H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z" {...common} />
    </Svg>
  );
}
