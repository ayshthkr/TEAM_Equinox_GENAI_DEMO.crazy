// src/screens/HomeScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { Appbar } from 'react-native-paper';
import CategoryTabs from '../components/CategoryTabs';
import SwipableCardContainer from '../components/SwipableCardContainer';
import NewsCard from '../components/NewsCard';
import LoadingCard from '../components/LoadingCard';
import EmptyState from '../components/EmptyState';
import { convertJsonToAppFormat, getCategories } from '../data/dataAdapter';
import Colors from '../constants/colors';

const HomeScreen = ({ navigation }) => {
  const [articles, setArticles] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [viewMode, setViewMode] = useState('scroll'); // 'scroll' or 'swipe'
  const [refreshing, setRefreshing] = useState(false);
  const [categories, setCategories] = useState(['All']);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    loadArticles();
  }, [selectedCategory]);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      // Simulate loading time for better UX
      await new Promise(resolve => setTimeout(resolve, 800));
      const availableCategories = getCategories();
      setCategories(availableCategories);
      loadArticles();
    } finally {
      setLoading(false);
    }
  };

  const loadArticles = () => {
    const allArticles = convertJsonToAppFormat();
    const filteredArticles =
      selectedCategory === 'All'
        ? allArticles
        : allArticles.filter(
            (article) => article.category === selectedCategory
          );
    setArticles(filteredArticles);
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      loadArticles();
      setRefreshing(false);
    }, 1000);
  }, [selectedCategory]);

  const toggleViewMode = () => {
    setViewMode(viewMode === 'scroll' ? 'swipe' : 'scroll');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <Appbar.Header style={styles.header}>
        <Appbar.Content
          title="NewsScope"
          titleStyle={styles.headerTitle}
        />
        <Appbar.Action
          icon={viewMode === 'scroll' ? 'gesture-swipe-vertical' : 'view-list'}
          onPress={toggleViewMode}
          iconColor={Colors.accent.primary}
        />
      </Appbar.Header>

      {/* Category Tabs */}
      <View style={styles.tabsWrapper}>
        <CategoryTabs
          categories={categories}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />
      </View>

      {/* News Feed */}
      {viewMode === 'swipe' ? (
        <SwipableCardContainer
          articles={articles}
          navigation={navigation}
          onSwipeUp={() => {}}
          onSwipeDown={() => {}}
        />
      ) : (
        <ScrollView
          style={styles.scrollView}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={Colors.accent.primary}
              colors={[Colors.accent.primary]}
            />
          }
          showsVerticalScrollIndicator={false}
        >
          {loading ? (
            // Show loading cards
            Array.from({ length: 5 }).map((_, index) => (
              <LoadingCard key={`loading-${index}`} />
            ))
          ) : articles.length === 0 ? (
            // Show empty state
            <EmptyState
              title={`No ${selectedCategory} Articles`}
              subtitle="Try selecting a different category or refresh to load new content"
              onRefresh={onRefresh}
            />
          ) : (
            // Show actual articles
            articles.map((article) => (
              <NewsCard
                key={article.id}
                article={article}
                onPress={() =>
                  navigation.navigate('ArticleDetail', { article })
                }
              />
            ))
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  header: {
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    backgroundColor: Colors.background.secondary,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.primary,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.text.primary,
    letterSpacing: 0.5,
  },
  tabsWrapper: {
    backgroundColor: Colors.background.secondary,
  },
  scrollView: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
});

export default HomeScreen;
