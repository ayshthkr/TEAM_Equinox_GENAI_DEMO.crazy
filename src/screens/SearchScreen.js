// src/screens/SearchScreen.js
import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Text,
  SafeAreaView,
} from 'react-native';
import { Searchbar, Appbar, Chip } from 'react-native-paper';
import NewsCard from '../components/NewsCard';
import { mockNewsData } from '../data/mockData';

const SearchScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [recentSearches, setRecentSearches] = useState(['Climate Change', 'Economy', 'AI Technology']);

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query.trim()) {
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
    }
  };

  const handleRecentSearchTap = (query) => {
    setSearchQuery(query);
    handleSearch(query);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Appbar.Header>
        <Appbar.Content title="Search News" />
      </Appbar.Header>
      
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search for news, topics, or sources..."
          onChangeText={handleSearch}
          value={searchQuery}
          style={styles.searchBar}
        />
      </View>

      {searchQuery === '' && (
        <View style={styles.recentSearches}>
          <Text style={styles.recentTitle}>Recent Searches</Text>
          <View style={styles.chipContainer}>
            {recentSearches.map((search, index) => (
              <Chip
                key={index}
                mode="outlined"
                onPress={() => handleRecentSearchTap(search)}
                style={styles.chip}
              >
                {search}
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
          />
        )}
        keyExtractor={(item) => item.id}
        style={styles.resultsList}
        ListEmptyComponent={
          searchQuery ? (
            <Text style={styles.noResults}>No articles found for "{searchQuery}"</Text>
          ) : null
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  searchContainer: {
    padding: 16,
    backgroundColor: 'white',
  },
  searchBar: {
    elevation: 2,
  },
  recentSearches: {
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  recentTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#424242',
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  chip: {
    marginRight: 8,
    marginBottom: 8,
  },
  resultsList: {
    flex: 1,
  },
  noResults: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
    color: '#757575',
  },
});

export default SearchScreen;