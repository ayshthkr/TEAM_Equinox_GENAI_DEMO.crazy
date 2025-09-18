// src/screens/HomeScreen.js
import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  View,
  StyleSheet,
  SafeAreaView,
  FlatList,
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Appbar } from "react-native-paper";
import { useFocusEffect } from "@react-navigation/native";
import CategoryTabs from "../components/CategoryTabs";
import SwipableCardContainer from "../components/SwipableCardContainer";
import NewsCard from "../components/NewsCard";
import LoadingCard from "../components/LoadingCard";
import EmptyState from "../components/EmptyState";
import useArticles from "../hooks/useArticles";
import Colors from "../constants/colors";
import { getInterestedTags } from "../storage/preferences";

const HomeScreen = ({ navigation }) => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [viewMode, setViewMode] = useState("scroll"); // 'scroll' or 'swipe'
  const [categories, setCategories] = useState(["For You", "Top News", "All"]);
  const [interestedTags, setInterestedTags] = useState([]);
  const [bannerVisible, setBannerVisible] = useState(true);
  const lastUpdated = "The API and scrapers have been closed on 13/09/25 due to GPU requirements and server costs, hence the news articles are old.Inconvenience is regretted.";
  // Map selectedCategory to API tags
  const tags = useMemo(() => {
    if (selectedCategory === "For You") return interestedTags;
    if (selectedCategory === "All" || selectedCategory === "Top News")
      return [];
    return [selectedCategory];
  }, [selectedCategory, interestedTags]);

  // Use the hook
  const { articles, loading, refreshing, canLoadMore, loadMore, refresh } =
    useArticles({ tags, limit: 20 });

  // Load interested tags on focus and on mount
  useFocusEffect(
    useCallback(() => {
      (async () => {
        const t = await getInterestedTags();
        setInterestedTags(Array.isArray(t) ? t : []);
      })();
    }, [])
  );

  useEffect(() => {
    (async () => {
      const t = await getInterestedTags();
      setInterestedTags(Array.isArray(t) ? t : []);
    })();
  }, []);

  // Compute display list (Top News sorted by urlCount)
  const displayedArticles = useMemo(() => {
    if (selectedCategory === "Top News") {
      const sorted = [...articles].sort(
        (a, b) => (b?.urlCount || 0) - (a?.urlCount || 0)
      );
      return sorted;
    }
    return articles;
  }, [articles, selectedCategory]);

  // Derive categories from articles
  useEffect(() => {
    const setFromArticles = () => {
      const set = new Set(["For You", "Top News", "All"]);
      for (const a of articles) {
        if (a?.category) set.add(a.category);
      }
      setCategories(Array.from(set));
    };
    setFromArticles();
  }, [articles]);

  // toggle view mode (list / swipe)
  const toggleViewMode = () => {
    setViewMode((v) => (v === "scroll" ? "swipe" : "scroll"));
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <Appbar.Header style={styles.header}>
        <Text style={styles.headerTitle}>
          <Text style={{ color: "white" }}>DEMO</Text>
          <Text style={{ color: "#1E90FF" }}>.crazy</Text>
        </Text>
      </Appbar.Header>



      {/* Category Tabs (only for scroll view) */}
      {viewMode === "scroll" && (
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
      {bannerVisible && (
        <View style={styles.banner}>
          <Text style={styles.bannerText}>
            News is updated till {lastUpdated}
          </Text>
          <TouchableOpacity onPress={() => setBannerVisible(false)}>
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>
        </View>
      )}
      {/* Main content */}
      {viewMode === "swipe" ? (
        <SwipableCardContainer
          articles={displayedArticles}
          navigation={navigation}
          onSwipeUp={() => { }}
          onSwipeDown={() => { }}
          canLoadMore={canLoadMore}
          onLoadMore={loadMore}
          isLoadingMore={loading}
        />
      ) : (
        <FlatList
          style={styles.scrollView}
          data={displayedArticles}
          keyExtractor={(item, index) => String(item?.id ?? index)}
          renderItem={({ item }) => (
            <NewsCard
              article={item}
              onPress={() =>
                navigation.navigate("ArticleDetail", { article: item })
              }
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
          onEndReachedThreshold={0.1} // much lower to guarantee triggering
          refreshing={refreshing}
          onRefresh={refresh}
          ListEmptyComponent={
            loading || refreshing ? (
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
              <ActivityIndicator
                color={Colors.accent.primary}
                style={{ marginVertical: 12 }}
              />
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
    shadowColor: "#000",
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
    fontWeight: "700",
    color: Colors.text.primary,
    letterSpacing: 0.5,
    paddingLeft: 16,
  },
  banner: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: Colors.accent.primary,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  bannerText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  closeText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    // marginLeft: 12,
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
    alignSelf: "center",
    marginVertical: 12,
  },
  loadMoreText: {
    color: "#fff",
    fontWeight: "600",
  },
});

export default HomeScreen;
