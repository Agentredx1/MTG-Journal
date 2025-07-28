// =================================================================== 
// SHARED CSS CLASS NAMES AND STYLE CONSTANTS
// Updated to use CSS Variables Design System
// ===================================================================

// Container class names with CSS variable integration
export const CONTAINER_CLASSES = {
  base: 'min-h-screen flex flex-col items-center w-full box-border',
  dashboard: 'dashboard-container',
  stats: 'stats-container', 
  playerDetail: 'player-detail-container'
} as const;

// Section class names using CSS variable-based styles
export const SECTION_CLASSES = {
  base: 'bg-white bg-opacity-5 rounded-xl p-8 border border-white border-opacity-10',
  stats: 'stats-section',
  playerDetail: 'player-detail-section',
  spotlight: 'spotlight'
} as const;

// Header typography classes using CSS variables
export const HEADER_CLASSES = {
  primary: 'heading heading--primary',
  secondary: 'heading heading--secondary', 
  tertiary: 'heading heading--tertiary'
} as const;

// Button classes with CSS variable styling
export const BUTTON_CLASSES = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  destructive: 'btn-destructive',
  small: 'btn-sm',
  large: 'btn-lg',
  retry: 'retry-button',
  back: 'back-button',
  backHeader: 'back-button back-button--header',
  action: 'action-button'
} as const;

// State classes using consistent CSS variable styling
export const STATE_CLASSES = {
  loading: 'loading',
  error: 'error-message',
  noData: 'no-data'
} as const;

// Text utility classes that map to CSS variables
export const TEXT_CLASSES = {
  primary: 'text-primary',
  success: 'text-success',
  error: 'text-error',
  muted: 'text-muted',
  center: 'text-center',
  left: 'text-left',
  right: 'text-right'
} as const;

// Font weight classes mapping to CSS variables
export const FONT_WEIGHT_CLASSES = {
  light: 'font-light',
  normal: 'font-normal',
  medium: 'font-medium',
  semibold: 'font-semibold',
  bold: 'font-bold'
} as const;

// Layout utility classes
export const LAYOUT_CLASSES = {
  flex: 'flex',
  flexCol: 'flex-col',
  flexRow: 'flex-row',
  inlineFlex: 'inline-flex',
  grid: 'grid',
  hidden: 'hidden',
  block: 'block',
  inlineBlock: 'inline-block',
  itemsCenter: 'items-center',
  itemsStart: 'items-start',
  itemsEnd: 'items-end',
  justifyCenter: 'justify-center',
  justifyBetween: 'justify-between',
  justifyStart: 'justify-start',
  justifyEnd: 'justify-end'
} as const;

// Spacing utility classes using CSS variable gaps
export const SPACING_CLASSES = {
  gap1: 'gap-1',
  gap2: 'gap-2',
  gap3: 'gap-3',
  gap4: 'gap-4',
  gap6: 'gap-6',
  gap8: 'gap-8'
} as const;

