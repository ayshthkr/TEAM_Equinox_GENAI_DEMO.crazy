// src/components/CategoryTabs.js
import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { Chip } from 'react-native-paper';
import Colors from '../constants/colors';

const CategoryTabs = ({ categories = ['All'], selectedCategory, onCategoryChange }) => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      {categories.map((category) => (
        <Chip
          key={category}
          mode={selectedCategory === category ? 'flat' : 'outlined'}
          selected={selectedCategory === category}
          onPress={() => onCategoryChange(category)}
          style={[
            styles.chip,
            selectedCategory === category && styles.selectedChip,
          ]}
          textStyle={[
            styles.chipText,
            selectedCategory === category && styles.selectedChipText,
          ]}
        >
          {category}
        </Chip>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background.secondary,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.primary,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  chip: {
    marginRight: 8,
    height: 32,
    backgroundColor: Colors.background.tertiary,
    borderColor: Colors.border.primary,
    borderWidth: 1,
  },
  selectedChip: {
    backgroundColor: Colors.accent.primary,
    borderColor: Colors.accent.primary,
    elevation: 3,
    shadowColor: Colors.accent.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.text.secondary,
  },
  selectedChipText: {
    color: Colors.text.primary,
    fontWeight: '600',
  },
});

export default CategoryTabs;