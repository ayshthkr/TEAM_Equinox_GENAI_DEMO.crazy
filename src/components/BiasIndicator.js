// src/components/BiasIndicator.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const BiasIndicator = ({ bias }) => {
  const getBiasConfig = (biasType) => {
    switch (biasType.toLowerCase()) {
      case 'left':
        return { color: '#FF5722', label: 'Left', position: 20 };
      case 'center':
        return { color: '#4CAF50', label: 'Center', position: 50 };
      case 'right':
        return { color: '#2196F3', label: 'Right', position: 80 };
      default:
        return { color: '#757575', label: 'Unknown', position: 50 };
    }
  };

  const config = getBiasConfig(bias);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Bias</Text>
      <View style={styles.slider}>
        <View style={styles.track} />
        <View 
          style={[
            styles.indicator,
            { 
              backgroundColor: config.color,
              left: `${config.position}%`,
            }
          ]} 
        />
      </View>
      <Text style={[styles.biasText, { color: config.color }]}>
        {config.label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  label: {
    fontSize: 10,
    color: '#B0B0B0', // Light gray for dark theme
    marginBottom: 4,
  },
  slider: {
    width: 60,
    height: 4,
    position: 'relative',
    marginBottom: 4,
  },
  track: {
    width: '100%',
    height: '100%',
    backgroundColor: '#404040', // Darker track for dark theme
    borderRadius: 2,
  },
  indicator: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    top: -2,
    marginLeft: -4,
  },
  biasText: {
    fontSize: 10,
    fontWeight: '600',
  },
});

export default BiasIndicator;