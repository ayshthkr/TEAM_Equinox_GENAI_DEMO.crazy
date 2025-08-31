// src/components/BiasIndicator.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Colors from '../constants/colors';

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

const getStaticDistribution = (bias) => {
    switch (bias.toLowerCase()) {
      case 'left':
        return { left: 65, center: 20, right: 15 };
      case 'center':
        return { left: 25, center: 50, right: 25 };
      case 'right':
        return { left: 15, center: 20, right: 65 };
      default:
        return { left: 33, center: 34, right: 33 };
    }
  };

  const config = getBiasConfig(bias);
  const distribution = getStaticDistribution(bias);
  const total = distribution.left + distribution.center + distribution.right;
   return (
    <View style={styles.container}>
      {/* Distribution Bars */}
      <View style={styles.distributionContainer}>
        <View style={styles.barsContainer}>
          <View 
            style={[
              styles.bar, 
              styles.leftBar, 
              { width: total > 0 ? `${(distribution.left / total) * 100}%` : '0%' }
            ]} 
          />
          <View 
            style={[
              styles.bar, 
              styles.centerBar, 
              { width: total > 0 ? `${(distribution.center / total) * 100}%` : '0%' }
            ]} 
          />
          <View 
            style={[
              styles.bar, 
              styles.rightBar, 
              { width: total > 0 ? `${(distribution.right / total) * 100}%` : '0%' }
            ]} 
          />
        </View>
        
        {/* Labels */}
        <View style={styles.labelsContainer}>
          <Text style={[styles.label, styles.leftLabel]}>
            Left {distribution.left}%
          </Text>
          <Text style={[styles.label, styles.centerLabel]}>
            Center {distribution.center}%
          </Text>
          <Text style={[styles.label, styles.rightLabel]}>
            Right {distribution.right}%
          </Text>
        </View>
      </View>

      {/* Current Bias Indicator */}
      <View style={styles.currentBiasContainer}>
        <Text style={styles.currentBiasLabel}>Current Article Bias:</Text>
        <View style={styles.currentBias}>
          <View 
            style={[
              styles.biasDot, 
              { backgroundColor: config.color }
            ]} 
          />
          <Text style={[styles.biasText, { color: config.color }]}>
            {config.label}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'flex-start',
  },
  distributionContainer: {
    width: '100%',
    marginBottom: 12,
  },
  barsContainer: {
    flexDirection: 'row',
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    backgroundColor: Colors.background.tertiary,
    marginBottom: 8,
  },
  bar: {
    height: '100%',
  },
  leftBar: {
    backgroundColor: Colors.bias.left,
  },
  centerBar: {
    backgroundColor: Colors.bias.center,
  },
  rightBar: {
    backgroundColor: Colors.bias.right,
  },
  labelsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  label: {
    fontSize: 10,
    fontWeight: '500',
  },
  leftLabel: {
    color: Colors.bias.left,
  },
  centerLabel: {
    color: Colors.bias.center,
  },
  rightLabel: {
    color: Colors.bias.right,
  },
  currentBiasContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width:

 '100%',
  },
  currentBiasLabel: {
    fontSize: 12,
    color: Colors.text.secondary,
    fontWeight: '500',
  },
  currentBias: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  biasDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  biasText: {
    fontSize: 12,
    fontWeight: '600',
  },
});

export default BiasIndicator;

