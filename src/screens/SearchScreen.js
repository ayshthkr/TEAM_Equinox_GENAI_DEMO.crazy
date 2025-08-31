// src/screens/SearchScreen.js
import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Text,
  SafeAreaView,
  TouchableOpacity,
  Keyboard,
} from 'react-native';
import { Searchbar, Appbar, Chip, IconButton } from 'react-native-paper';
import NewsCard from '../components/NewsCard';
import { mockNewsData } from '../data/mockData';
import Colors from '../constants/colors';

const SearchScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [recentSearches, setRecentSearches] = useState(['Climate Change', 'Technology', 'Global Economy', 'Health', 'AI Innovation']);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query.trim()) {
      setIsSearching(true);
      const results = mockNewsData.filter(article =>
        article.title.toLowerCase().includes(query.toLowerCase()) ||
        article.summary.toLowerCase().includes(query.toLowerCase()) ||
        article.category.toLowerCase().includes(query.toLowerCase())
      );
      setSearchResults(results);
      
      if (!recentSearches.includes(query) && query.trim()) {
        setRecentSearches(prev => [query, ...prev.slice(0, 4)]);
      }
    } else {
      setSearchResults([]);
      setIsSearching(false);
    }
  };

  const handleRecentSearchTap = (query) => {
    setSearchQuery(query);
    handleSearch(query);
    Keyboard.dismiss();
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setIsSearching(false);
    Keyboard.dismiss();
  };

  const removeRecentSearch = (searchToRemove, e) => {
    e.stopPropagation();
    setRecentSearches(prev => prev.filter(search => search !== searchToRemove));
  };

  const clearAllRecentSearches = () => {
    setRecentSearches([]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Appbar.Header style={styles.header}>
        <Appbar.BackAction onPress={() => navigation.goBack()} color={Colors.text.primary} />
        <Appbar.Content 
          title="Search News" 
          titleStyle={styles.headerTitle}
        />
      </Appbar.Header>
      
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search for news, topics, or sources..."
          placeholderTextColor={Colors.text.secondary}
          onChangeText={handleSearch}
          value={searchQuery}
          style={styles.searchBar}
          iconColor={Colors.text.secondary}
          inputStyle={styles.searchInput}
          onSubmitEditing={() => handleSearch(searchQuery)}
          clearIcon={searchQuery ? () => (
            <IconButton
              icon="close"
              size={20}
              onPress={clearSearch}
              color={Colors.text.secondary}
            />
          ) : null}
        />
      </View>

      {searchQuery === '' && recentSearches.length > 0 && (
        <View style={styles.recentSearches}>
          <View style={styles.recentHeader}>
            <Text style={styles.recentTitle}>Recent Searches</Text>
            <TouchableOpacity onPress={clearAllRecentSearches}>
              <Text style={styles.clearButton}>Clear all</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.chipContainer}>
            {recentSearches.map((search, index) => (
              <View key={index} style={styles.chipWrapper}>
                <Chip
                  mode="outlined"
                  onPress={() => handleRecentSearchTap(search)}
                  style={styles.chip}
                  textStyle={styles.chipText}
                >
                  {search}
                </Chip>
                <TouchableOpacity 
                  onPress={(e) => removeRecentSearch(search, e)}
                  style={styles.removeButton}
                >
                  <Text style={styles.removeIcon}>×</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>
      )}

      {searchQuery === '' && (
        <View style={styles.suggestions}>
          <Text style={styles.sectionTitle}>Popular Topics</Text>
          <View style={styles.chipContainer}>
            {['Technology', 'Politics', 'Business', 'Health', 'Entertainment', 'Sports'].map((topic, index) => (
              <Chip
                key={index}
                mode="outlined"
                onPress={() => handleRecentSearchTap(topic)}
                style={styles.topicChip}
                textStyle={styles.topicChipText}
              >
                {topic}
              </Chip>
            ))}
          </View>
        </View>
      )}

      <FlatList
        data={searchResults}
        renderItem={({ item }) => (
          <NewsCard
            article={item}
            onPress={() => navigation.navigate('ArticleDetail', { article: item })}
            style={styles.newsCard}
          />
        )}
        keyExtractor={(item) => item.id}
        style={styles.resultsList}
        contentContainerStyle={styles.resultsContent}
        ListEmptyComponent={
          searchQuery && !isSearching ? (
            <View style={styles.emptyState}>
              <Text style={styles.noResults}>No articles found for "{searchQuery}"</Text>
              <Text style={styles.noResultsSubtitle}>Try different keywords or browse popular topics</Text>
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  header: {
    backgroundColor: Colors.background.secondary,
    elevation: 0,
    shadowOpacity: 0,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.primary,
  },
  headerTitle: {
    color: Colors.text.primary,
    fontWeight: '600',
    fontSize: 18,
  },
  searchContainer: {
    padding: 16,
    backgroundColor: Colors.background.secondary,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.primary,
  },
  searchBar: {
    elevation: 0,
    shadowOpacity: 0,
    backgroundColor: Colors.background.tertiary,
    borderRadius: 12,
    height: 48,
  },
  searchInput: {
    color: Colors.text.primary,
    fontSize: 16,
  },
  recentSearches: {
    padding: 16,
    backgroundColor: Colors.background.secondary,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.primary,
  },
  recentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  recentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  clearButton: {
    color: Colors.accent.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chipWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  chip: {
    backgroundColor: Colors.background.tertiary,
    borderColor: Colors.border.primary,
    borderWidth: 1,
    height: 36,
  },
  chipText: {
    color: Colors.text.primary,
    fontSize: 14,
  },
  removeButton: {
    marginLeft: 4,
    padding: 4,
  },
  removeIcon: {
    color: Colors.text.secondary,
    fontSize: 18,
    fontWeight: 'bold',
  },
  suggestions: {
    padding: 16,
    backgroundColor: Colors.background.secondary,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 12,
  },
  topicChip: {
    backgroundColor: 'rgba(0, 122, 255, 0.15)', // Using rgba with accent.primary color
    borderColor: Colors.accent.primary,
    borderWidth: 1,
    height: 36,
  },
  topicChipText: {
    color: Colors.accent.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  resultsList: {
    flex: 1,
  },
  resultsContent: {
    padding: 16,
  },
  newsCard: {
    marginBottom: 16,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  noResults: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 8,
    textAlign: 'center',
  },
  noResultsSubtitle: {
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
});

export default SearchScreen;