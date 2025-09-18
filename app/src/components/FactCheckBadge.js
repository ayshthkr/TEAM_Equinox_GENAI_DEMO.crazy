// src/components/FactCheckBadge.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const FactCheckBadge = ({ status, confidence }) => {
  const getStatusConfig = (status) => {
    switch (status.toLowerCase()) {
      case 'verified':
        return {
          icon: 'checkmark-circle',
          color: '#4CAF50',
          backgroundColor: '#1B4D1B', // Dark green background
          label: 'Verified',
        };
      case 'disputed':
        return {
          icon: 'warning',
          color: '#FF9800',
          backgroundColor: '#4D3300', // Dark orange background
          label: 'Disputed',
        };
      case 'false':
        return {
          icon: 'close-circle',
          color: '#F44336',
          backgroundColor: '#4D1A1A', // Dark red background
          label: 'False',
        };
      default:
        return {
          icon: 'help-circle',
          color: '#B0B0B0',
          backgroundColor: '#404040', // Dark gray background
          label: 'Unverified',
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <View style={[styles.container, { backgroundColor: config.backgroundColor }]}>
      <Ionicons name={config.icon} size={16} color={config.color} />
      <Text style={[styles.label, { color: config.color }]}>
        {config.label}
      </Text>
      {confidence && (
        <Text style={[styles.confidence, { color: config.color }]}>
          {Math.round(confidence)}%
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  confidence: {
    fontSize: 10,
    marginLeft: 4,
    fontWeight: '500',
  },
});

export default FactCheckBadge;