// CSS Variable references for use in TypeScript
// These match the CSS custom properties defined in index.css
export const CSS_VARIABLES = {
  // Typography
  fontSizes: {
    xs: 'var(--font-size-xs)',
    sm: 'var(--font-size-sm)',
    base: 'var(--font-size-base)',
    lg: 'var(--font-size-lg)',
    xl: 'var(--font-size-xl)',
    '2xl': 'var(--font-size-2xl)',
    '3xl': 'var(--font-size-3xl)',
    '4xl': 'var(--font-size-4xl)',
    '5xl': 'var(--font-size-5xl)'
  },
  
  // Colors
  colors: {
    primary: {
      50: 'var(--color-primary-50)',
      100: 'var(--color-primary-100)',
      200: 'var(--color-primary-200)',
      300: 'var(--color-primary-300)',
      400: 'var(--color-primary-400)',
      500: 'var(--color-primary-500)',
      600: 'var(--color-primary-600)',
      700: 'var(--color-primary-700)',
      800: 'var(--color-primary-800)',
      900: 'var(--color-primary-900)'
    },
    text: {
      primary: 'var(--color-text-primary)',
      secondary: 'var(--color-text-secondary)',
      tertiary: 'var(--color-text-tertiary)'
    },
    bg: {
      primary: 'var(--color-bg-primary)',
      secondary: 'var(--color-bg-secondary)',
      elevated: 'var(--color-bg-elevated)'
    },
    border: {
      primary: 'var(--color-border-primary)',
      secondary: 'var(--color-border-secondary)'
    },
    success: {
      400: 'var(--color-success-400)',
      500: 'var(--color-success-500)',
      600: 'var(--color-success-600)'
    },
    error: {
      400: 'var(--color-error-400)',
      500: 'var(--color-error-500)',
      600: 'var(--color-error-600)'
    }
  },
  
  // Spacing
  spacing: {
    1: 'var(--space-1)',
    2: 'var(--space-2)',
    3: 'var(--space-3)',
    4: 'var(--space-4)',
    5: 'var(--space-5)',
    6: 'var(--space-6)',
    8: 'var(--space-8)',
    10: 'var(--space-10)',
    12: 'var(--space-12)',
    16: 'var(--space-16)'
  },
  
  // Border radius
  radius: {
    sm: 'var(--radius-sm)',
    base: 'var(--radius-base)',
    md: 'var(--radius-md)',
    lg: 'var(--radius-lg)',
    xl: 'var(--radius-xl)',
    '2xl': 'var(--radius-2xl)',
    full: 'var(--radius-full)'
  },
  
  // Shadows
  shadows: {
    sm: 'var(--shadow-sm)',
    base: 'var(--shadow-base)',
    md: 'var(--shadow-md)',
    lg: 'var(--shadow-lg)',
    xl: 'var(--shadow-xl)',
    '2xl': 'var(--shadow-2xl)'
  },
  
  // Transitions
  transitions: {
    fast: 'var(--transition-fast)',
    base: 'var(--transition-base)',
    slow: 'var(--transition-slow)'
  },
  
  // Z-index
  zIndex: {
    dropdown: 'var(--z-dropdown)',
    modal: 'var(--z-modal)',
    tooltip: 'var(--z-tooltip)'
  },
  
  // Layout
  layout: {
    containerMaxWidth: 'var(--container-max-width)',
    contentPaddingMobile: 'var(--content-padding-mobile)',
    contentPaddingTablet: 'var(--content-padding-tablet)',
    contentPaddingDesktop: 'var(--content-padding-desktop)'
  }
} as const;

// Responsive breakpoints (matches CSS media queries)
export const BREAKPOINTS = {
  mobile: '320px',           // Base mobile
  largeMobile: '481px',      // Large mobile
  tablet: '601px',           // Tablet
  desktop: '769px',          // Desktop
  largeDesktop: '1024px',    // Large desktop
  xlDesktop: '1440px'        // Extra large desktop
} as const;

// Common spacing and layout values (legacy - prefer CSS variables)
export const LAYOUT = {
  maxWidth: CSS_VARIABLES.layout.containerMaxWidth,
  padding: {
    mobile: CSS_VARIABLES.layout.contentPaddingMobile,
    tablet: CSS_VARIABLES.layout.contentPaddingTablet,
    desktop: CSS_VARIABLES.layout.contentPaddingDesktop
  },
  gap: {
    small: CSS_VARIABLES.spacing[4],
    medium: CSS_VARIABLES.spacing[8],
    large: CSS_VARIABLES.spacing[12]
  }
} as const;

// Helper functions for building class names
export const combineClasses = (...classes: (string | undefined | false)[]): string => {
  return classes.filter(Boolean).join(' ');
};

// Type-safe way to access CSS variables in inline styles
export const getCSSVariable = (variableName: string): string => {
  return `var(${variableName})`;
};

// Utility to build responsive class names
export const buildResponsiveClasses = (
  mobile: string,
  tablet?: string,
  desktop?: string
): string => {
  const classes = [mobile];
  if (tablet) classes.push(`md:${tablet}`);
  if (desktop) classes.push(`lg:${desktop}`);
  return classes.join(' ');
};