// src/components/NewsCard.js
import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Image,
  FlatList,
} from "react-native";
import * as WebBrowser from "expo-web-browser";
import { Card, Chip, IconButton, Portal, Modal } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import BiasIndicator from "./BiasIndicator";
import { BlurView } from "expo-blur";
import Colors from "../constants/colors";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const NewsCard = ({ article, onPress, isSwipable = false }) => {
  const [imageError, setImageError] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [linksVisible, setLinksVisible] = useState(false);
  const flatListRef = useRef(null);

  const openLink = async (url) => {
    if (!url) return;
    try {
      await WebBrowser.openBrowserAsync(url);
    } catch { }
  };

  const getBiasColor = (bias) => {
    switch (bias?.toLowerCase()) {
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

  const getScoreColor = (score) => {
    if (score > 0.4) return Colors.status.verified;
    if (score > 0.2) return Colors.status.disputed;
    return Colors.status.unknown;
  };

  const formatScore = (score) => Math.round(score * 100);

  const handleScroll = (event) => {
    const index = Math.round(
      event.nativeEvent.contentOffset.x /
      event.nativeEvent.layoutMeasurement.width
    );
    setCurrentIndex(index);
  };

  const scrollTo = (index) => {
    if (flatListRef.current && index >= 0 && index < article.images.length) {
      flatListRef.current.scrollToIndex({ index, animated: true });
      setCurrentIndex(index);
    }
  };

  return (
    <>
      <Card style={[styles.card, isSwipable && styles.swipableCard]}>
        <TouchableOpacity onPress={onPress} activeOpacity={0.9}>
          {/* Image Carousel */}
          {Array.isArray(article.images) &&
            article.images.length > 0 &&
            !imageError ? (
            <View style={styles.imageContainer}>
              {/* Left Button */}
              {currentIndex > 0 && (
                <TouchableOpacity
                  style={localStyles.leftButton}
                  onPress={() => scrollTo(currentIndex - 1)}
                >
                  <Ionicons name="chevron-back" size={28} color="white" />
                </TouchableOpacity>
              )}

              <FlatList
                ref={flatListRef}
                data={article.images.slice(0, 5)}
                horizontal
                pagingEnabled
                keyExtractor={(_, idx) => `img-${idx}`}
                showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={handleScroll}
                renderItem={({ item }) => (
                  <Image
                    source={{ uri: item }}
                    style={styles.articleImage}
                    onError={() => setImageError(true)}
                    resizeMode="cover"
                  />
                )}
              />

              {/* Right Button */}
              {currentIndex < article.images.slice(0, 5).length - 1 && (
                <TouchableOpacity
                  style={localStyles.rightButton}
                  onPress={() => scrollTo(currentIndex + 1)}
                >
                  <Ionicons name="chevron-forward" size={28} color="white" />
                </TouchableOpacity>
              )}

              <View style={styles.imageOverlay}>
                <BlurView intensity={70} tint="dark" style={styles.blurWrapper}>
                  <Chip
                    mode="outlined"
                    style={styles.categoryChip}
                    textStyle={styles.categoryChipText}
                  >
                    {article.category}
                  </Chip>
                </BlurView>
              </View>
            </View>
          ) : (
            article.image &&
            !imageError && (
              <View style={styles.imageContainer}>
                <Image
                  source={{ uri: article.image }}
                  style={styles.articleImage}
                  onError={() => setImageError(true)}
                  resizeMode="cover"
                />
                <View style={styles.imageOverlay}>
                  <BlurView intensity={70} tint="dark" style={styles.blurWrapper}>
                    <Chip
                      mode="outlined"
                      style={styles.categoryChip}
                      textStyle={styles.categoryChipText}
                    >
                      {article.category}
                    </Chip>
                  </BlurView>
                </View>
              </View>
            )
          )}

          <Card.Content
            style={[
              styles.cardContent,
              isSwipable && styles.swipableCardContent,
            ]}
          >
            {/* Header with source + credibility */}
            <View style={styles.header}>
              <View style={styles.sourceContainer}>
                {article.favicon && (
                  <Image
                    source={{ uri: article.favicon }}
                    style={styles.favicon}
                  />
                )}
                <Text style={styles.sourceText} numberOfLines={1}>
                  {article.source}
                  {Array.isArray(article.sources) &&
                    article.sources.length > 1 && (
                      <Text style={styles.moreSourcesText}>
                        {" "}
                        +{article.sources.length - 1}
                      </Text>
                    )}
                </Text>
              </View>
              <View style={styles.metaContainer}>
                <Text style={styles.timeText}>
                  {getTimeAgo(article.timestamp)}
                </Text>
                <View style={styles.ringWrap}>
                  <View
                    style={[
                      styles.ring,
                      { borderColor: getScoreColor(article.score) },
                    ]}
                  />
                  <Text style={styles.ringText}>
                    {formatScore(article.score)}
                  </Text>
                </View>
              </View>
            </View>

            {/* Title */}
            <Text
              style={[styles.title, isSwipable && styles.swipableTitle]}
              numberOfLines={isSwipable ? 4 : 3}
            >
              {article.title}
            </Text>

            {/* Summary */}
            <Text
              style={[styles.summary, isSwipable && styles.swipableSummary]}
              numberOfLines={isSwipable ? 6 : 3}
            >
              {article.summary}
            </Text>

            {/* Links */}
            {/* {Array.isArray(article.links) && article.links.length > 0 && (
              <View style={styles.linksRow}>
                <Chip
                  icon="link-variant"
                  onPress={() => openLink(article.links[0])}
                  textStyle={styles.linkChipText}
                  style={styles.linkChip}
                >
                  Open source
                </Chip>
                {article.links.length > 1 && (
                  <Chip
                    onPress={() => setLinksVisible(true)}
                    textStyle={styles.linkChipText}
                    style={styles.linkChipSecondary}
                  >
                    +{article.links.length - 1} more
                  </Chip>
                )}
                <Portal>
                  <Modal
                    visible={linksVisible}
                    onDismiss={() => setLinksVisible(false)}
                    contentContainerStyle={styles.bottomSheet}
                  >
                    <View>
                      <Text style={styles.bottomSheetTitle}>All sources</Text>
                      {Array.isArray(article.links) &&
                        article.links.slice(1).map((u, idx) => (
                          <TouchableOpacity
                            key={`link-${idx}`}
                            style={styles.linkRow}
                            onPress={() => openLink(u)}
                          >
                            <Image
                              source={{
                                uri: `https://www.google.com/s2/favicons?domain=${(
                                  new URL(u).hostname || ""
                                ).replace("www.", "")}&sz=64`,
                              }}
                              style={styles.linkFavicon}
                            />
                            <View style={{ flex: 1 }}>
                              <Text style={styles.linkHost} numberOfLines={1}>
                                {(new URL(u).hostname || "").replace(
                                  "www.",
                                  ""
                                )}
                              </Text>
                              <Text style={styles.linkUrl} numberOfLines={1}>
                                {u}
                              </Text>
                            </View>
                            <Ionicons
                              name="open-outline"
                              size={18}
                              color={Colors.accent.primary}
                            />
                          </TouchableOpacity>
                        ))}
                    </View>
                  </Modal>
                </Portal>
              </View>
            )} */}

            {/* Footer with bias + fact-check */}
            <View style={styles.footer}>
              <View style={styles.leftFooter}>
                <BiasIndicator bias={article.bias} />
                {article.author && (
                  <Text style={styles.authorText}>by {article.author}</Text>
                )}
              </View>

              {/* <View style={styles.rightFooter}>
                <IconButton
                  icon="share-variant"
                  size={18}
                  iconColor={Colors.text.tertiary}
                  onPress={() => {
                    // Handle share
                  }}
                />
              </View> */}
            </View>
          </Card.Content>
        </TouchableOpacity>
      </Card>
    </>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 12,
    marginVertical: 8,
    elevation: 4,
    borderRadius: 16,
    backgroundColor: Colors.background.tertiary,
    borderWidth: 1,
    borderColor: Colors.border.primary,
    overflow: "hidden",
  },
  swipableCard: {
    marginHorizontal: 8,
    marginVertical: 0,
    elevation: 8,
    borderRadius: 20,
    height: "95%",
    backgroundColor: Colors.background.tertiary,
    borderWidth: 1,
    borderColor: Colors.border.secondary,
  },
  imageContainer: {
    position: "relative",
    height: 220,
    width: "100%",
    backgroundColor: Colors.background.secondary,
  },
  articleImage: {
    width: SCREEN_WIDTH - 24, // matches card width
    height: "100%",
    borderRadius: 0,
  },
  imageOverlay: {
    position: "absolute",
    top: 12,
    left: 12,
  },
  cardContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  swipableCardContent: {
    padding: 20,
    height: "100%",
    justifyContent: "space-between",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  sourceContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  favicon: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 6,
  },
  metaContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  ringWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  ring: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 14,
    borderWidth: 3,
  },
  ringText: {
    fontSize: 10,
    fontWeight: "700",
    color: Colors.text.primary,
  },
  blurWrapper: {
    borderRadius: 20,
    overflow: "hidden", // makes blur rounded
    marginRight: 6,
  },
  categoryChip: {
    backgroundColor: "transparent",
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  categoryChipText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#fff",
  },
  timeText: {
    fontSize: 11,
    color: Colors.text.tertiary,
    fontWeight: "500",
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.text.primary,
    marginBottom: 6,
    lineHeight: 24,
  },
  swipableTitle: {
    fontSize: 20,
    lineHeight: 26,
    marginBottom: 12,
    fontWeight: "700",
  },
  summary: {
    fontSize: 14,
    color: Colors.text.secondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  swipableSummary: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 20,
    flex: 1,
    color: Colors.text.secondary,
  },
  linksRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  linkChip: {
    height: 28,
  },
  linkChipSecondary: {
    height: 28,
    backgroundColor: Colors.background.secondary,
  },
  linkChipText: {
    fontSize: 12,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
  },
  leftFooter: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  rightFooter: {
    flexDirection: "row",
    alignItems: "center",
  },
  sourceText: {
    fontSize: 12,
    color: Colors.text.secondary,
    fontWeight: "500",
  },
  moreSourcesText: {
    fontSize: 12,
    color: Colors.text.tertiary,
    fontWeight: "500",
  },
  authorText: {
    fontSize: 11,
    color: Colors.text.tertiary,
    marginLeft: 8,
    fontStyle: "italic",
  },
  bottomSheet: {
    backgroundColor: Colors.background.secondary,
    margin: 16,
    padding: 16,
    borderRadius: 16,
  },
  bottomSheetTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.text.primary,
    marginBottom: 12,
  },
  linkRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 10,
  },
  linkFavicon: {
    width: 18,
    height: 18,
    borderRadius: 9,
  },
  linkHost: {
    fontSize: 13,
    color: Colors.text.primary,
    fontWeight: "600",
  },
  linkUrl: {
    fontSize: 12,
    color: Colors.text.tertiary,
  },
});

const localStyles = StyleSheet.create({
  leftButton: {
    position: "absolute",
    left: 10,
    top: "50%",
    zIndex: 2,
    backgroundColor: "rgba(0,0,0,0.4)",
    borderRadius: 20,
    padding: 6,
  },
  rightButton: {
    position: "absolute",
    right: 10,
    top: "50%",
    zIndex: 2,
    backgroundColor: "rgba(0,0,0,0.4)",
    borderRadius: 20,
    padding: 6,
  },
});

export default NewsCard;
