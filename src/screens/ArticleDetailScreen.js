// src/screens/ArticleDetailScreen.js
import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  Image,
  Share,
  Linking,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { Appbar, Card, Chip, IconButton, Divider } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { fetchArticles } from "../api/articles";
import { mapApiArticle } from "../hooks/useArticles";

import BiasIndicator from "../components/BiasIndicator";
import { getInterestedTags, toggleInterestedTag } from "../storage/preferences";

import Colors from "../constants/colors";
import { useFocusEffect } from "@react-navigation/native";

const FALLBACK_IMAGE = 'https://thumbs.dreamstime.com/b/news-woodn-dice-depicting-letters-bundle-small-newspapers-leaning-left-dice-34802664.jpg';

const buildFaviconUrl = (hostname) =>
  hostname
    ? `https://www.google.com/s2/favicons?domain=${hostname}&sz=64`
    : undefined;

const extractHostname = (url) => {
  try {
    return new URL(url).hostname.replace("www.", "");
  } catch {
    return null;
  }
};

const ArticleDetailScreen = ({ route, navigation }) => {
  const { article } = route.params;
  const [interested, setInterested] = useState(false);
  const scrollRef = useRef(null);
  useEffect(() => {
    let mounted = true;
    (async () => {
      const tags = await getInterestedTags();
      if (mounted)
        setInterested(Array.isArray(tags) && tags.includes(article.category));
    })();
    return () => {
      mounted = false;
    };
  }, [article?.category]);

  const [sourcesExpanded, setSourcesExpanded] = useState(false);
   useFocusEffect(
    React.useCallback(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTo({ y: 0, animated: true });
      }
    }, [])
  );

  const linkHosts = useMemo(() => {
    const arr = Array.isArray(article.links) ? article.links : [];
    return arr
      .map((u) => {
        const host = extractHostname(u);
        if (!host) return null;
        return { url: u, host, favicon: buildFaviconUrl(host) };
      })
      .filter(Boolean);
  }, [article?.links]);

  const handleOpenSource = (u) => {
    if (u) Linking.openURL(u);
  };

  const handleToggleInterested = async () => {
    const next = await toggleInterestedTag(article.category);
    setInterested(Array.isArray(next) && next.includes(article.category));
  };
  const [recommended, setRecommended] = useState([]);

  useEffect(() => {
    // console.log(article.images[1]);

    let alive = true;
    (async () => {
      try {
        const tagList =
          Array.isArray(article.tags) && article.tags.length > 0
            ? article.tags
            : article.category
            ? [article.category]
            : [];
        if (tagList.length === 0) {
          if (alive) setRecommended([]);
          return;
        }
        const res = await fetchArticles({ tags: tagList, limit: 5, skip: 0 });
        const mapped = Array.isArray(res?.articles)
          ? res.articles.map(mapApiArticle)
          : [];
        const deduped = mapped.filter((a) => a.id !== article.id).slice(0, 5);
        if (alive) setRecommended(deduped);
      } catch (e) {
        if (alive) setRecommended([]);
      }
    })();
    return () => {
      alive = false;
    };
  }, [article?.id, article?.category, JSON.stringify(article?.tags)]);

  const handleShare = async () => {
    try {
      await Share.share({
        message: `${article.title}\n\n${article.summary}\n\nRead more: ${article.url}`,
        url: article.url,
        title: article.title,
      });
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  const handleOpenUrl = () => {
    if (article.url) {
      Linking.openURL(article.url);
    }
  };

  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const articleTime = new Date(timestamp);
    const diffInHours = Math.floor((now - articleTime) / (1000 * 60 * 60));

    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const days = Math.floor(diffInHours / 24);
    if (days < 7) return `${days}d ago`;
    return `${Math.floor(days / 7)}w ago`;
  };

  const getBiasColor = (bias) => {
    switch (bias.toLowerCase()) {
      case "left":
        return Colors.bias.left;
      case "center":
        return Colors.bias.center;
      case "right":
        return Colors.bias.right;
      default:
        return Colors.text.tertiary;
    }
  };

  const formatScore = (score) => {
    return Math.round(score * 100);
  };

  const getScoreColor = (score) => {
    if (score >= 0.8) return Colors.status.verified;
    if (score >= 0.6) return Colors.status.disputed;
    return Colors.status.false;
  };

  return (
    <SafeAreaView style={styles.container} edges={["right", "left"]}>
      <Appbar.Header style={styles.header}>
        <Appbar.BackAction
          onPress={() => navigation.goBack()}
          color={Colors.text.primary}
          size={24}
        />
        <Appbar.Content
          title="Article Details"
          titleStyle={styles.headerTitle}
        />
        <Appbar.Action
          icon="share-variant"
          onPress={handleShare}
          color={Colors.text.primary}
          size={24}
        />
        <Appbar.Action
          icon="open-in-new"
          onPress={handleOpenUrl}
          color={Colors.text.primary}
          size={24}
        />
      </Appbar.Header>

      <ScrollView
        style={styles.scrollView}
        ref={scrollRef} 
        showsVerticalScrollIndicator={false}
      >
        {/* Image Carousel */}
        {Array.isArray(article.images) && article.images.length > 0 ? (
          <View style={styles.imageContainer}>
            <FlatList
              data={article.images.slice(0, 5)}
              keyExtractor={(_, idx) => `${article.id}-img-${idx}`}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              renderItem={({ item }) => (
                <Image
                  source={{ uri: item }}
                  style={styles.heroImage}
                  resizeMode="cover"
                />
              )}
            />
          </View>
        ) : (
          // fallback image when no images
          <View style={styles.imageContainer}>
            <Image
              source={ {uri: FALLBACK_IMAGE}} // put your fallback image here
              style={styles.heroImage}
              resizeMode="cover"
            />
          </View>
        )}

        <View style={styles.content}>
          {/* Article Header */}
          <View style={styles.articleHeader}>
            <Text style={styles.title}>{article.title}</Text>

            <View style={styles.metaInfo}>
              <View style={styles.sourceContainer}>
                {article.favicon && (
                  <Image
                    source={{ uri: article.favicon }}
                    style={styles.favicon}
                    onError={() => {}}
                  />
                )}
                <Text style={styles.sourceText}>{article.source}</Text>
                {article.author && (
                  <Text style={styles.authorText}>• by {article.author}</Text>
                )}
              </View>
              <Text style={styles.timeText}>
                {getTimeAgo(article.timestamp)}
              </Text>
            </View>

            {interested && (
              <View style={{ marginTop: 8 }}>
                <Chip
                  mode="flat"
                  style={styles.interestedChip}
                  textStyle={styles.interestedChipText}
                >
                  Interested in this topic
                </Chip>
              </View>
            )}
          </View>

          <Divider style={styles.divider} />

          {/* Article Summary */}
          <Card style={styles.summaryCard} elevation={1}>
            <Card.Content>
              <Text style={styles.summaryTitle}>Summary</Text>
              <Text style={styles.summaryText}>{article.summary}</Text>
            </Card.Content>
          </Card>

          {/* Analysis Section */}
          <Card style={styles.analysisCard} elevation={1}>
            <Card.Content>
              <View style={styles.analysisHeader}>
                <Text style={styles.analysisTitle}>Credibility Analysis</Text>
              </View>

              <View style={styles.analysisGrid}>
                {/* Credibility Score */}
                <View style={styles.analysisItem}>
                  <Text style={styles.analysisLabel}>Credibility Score</Text>
                  <View
                    style={[
                      styles.scoreContainer,
                      { backgroundColor: getScoreColor(article.score) + "20" },
                    ]}
                  >
                    <Text
                      style={[
                        styles.scoreText,
                        { color: getScoreColor(article.score) },
                      ]}
                    >
                      {formatScore(article.score)}/100
                    </Text>
                  </View>
                </View>

                {/* Political Bias */}
                <View style={styles.analysisItem}>
                  <Text style={styles.analysisLabel}>Political Bias</Text>
                  <BiasIndicator bias={article.bias} />
                </View>

                {/* Category */}
                <View style={styles.analysisItem}>
                  <Text style={styles.analysisLabel}>Category</Text>
                  <View style={styles.tagsContainer}>
                    {Array.isArray(article.tags) &&
                      article.tags.length > 0 &&
                      article.tags.map((tag, index) => (
                        <Chip
                          key={index}
                          mode="outlined"
                          style={styles.categoryBadge}
                          textStyle={styles.categoryBadgeText}
                        >
                          {tag}
                        </Chip>
                      ))}
                  </View>
                </View>
                {/* Sources */}
                <View style={styles.analysisItem}>
                  <Text style={styles.analysisLabel}>Sources</Text>
                  {linkHosts.length > 0 && (
                    <TouchableOpacity
                      style={styles.sourcesRow}
                      activeOpacity={0.8}
                      onPress={() => setSourcesExpanded((v) => !v)}
                    >
                      <View style={styles.sourcesStack}>
                        {linkHosts.slice(0, 3).map((l, i) => (
                          <Image
                            key={`src-stack-${i}`}
                            source={{ uri: l.favicon }}
                            style={[
                              styles.sourceAvatar,
                              { marginLeft: i === 0 ? 0 : -10, zIndex: 10 - i },
                            ]}
                          />
                        ))}
                        {linkHosts.length > 3 && (
                          <Text style={styles.moreBadge}>
                            +{linkHosts.length - 3}
                          </Text>
                        )}
                      </View>
                      <Text style={styles.sourceHostText}>
                        {sourcesExpanded ? "Hide sources" : "View sources"}
                      </Text>
                    </TouchableOpacity>
                  )}

                  {sourcesExpanded && (
                    <View style={styles.sourceList}>
                      {linkHosts.map((l, idx) => (
                        <TouchableOpacity
                          key={`src-item-${idx}`}
                          style={styles.sourceListItem}
                          onPress={() => handleOpenSource(l.url)}
                        >
                          <Image
                            source={{ uri: l.favicon }}
                            style={styles.sourceListIcon}
                          />
                          <Text style={styles.sourceListText}>{l.host}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>
              </View>
            </Card.Content>
          </Card>

          {/* Recommended */}
          {recommended.length > 0 && (
            <View style={styles.recSection}>
              <Text style={styles.recTitle}>Recommended</Text>
              <FlatList
                data={recommended}
                keyExtractor={(item, idx) => String(item?.id ?? idx)}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.recList}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    activeOpacity={0.85}
                    style={styles.recCard}
                    onPress={() => {navigation.navigate("ArticleDetail", { article: item })
                      if (scrollRef.current) {
                        scrollRef.current.scrollTo({ y: 0, animated: true });
                      }
                    }}
                  >
                    <Image
                      source={{ uri: item.image }}
                      style={styles.recImage}
                    />
                    <Text numberOfLines={2} style={styles.recCardTitle}>
                      {item.title}
                    </Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          )}

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
              <IconButton
                icon="share-variant"
                size={20}
                iconColor={Colors.text.primary}
                style={styles.actionIcon}
              />
              <Text style={styles.actionText}>Share</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleToggleInterested}
            >
              <IconButton
                icon={interested ? "star" : "star-outline"}
                size={20}
                iconColor={
                  interested ? Colors.accent.primary : Colors.text.primary
                }
                style={styles.actionIcon}
              />
              <Text
                style={[
                  styles.actionText,
                  interested && { color: Colors.accent.primary },
                ]}
              >
                Interested
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleOpenUrl}
            >
              <IconButton
                icon="open-in-new"
                size={20}
                iconColor={Colors.text.primary}
                style={styles.actionIcon}
              />
              <Text style={styles.actionText}>Open</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
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
    fontWeight: "600",
    fontSize: 18,
    letterSpacing: -0.5,
  },
  scrollView: {
    flex: 1,
  },
  imageContainer: {
  position: "relative",
  height: 280,
  width: "100%", // ensures container spans full width
  backgroundColor: Colors.background.tertiary,
},
heroImage: {
  width: Dimensions.get("window").width, // 👈 ensures each image spans screen width
  height: "100%",
},
  imageOverlay: {
    position: "absolute",
    top: 20,
    left: 20,
  },
  categoryChip: {
    height: 32,
    paddingHorizontal: 16,
    borderRadius: 16,
  },
  categoryChipText: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.text.primary,
  },
  content: {
    padding: 20,
  },
  articleHeader: {
    marginBottom: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: Colors.text.primary,
    lineHeight: 34,
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  metaInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
  },
  sourceContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    flexWrap: "wrap",
  },
  favicon: {
    width: 22,
    height: 22,
    borderRadius: 11,
    marginRight: 10,
    backgroundColor: Colors.background.tertiary,
  },
  sourceText: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.text.secondary,
    marginRight: 8,
  },
  authorText: {
    fontSize: 14,
    color: Colors.text.tertiary,
    fontStyle: "italic",
  },
  timeText: {
    fontSize: 13,
    color: Colors.text.tertiary,
    fontWeight: "500",
  },
  divider: {
    backgroundColor: Colors.border.primary,
    marginVertical: 20,
    height: 1,
  },
  summaryCard: {
    backgroundColor: Colors.background.secondary,
    marginBottom: 20,
    borderRadius: 16,
    borderWidth: 0,
    elevation: 2,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.text.primary,
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  summaryText: {
    fontSize: 16,
    color: Colors.text.secondary,
    lineHeight: 24,
    letterSpacing: 0.2,
  },
  analysisCard: {
    backgroundColor: Colors.background.secondary,
    marginBottom: 20,
    borderRadius: 16,
    borderWidth: 0,
    elevation: 2,
  },
  analysisHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  analysisTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.text.primary,
    letterSpacing: -0.5,
  },
  infoIcon: {
    margin: 0,
  },
  analysisGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 16,
  },
  analysisItem: {
    marginBottom: 12,
  },

  analysisLabel: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 6,
    color: "#333",
  },
  scoreContainer: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  scoreText: {
    fontSize: 14,
    fontWeight: "600",
  },

  // Recommended styles
  recSection: {
    marginTop: 8,
    marginBottom: 20,
  },
  recTitle: {
    color: Colors.text.primary,
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 10,
  },
  recList: {
    paddingRight: 12,
  },
  recCard: {
    width: 180,
    marginRight: 12,
  },
  recImage: {
    width: 180,
    height: 110,
    borderRadius: 12,
    backgroundColor: Colors.background.tertiary,
    marginBottom: 6,
  },
  recCardTitle: {
    color: Colors.text.primary,
    fontSize: 14,
    fontWeight: "600",
  },
  tagsContainer: {
    flexDirection: "row", // side by side
    flexWrap: "wrap", // wrap to new line if needed
    gap: 8, // RN 0.71+ (else use margin)
  },

  categoryBadge: {
    borderColor: "#4A90E2",
    backgroundColor: "transparent",
    marginRight: 8, // fallback if gap not supported
    marginBottom: 8, // fallback if gap not supported
  },

  categoryBadgeText: {
    color: "#4A90E2",
    fontWeight: "600",
  },
  // Sources styles
  sourcesRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  sourcesStack: {
    flexDirection: "row",
    alignItems: "center",
  },
  sourceAvatar: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: Colors.background.primary,
    backgroundColor: Colors.background.tertiary,
  },
  moreBadge: {
    marginLeft: 6,
    color: Colors.text.secondary,
    fontWeight: "700",
  },
  sourceHostText: {
    marginLeft: 10,
    color: Colors.text.secondary,
    fontSize: 13,
    fontWeight: "600",
  },
  sourceList: {
    marginTop: 8,
  },
  sourceListItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
  },
  sourceListIcon: {
    width: 18,
    height: 18,
    borderRadius: 9,
    marginRight: 8,
    backgroundColor: Colors.background.tertiary,
  },
  sourceListText: {
    color: Colors.text.primary,
    fontSize: 14,
  },

  textCard: {
    backgroundColor: Colors.background.secondary,
    marginBottom: 20,
    borderRadius: 16,
    borderWidth: 0,
    elevation: 2,
  },
  textTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.text.primary,
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  interestedChip: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(0, 122, 255, 0.15)",
    borderRadius: 14,
    height: 28,
    paddingHorizontal: 12,
  },
  interestedChipText: {
    color: Colors.accent.primary,
    fontSize: 12,
    fontWeight: "600",
  },
  fullText: {
    fontSize: 15,
    color: Colors.text.secondary,
    lineHeight: 22,
    letterSpacing: 0.2,
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 24,
    marginTop: 24,
    marginBottom: 40,
  },
  actionButton: {
    alignItems: "center",
    backgroundColor: Colors.surface.primary,
    padding: 12,
    borderRadius: 20,
    minWidth: 80,
    elevation: 2,
  },
  actionIcon: {
    margin: 0,
  },
  actionText: {
    fontSize: 12,
    color: Colors.text.primary,
    fontWeight: "500",
    marginTop: 4,
  },
});

export default ArticleDetailScreen;
