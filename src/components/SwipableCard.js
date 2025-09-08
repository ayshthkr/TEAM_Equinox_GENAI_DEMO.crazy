// src/components/SwipableCard.js
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
import { Chip, IconButton, Portal, Modal } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import BiasIndicator from "./BiasIndicator";
import { BlurView } from "expo-blur";
import Colors from "../constants/colors";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const FALLBACK_IMAGE =
  "https://thumbs.dreamstime.com/b/news-woodn-dice-depicting-letters-bundle-small-newspapers-leaning-left-dice-34802664.jpg";

const SwipableCard = ({ article, onPress }) => {
  const [imageError, setImageError] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [linksVisible, setLinksVisible] = useState(false);
  const flatListRef = useRef(null);

  const openLink = async (url) => {
    if (!url) return;
    try {
      await WebBrowser.openBrowserAsync(url);
    } catch {}
  };

  const getBiasColor = (bias) => {
    switch ((bias || "").toLowerCase()) {
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

  const formatScore = (score) => Math.round((Number(score) || 0) * 100);
  const getScoreColor = (score) => {
    const s = Number(score) || 0;
    if (s >= 0.8) return Colors.status.verified;
    if (s >= 0.6) return Colors.status.disputed;
    return Colors.status.false;
  };

  const images = Array.isArray(article.images)
    ? article.images
    : article.image
    ? [article.image]
    : [FALLBACK_IMAGE];

  const renderImage = ({ item }) => (
    <Image
      source={{ uri: item }}
      style={styles.image}
      onError={() => setImageError(true)}
      resizeMode="cover"
    />
  );

  const scrollTo = (index) => {
    if (!flatListRef.current) return;
    if (index >= 0 && index < images.length) {
      flatListRef.current.scrollToIndex({ index, animated: true });
      setCurrentIndex(index);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.93}
        style={{ flex: 1 }}
      >
        {/* Top media area */}
        {images.length > 0 && !imageError ? (
          <View style={styles.imageWrap}>
            <FlatList
              ref={flatListRef}
              data={images}
              keyExtractor={(u, i) => `${u}-${i}`}
              renderItem={renderImage}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={(e) => {
                const idx = Math.round(
                  e.nativeEvent.contentOffset.x / SCREEN_WIDTH
                );
                setCurrentIndex(idx);
              }}
            />

            {/* Carousel quick nav (optional) */}
            {images.length > 1 && (
              <>
                <TouchableOpacity
                  style={localStyles.leftButton}
                  onPress={() => scrollTo(currentIndex - 1)}
                >
                  <Ionicons name="chevron-back" size={24} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={localStyles.rightButton}
                  onPress={() => scrollTo(currentIndex + 1)}
                >
                  <Ionicons name="chevron-forward" size={24} color="#fff" />
                </TouchableOpacity>
              </>
            )}

            {/* Category chip overlay */}
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
          <View style={styles.imageWrap}>
            <Image
              source={{ uri: FALLBACK_IMAGE }}
              style={styles.image}
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
        )}

        {/* Content area */}
        <View style={styles.content}>
          {/* Header: source and credibility */}
          <View style={styles.header}>
            <View style={styles.sourceContainer}>
              {article.favicon ? (
                <Image
                  source={{ uri: article.favicon }}
                  style={styles.favicon}
                />
              ) : null}
              <Text style={styles.sourceText} numberOfLines={1}>
                {article.source}
                {Array.isArray(article.sources) &&
                  article.sources.length > 1 && (
                    <Text style={styles.moreSourcesText}>{` +${
                      article.sources.length - 1
                    }`}</Text>
                  )}
              </Text>
            </View>
            <View style={styles.metaContainer}>
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
          <Text style={styles.title} numberOfLines={3}>
            {article.title}
          </Text>

          {/* Summary */}
          <Text style={styles.summary} numberOfLines={6}>
            {article.summary}
          </Text>

          {/* Links */}
          {Array.isArray(article.links) && article.links.length > 0 && (
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
            </View>
          )}

          {/* Footer */}
          <View style={styles.footer}>
            <View style={styles.leftFooter}>
              <BiasIndicator bias={article.bias} />
              {article.author ? (
                <Text style={styles.authorText}>by {article.author}</Text>
              ) : null}
            </View>
            <View style={styles.rightFooter}>
              <IconButton
                icon="share-variant"
                size={18}
                iconColor={Colors.text.tertiary}
                onPress={() => {}}
              />
            </View>
          </View>
        </View>
      </TouchableOpacity>

      {/* Links Bottom Sheet */}
      <Portal>
        <Modal
          visible={linksVisible}
          onDismiss={() => setLinksVisible(false)}
          contentContainerStyle={styles.bottomSheet}
        >
          <View>
            <Text style={styles.bottomSheetTitle}>All sources</Text>
            {Array.isArray(article.links) &&
              article.links.slice(1).map((u, idx) => {
                let host = "";
                try {
                  host = new URL(u).hostname.replace("www.", "");
                } catch {}
                return (
                  <TouchableOpacity
                    key={`link-${idx}`}
                    style={styles.linkRow}
                    onPress={() => openLink(u)}
                  >
                    <Image
                      source={{
                        uri: `https://www.google.com/s2/favicons?domain=${host}&sz=64`,
                      }}
                      style={styles.linkFavicon}
                    />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.linkHost} numberOfLines={1}>
                        {host}
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
                );
              })}
          </View>
        </Modal>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.925,
    backgroundColor: Colors.background.primary,
  },
  imageWrap: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.45,
    backgroundColor: Colors.background.secondary,
  },
  image: {
    width: SCREEN_WIDTH,
    height: "100%",
  },
  imageOverlay: {
    position: "absolute",
    top: 12,
    left: 12,
  },
  blurWrapper: {
    borderRadius: 20,
    overflow: "hidden", // makes blur rounded
    marginRight: 6,
  },
  categoryChip: {
    backgroundColor: "transparent",
    borderColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  categoryChipText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#fff",
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
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
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.text.primary,
    marginBottom: 8,
    lineHeight: 26,
  },
  summary: {
    fontSize: 15,
    color: Colors.text.secondary,
    lineHeight: 22,
    marginBottom: 14,
    flexShrink: 1,
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

export default SwipableCard;
