export const colors = {
  brand: {
    primary: '#2e6043',
    primaryStrong: '#31724c',
    onInkTrack: 'rgba(240,240,239,0.22)',
  },
  ink: {
    primary: '#211f1c',
    muted: 'rgba(33,31,28,0.75)',
    subtle: 'rgba(33,31,28,0.55)',
    onBrand: '#f0f0ef',
  },
  surface: {
    paper: 'rgba(240,240,239,0.94)',
    paperStrong: '#f0f0ef',
    popover: 'rgba(231,230,228,0.96)',
  },
  border: {
    subtle: 'rgba(33,31,28,0.14)',
    strong: 'rgba(33,31,28,0.22)',
  },
  backdrop: {
    dim: 'rgba(0,0,0,0.25)',
    modal: 'rgba(0,0,0,0.35)',
    imageZoom: 'rgba(0,0,0,0.9)',
  },
  status: {
    danger: '#8b2a2a',
  },
} as const;

export const typography = {
  fontFamily: {
    serif: {
      semiBold: 'PlayfairDisplay_600SemiBold',
      bold: 'PlayfairDisplay_700Bold',
    },
    sans: {
      regular: 'Inter_400Regular',
      medium: 'Inter_500Medium',
      semiBold: 'Inter_600SemiBold',
    },
  },
  title: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 22,
    lineHeight: 28,
    color: colors.ink.primary,
  },
  headerTitle: {
    fontFamily: 'PlayfairDisplay_600SemiBold',
    fontSize: 20,
    lineHeight: 24,
    color: colors.ink.primary,
  },
  sectionTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    lineHeight: 20,
    color: colors.ink.primary,
  },
  label: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    lineHeight: 14,
    letterSpacing: 0.8,
    textTransform: 'uppercase' as const,
    color: colors.ink.primary,
  },
  body: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    lineHeight: 20,
    color: colors.ink.primary,
  },
  bodyMuted: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    lineHeight: 20,
    color: colors.ink.muted,
  },
  caption: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    lineHeight: 16,
    color: colors.ink.muted,
  },
} as const;

export const radii = {
  sm: 10,
  md: 12,
  lg: 16,
  pill: 999,
} as const;

export const spacing = {
  xs: 6,
  sm: 10,
  md: 16,
  lg: 24,
} as const;

export const theme = {
  colors,
  typography,
  radii,
  spacing,
} as const;
