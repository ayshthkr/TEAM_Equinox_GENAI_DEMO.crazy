// src/screens/HomeScreen.js
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  FlatList,
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Appbar } from 'react-native-paper';
import CategoryTabs from '../components/CategoryTabs';
import SwipableCardContainer from '../components/SwipableCardContainer';
import NewsCard from '../components/NewsCard';
import LoadingCard from '../components/LoadingCard';
import EmptyState from '../components/EmptyState';
import useArticles from '../hooks/useArticles';
import Colors from '../constants/colors';

const HomeScreen = ({ navigation }) => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [viewMode, setViewMode] = useState('scroll'); // 'scroll' or 'swipe'
  const [categories, setCategories] = useState(['All']);

  // Map selectedCategory to API tags
  const tags = useMemo(() => (selectedCategory === 'All' ? [] : [selectedCategory]), [selectedCategory]);

  // Use the hook
  const { 
    articles,
    loading,
    refreshing,
    canLoadMore,
    loadMore,
    refresh,
    error,
  } = useArticles({ tags, limit: 20 });

  // Derive categories from articles
  useEffect(() => {
    const setFromArticles = () => {
      const set = new Set(['All']);
      for (const a of articles) {
        if (a?.category) set.add(a.category);
      }
      setCategories(Array.from(set));
    };
    setFromArticles();
  }, [articles]);

  // toggle view mode (list / swipe)
  const toggleViewMode = () => {
    setViewMode((v) => (v === 'scroll' ? 'swipe' : 'scroll'));
  };

  // Momentum guard to prevent multiple onEndReached triggers
  const onEndReachedCalledDuringMomentum = useRef(true);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <Appbar.Header style={styles.header}>
        <Appbar.Content title="NewsScope" titleStyle={styles.headerTitle} />
        <Appbar.Action
          icon={viewMode === 'scroll' ? 'gesture-swipe-vertical' : 'view-list'}
          onPress={toggleViewMode}
          iconColor={Colors.accent.primary}
        />
      </Appbar.Header>

      {/* Category Tabs (only for scroll view) */}
      {viewMode === 'scroll' && (
        <View style={styles.tabsWrapper}>
          <CategoryTabs
            categories={categories}
            selectedCategory={selectedCategory}
            onCategoryChange={(cat) => {
              setSelectedCategory(cat);
              // scroll-to-top handled by FlatList refresh behavior (optional)
            }}
          />
        </View>
      )}

      {/* Main content */}
      {viewMode === 'swipe' ? (
        <SwipableCardContainer
          articles={articles}
          navigation={navigation}
          onSwipeUp={() => {}}
          onSwipeDown={() => {}}
          canLoadMore={canLoadMore}
          onLoadMore={loadMore}
          isLoadingMore={loading}
        />
      ) : (
      <FlatList
  style={styles.scrollView}
  data={articles}
  keyExtractor={(item, index) => String(item?.id ?? index)}
  renderItem={({ item }) => (
    <NewsCard
      article={item}
      onPress={() => navigation.navigate('ArticleDetail', { article: item })}
    />
  )}
  contentContainerStyle={{ paddingBottom: 48, flexGrow: 1 }}
  onEndReached={() => {
    console.log("🔵 onEndReached fired");
    if (!loading) {
      console.log("🟢 loadMore called");
      loadMore();
    }
  }}
  onEndReachedThreshold={0.1}   // much lower to guarantee triggering
  refreshing={refreshing}
  onRefresh={refresh}
  ListEmptyComponent={
    loading  || refreshing? (
      <View>
        {Array.from({ length: 5 }).map((_, index) => (
          <LoadingCard key={`loading-${index}`} />
        ))}
      </View>
    ) : (
      <EmptyState
        title={`No ${selectedCategory} Articles`}
        subtitle="Try selecting a different category or refresh to load new content"
        onRefresh={refresh}
      />
    )
  }
  ListFooterComponent={() =>
    loading && articles.length > 0 ? (
      <ActivityIndicator color={Colors.accent.primary} style={{ marginVertical: 12 }} />
    ) : null
  }
  showsVerticalScrollIndicator={false}
/>
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
    height: 60,
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
  loadMoreButton: {
    backgroundColor: Colors.accent.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    alignSelf: 'center',
    marginVertical: 12,
  },
  loadMoreText: {
    color: '#fff',
    fontWeight: '600',
  },
});

export default HomeScreen;
