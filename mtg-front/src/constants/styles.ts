// Shared CSS class names and style constants
export const CONTAINER_CLASSES = {
  base: 'min-h-screen flex flex-col align-center w-full box-border',
  dashboard: 'dashboard-container',
  stats: 'stats-container', 
  playerDetail: 'player-detail-container'
} as const;

export const SECTION_CLASSES = {
  base: 'bg-white bg-opacity-5 rounded-xl p-8 border border-white border-opacity-10',
  stats: 'stats-section',
  playerDetail: 'player-detail-section',
  spotlight: 'spotlight'
} as const;

export const HEADER_CLASSES = {
  primary: 'heading heading--primary',
  secondary: 'heading heading--secondary', 
  tertiary: 'heading heading--tertiary'
} as const;

export const BUTTON_CLASSES = {
  retry: 'retry-button',
  back: 'back-button',
  backHeader: 'back-button back-button--header',
  action: 'action-button'
} as const;

export const STATE_CLASSES = {
  loading: 'loading',
  error: 'error-message',
  noData: 'no-data'
} as const;

// Common spacing and layout values
export const LAYOUT = {
  maxWidth: '1200px',
  padding: {
    mobile: '0.5rem',
    tablet: '1rem', 
    desktop: '2rem'
  },
  gap: {
    small: '1rem',
    medium: '2rem',
    large: '3rem'
  }
} as const;