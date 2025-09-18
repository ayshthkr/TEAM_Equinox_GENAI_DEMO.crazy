// src/constants/colors.js


export const Colors = {
  background: {
    primary: '#0F0F0F',      // Deep black main background
    secondary: '#1A1A1A',     // Card/header backgrounds
    tertiary: '#242424',     // Card content background
  },

  text: {
    primary: '#FFFFFF',       // Pure white main text
    secondary: '#E0E0E0',     // Light gray secondary text
    tertiary: '#A0A0A0',     // Muted gray text
  },

  border: {
    primary: '#333333',       // Subtle borders
    secondary: '#4A4A4A',     // Lighter borders
  },

  accent: {
    primary: '#007AFF',       // Professional blue
    secondary: '#0056CC',     // Darker blue
    tertiary: '#004499',      // Deep blue
  },
  
  status: {
    verified: '#00C851',      // Bright green for verified
    disputed: '#FF8800',      // Orange for disputed
    false: '#FF4444',         // Red for false
    unknown: '#888888',       // Gray for unknown
  },

  statusBackground: {
    verified: '#0D4F1C',      // Dark green background
    disputed: '#4D2D00',      // Dark orange background
    false: '#4D1414',         // Dark red background
    unknown: '#2A2A2A',       // Dark gray background
  },

  bias: {
    right: '#FF6B35',          // Orange for left bias
    center: '#E0E0E0',        // Green for center
    left: '#007AFF',         // Blue for right bias
  },

  surface: {
    primary: '#1E1E1E',       // Card surfaces
    secondary: '#2D2D2D',     // Elevated surfaces
    tertiary: '#3A3A3A',      // Interactive surfaces
  }
};

export default Colors;
