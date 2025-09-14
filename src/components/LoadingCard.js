// src/components/LoadingCard.js
import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { Card } from 'react-native-paper';
import Colors from '../constants/colors';

const LoadingCard = () => {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const shimmerAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    shimmerAnimation.start();

    return () => shimmerAnimation.stop();
  }, [shimmerAnim]);

  const shimmerOpacity = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Card style={styles.card}>
      <View style={styles.imageContainer}>
        <Animated.View style={[styles.shimmer, styles.imagePlaceholder, { opacity: shimmerOpacity }]} />
      </View>
      <View style={styles.content}>
        <View style={styles.header}>
          <Animated.View style={[styles.shimmer, styles.sourcePlaceholder, { opacity: shimmerOpacity }]} />
          <Animated.View style={[styles.shimmer, styles.timePlaceholder, { opacity: shimmerOpacity }]} />
        </View>
        <Animated.View style={[styles.shimmer, styles.titlePlaceholder, { opacity: shimmerOpacity }]} />
        <Animated.View style={[styles.shimmer, styles.titlePlaceholder2, { opacity: shimmerOpacity }]} />
        <Animated.View style={[styles.shimmer, styles.summaryPlaceholder, { opacity: shimmerOpacity }]} />
        <Animated.View style={[styles.shimmer, styles.summaryPlaceholder2, { opacity: shimmerOpacity }]} />
        <View style={styles.footer}>
          <Animated.View style={[styles.shimmer, styles.biasPlaceholder, { opacity: shimmerOpacity }]} />
          <Animated.View style={[styles.shimmer, styles.factCheckPlaceholder, { opacity: shimmerOpacity }]} />
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 12,
    marginVertical: 6,
    elevation: 4,
    borderRadius: 16,
    backgroundColor: Colors.background.tertiary,
    borderWidth: 1,
    borderColor: Colors.border.primary,
    overflow: 'hidden',
  },
  imageContainer: {
    height: 180,
    width: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sourcePlaceholder: {
    width: 80,
    height: 12,
    borderRadius: 6,
  },
  timePlaceholder: {
    width: 40,
    height: 12,
    borderRadius: 6,
  },
  titlePlaceholder: {
    width: '100%',
    height: 16,
    borderRadius: 8,
    marginBottom: 6,
  },
  titlePlaceholder2: {
    width: '75%',
    height: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  summaryPlaceholder: {
    width: '100%',
    height: 12,
    borderRadius: 6,
    marginBottom: 4,
  },
  summaryPlaceholder2: {
    width: '60%',
    height: 12,
    borderRadius: 6,
    marginBottom: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  biasPlaceholder: {
    width: 60,
    height: 20,
    borderRadius: 10,
  },
  factCheckPlaceholder: {
    width: 80,
    height: 24,
    borderRadius: 12,
  },
  shimmer: {
    backgroundColor: Colors.border.primary,
  },
});

export default LoadingCard;
