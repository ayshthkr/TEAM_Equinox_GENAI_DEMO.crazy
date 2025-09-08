// src/components/SwipableCardContainer.js
import React, { useEffect, useRef, useState } from "react";
import {
  View,
  StyleSheet,
  Dimensions,
  Animated,
  PanResponder,
  Text,
  Vibration,
  ActivityIndicator,
} from "react-native";
import SwipableCard from "./SwipableCard";
import SwipeIndicator from "./SwipeIndicator";
import Colors from "../constants/colors";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

const SWIPE_DISTANCE_RATIO = 0.15;
const SWIPE_VELOCITY_THRESHOLD = 0.45;


const SwipableCardContainer = ({
  articles = [],
  navigation,
  onSwipeUp,
  onSwipeDown,
  onLoadMore,
  isLoadingMore = false,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentIndexRef = useRef(0);
  const currentArticleIdRef = useRef(null);
  const [showIndicator, setShowIndicator] = useState(true);
  const [loadingMoreLocal, setLoadingMoreLocal] = useState(false);

  const position = useRef(new Animated.ValueXY()).current;
  const opacity = useRef(new Animated.Value(1)).current;
  const articlesRef = useRef(articles);

  useEffect(() => {
    articlesRef.current = articles;
  }, [articles]);

  // Track last visible article ID
  useEffect(() => {
    const current = articles[currentIndexRef.current];
    currentArticleIdRef.current = current?.id ?? current?.url ?? current?._id ?? null;
  }, [currentIndex, articles]);

  // Restore index when articles change
  useEffect(() => {
    if (!articles || articles.length === 0) return;

    const lastId = currentArticleIdRef.current;
    if (lastId) {
      const idx = articles.findIndex(
        (a) => a.id === lastId || a.url === lastId || a._id === lastId
      );
      if (idx >= 0 && idx !== currentIndexRef.current) {
        currentIndexRef.current = idx;
        setCurrentIndex(idx);
      }
    }
  }, [articles]);

  useEffect(() => {
    const t = setTimeout(() => setShowIndicator(false), 3000);
    return () => clearTimeout(t);
  }, []);

  const distanceThresholdPx = Math.max(120, screenHeight * SWIPE_DISTANCE_RATIO);

  const setIndexSync = (next) => {
    const clamped = Math.max(0, Math.min(next, Math.max(0, articles.length - 1)));
    currentIndexRef.current = clamped;
    setCurrentIndex(clamped);
  };
  const incIndex = () => setIndexSync(currentIndexRef.current + 1);
  const decIndex = () => setIndexSync(currentIndexRef.current - 1);

  const handleLoadMore = async () => {
    if (!onLoadMore || loadingMoreLocal) return;

    try {
      setLoadingMoreLocal(true);
      const currentLength = articlesRef.current.length;

      await onLoadMore(); // wait for external loading
      await new Promise((resolve) => setTimeout(resolve, 500)); // loader delay

      // jump to first new item
      setIndexSync(currentLength);
    } catch (err) {
      console.error("Error loading more articles:", err);
    } finally {
      setLoadingMoreLocal(false);
    }
  };

  const resetPosition = () => {
    Animated.parallel([
      Animated.spring(position, { toValue: { x: 0, y: 0 }, useNativeDriver: true, bounciness: 6 }),
      Animated.timing(opacity, { toValue: 1, duration: 160, useNativeDriver: true }),
    ]).start();
  };

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) =>
        Math.abs(g.dy) > 6 && Math.abs(g.dy) > Math.abs(g.dx) * 1.2,

      onPanResponderGrant: () => {
        let curY = 0;
        if (position.y && typeof position.y.__getValue === "function") {
          try { curY = position.y.__getValue(); } catch {}
        } else if (position.y && typeof position.y._value === "number") {
          curY = position.y._value;
        }
        position.setOffset({ x: 0, y: curY });
        position.setValue({ x: 0, y: 0 });
      },

      onPanResponderMove: (_, g) => {
        position.setValue({ x: 0, y: g.dy });
        const swipeProgress = Math.min(1, Math.abs(g.dy) / distanceThresholdPx);
        opacity.setValue(Math.max(0.35, 1 - swipeProgress * 0.65));
      },

      onPanResponderRelease: (_, g) => {
        position.flattenOffset();
        const dy = g.dy;
        const vy = g.vy;
        const absDy = Math.abs(dy);
        const velocityUp = vy < -SWIPE_VELOCITY_THRESHOLD;
        const velocityDown = vy > SWIPE_VELOCITY_THRESHOLD;
        const distanceEnough = absDy >= distanceThresholdPx;

        const isSwipeUp = dy < 0 && (velocityUp || distanceEnough);
        const isSwipeDown = dy > 0 && (velocityDown || distanceEnough);
        const idx = currentIndexRef.current;

        if (isSwipeUp) {
          if (idx < articles.length - 1) {
            Animated.timing(position, {
              toValue: { x: 0, y: -screenHeight },
              duration: 220,
              useNativeDriver: true,
            }).start(() => {
              incIndex();
              position.setValue({ x: 0, y: 0 });
              opacity.setValue(1);
              Vibration.vibrate(12);
              onSwipeUp && onSwipeUp();
            });
          } else {
            handleLoadMore();
            resetPosition();
          }
        } else if (isSwipeDown) {
          if (idx > 0) {
            Animated.timing(position, {
              toValue: { x: 0, y: screenHeight },
              duration: 220,
              useNativeDriver: true,
            }).start(() => {
              decIndex();
              position.setValue({ x: 0, y: 0 });
              opacity.setValue(1);
              Vibration.vibrate(12);
              onSwipeDown && onSwipeDown();
            });
          } else {
            resetPosition();
          }
        } else {
          resetPosition();
        }
      },

      onPanResponderTerminate: () => {
        position.flattenOffset();
        resetPosition();
      },
    })
  ).current;

  if (!Array.isArray(articles) || articles.length === 0) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <Text style={styles.emptyText}>No articles available</Text>
        <Text style={styles.emptySubtext}>Try selecting a different category</Text>
      </View>
    );
  }

  const visibleIndex = currentIndexRef.current;
  const currentArticle = articles[visibleIndex];

  return (
    <View style={styles.container}>
      <Animated.View
        {...panResponder.panHandlers}
        style={[styles.cardContainer, { transform: position.getTranslateTransform(), opacity }]}
      >
        <SwipableCard
          article={currentArticle}
          onPress={() => navigation.navigate("ArticleDetail", { article: currentArticle })}
          isSwipable
        />
      </Animated.View>

      <View style={styles.counterContainer}>
        <Text style={styles.counterText}>{visibleIndex + 1} / {articles.length}</Text>
      </View>

      {(loadingMoreLocal || isLoadingMore) && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={Colors.accent.primary} />
          <Text style={styles.loadingText}>Loading more…</Text>
        </View>
      )}

      <SwipeIndicator visible={showIndicator && visibleIndex === 0} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background.primary },
  cardContainer: { width: screenWidth, height: screenHeight, position: "absolute", top: 0, left: 0 },
  emptyText: { fontSize: 18, fontWeight: "700", color: Colors.text.tertiary, marginBottom: 6 },
  emptySubtext: { fontSize: 14, color: Colors.text.secondary },
  counterContainer: {
    position: "absolute",
    top: 40,
    right: 14,
    backgroundColor: "rgba(0,0,0,0.45)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    zIndex: 30,
  },
  counterText: { color: "#fff", fontSize: 12, fontWeight: "600" },
  loadingOverlay: {
    position: "absolute",
    bottom: 40,
    alignSelf: "center",
    backgroundColor: "rgba(0,0,0,0.55)",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    zIndex: 40,
  },
  loadingText: { color: "#fff", marginLeft: 8, fontWeight: "600" },
});

export default SwipableCardContainer;
