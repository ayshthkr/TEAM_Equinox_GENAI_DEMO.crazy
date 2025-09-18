// src/components/EmptyState.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { IconButton } from 'react-native-paper';
import Colors from '../constants/colors';

const EmptyState = ({ 
  icon = 'newspaper-variant-outline', 
  title = 'No Articles Found', 
  subtitle = 'Try selecting a different category or refresh the feed',
  onRefresh 
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <IconButton
          icon={icon}
          size={64}
          iconColor={Colors.text.tertiary}
        />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
      {onRefresh && (
        <IconButton
          icon="refresh"
          size={24}
          iconColor={Colors.accent.primary}
          onPress={onRefresh}
          style={styles.refreshButton}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 64,
  },
  iconContainer: {
    marginBottom: 16,
    opacity: 0.6,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text.primary,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  refreshButton: {
    backgroundColor: Colors.surface.primary,
    borderRadius: 24,
  },
});

export default EmptyState;
