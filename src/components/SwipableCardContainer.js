// src/components/SwipableCardContainer.js
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  Animated,
  PanResponder,
  Text,
  Vibration,
} from 'react-native';
import NewsCard from './NewsCard';
import SwipeIndicator from './SwipeIndicator';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const CARD_HEIGHT = screenHeight * 0.85; // 85% of screen height
const SWIPE_THRESHOLD = 120;

const SwipableCardContainer = ({ articles, navigation, onSwipeUp, onSwipeDown }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showIndicator, setShowIndicator] = useState(true);
  const position = useRef(new Animated.ValueXY()).current;
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Hide indicator after first swipe or after 5 seconds
    const timer = setTimeout(() => {
      setShowIndicator(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Hide indicator after user starts swiping
    if (currentIndex > 0) {
      setShowIndicator(false);
    }
  }, [currentIndex]);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        return Math.abs(gestureState.dy) > 5;
      },
      onPanResponderGrant: () => {
        position.setOffset({
          x: position.x._value,
          y: position.y._value,
        });
      },
      onPanResponderMove: (evt, gestureState) => {
        position.setValue({ x: 0, y: gestureState.dy });
        
        // Update opacity based on swipe distance
        const swipeProgress = Math.abs(gestureState.dy) / SWIPE_THRESHOLD;
        opacity.setValue(Math.max(0.3, 1 - swipeProgress * 0.7));
      },
      onPanResponderRelease: (evt, gestureState) => {
        position.flattenOffset();
        
        if (gestureState.dy > SWIPE_THRESHOLD) {
          // Swipe down - go to previous article
          swipeDown();
        } else if (gestureState.dy < -SWIPE_THRESHOLD) {
          // Swipe up - go to next article
          swipeUp();
        } else {
          // Return to center
          resetPosition();
        }
      },
    })
  ).current;

  const swipeUp = () => {
    if (currentIndex < articles.length - 1) {
      Animated.parallel([
        Animated.timing(position, {
          toValue: { x: 0, y: -screenHeight },
          duration: 300,
          useNativeDriver: false,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: false,
        }),
      ]).start(() => {
        setCurrentIndex(currentIndex + 1);
        position.setValue({ x: 0, y: screenHeight });
        opacity.setValue(0);

        // Add subtle vibration feedback
        Vibration.vibrate(50);

        Animated.parallel([
          Animated.timing(position, {
            toValue: { x: 0, y: 0 },
            duration: 300,
            useNativeDriver: false,
          }),
          Animated.timing(opacity, {
            toValue: 1,
            duration: 300,
            useNativeDriver: false,
          }),
        ]).start();

        onSwipeUp && onSwipeUp();
      });
    } else {
      resetPosition();
    }
  };

  const swipeDown = () => {
    if (currentIndex > 0) {
      Animated.parallel([
        Animated.timing(position, {
          toValue: { x: 0, y: screenHeight },
          duration: 300,
          useNativeDriver: false,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: false,
        }),
      ]).start(() => {
        setCurrentIndex(currentIndex - 1);
        position.setValue({ x: 0, y: -screenHeight });
        opacity.setValue(0);

        // Add subtle vibration feedback
        Vibration.vibrate(50);

        Animated.parallel([
          Animated.timing(position, {
            toValue: { x: 0, y: 0 },
            duration: 300,
            useNativeDriver: false,
          }),
          Animated.timing(opacity, {
            toValue: 1,
            duration: 300,
            useNativeDriver: false,
          }),
        ]).start();

        onSwipeDown && onSwipeDown();
      });
    } else {
      resetPosition();
    }
  };

  const resetPosition = () => {
    Animated.parallel([
      Animated.spring(position, {
        toValue: { x: 0, y: 0 },
        useNativeDriver: false,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: false,
      }),
    ]).start();
  };

  if (articles.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No articles available</Text>
          <Text style={styles.emptySubtext}>Try selecting a different category</Text>
        </View>
      </View>
    );
  }

  const currentArticle = articles[currentIndex];

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.cardContainer,
          {
            transform: position.getTranslateTransform(),
            opacity: opacity,
          },
        ]}
        {...panResponder.panHandlers}
      >
        <NewsCard
          article={currentArticle}
          onPress={() => navigation.navigate('ArticleDetail', { article: currentArticle })}
          isSwipable={true}
        />
      </Animated.View>

      {/* Article counter and progress */}
      <View style={styles.counterContainer}>
        <Text style={styles.counterText}>
          {currentIndex + 1} of {articles.length}
        </Text>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${((currentIndex + 1) / articles.length) * 100}%` }
            ]}
          />
        </View>
      </View>

      {/* Swipe indicator */}
      <SwipeIndicator visible={showIndicator && currentIndex === 0} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a', // Ground News dark background
  },
  cardContainer: {
    width: screenWidth,
    height: CARD_HEIGHT,
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#D0D0D0', // Light text for dark theme
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#B0B0B0', // Lighter gray for subtext
  },
  counterContainer: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 15,
    minWidth: 80,
    alignItems: 'center',
  },
  counterText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 4,
  },
  progressBar: {
    width: 60,
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 1,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: 'white',
    borderRadius: 1,
  },
});

export default SwipableCardContainer;
