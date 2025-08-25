/**
 * VelocityInput - Index
 * Main export barrel for the VelocityInput component system
 */

// Main component
export { VelocityInput } from './VelocityInput';

// Variants and styling
export { velocityInputVariants, velocityLabelVariants } from './variants';

// Types
export type { VelocityInputProps } from './types';

// Hooks (for advanced usage)
export { useVelocityInputState } from './hooks';

// Sub-components (for custom implementations)
export {
  InputField,
  FloatingLabel,
  InputIcons,
  InputMessages,
} from './components';