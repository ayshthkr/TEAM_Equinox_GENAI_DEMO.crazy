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
import Colors from '../constants/colors';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const CARD_HEIGHT = screenHeight * 0.80;
const SWIPE_THRESHOLD = 120;

const SwipableCardContainer = ({ articles, navigation, onSwipeUp, onSwipeDown }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showIndicator, setShowIndicator] = useState(true);
  const [isSwipingBack, setIsSwipingBack] = useState(false);

  const position = useRef(new Animated.ValueXY()).current;
  const opacity = useRef(new Animated.Value(1)).current;
  // previous card starts above the screen
  const previousCardPosition = useRef(new Animated.Value(-screenHeight)).current;

  useEffect(() => {
    const timer = setTimeout(() => setShowIndicator(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (currentIndex > 0) {
      setShowIndicator(false);
    }
  }, [currentIndex]);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dy) > 10;
      },
      onPanResponderGrant: () => {
        position.setOffset({
          x: position.x._value,
          y: position.y._value,
        });
      },
      onPanResponderMove: (_, gestureState) => {
        const dy = gestureState.dy;
        position.setValue({ x: 0, y: dy });

        const swipeProgress = Math.abs(dy) / SWIPE_THRESHOLD;
        opacity.setValue(Math.max(0.4, 1 - swipeProgress * 0.6));

        // pulling previous card down
        if (dy > 0 && currentIndex > 0) {
          if (!isSwipingBack) {
            setIsSwipingBack(true);
            previousCardPosition.setValue(-screenHeight);
          }
          previousCardPosition.setValue(Math.min(0, -screenHeight + dy));
        } else if (isSwipingBack) {
          previousCardPosition.setValue(-screenHeight);
          setIsSwipingBack(false);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        position.flattenOffset();

        const velocity = gestureState.vy;
        const distance = gestureState.dy;
        const shouldSwipe =
          Math.abs(velocity) > 0.5 || Math.abs(distance) > SWIPE_THRESHOLD;

        if (shouldSwipe) {
          if (distance > 0) {
            // Swipe down - go to previous card
            if (currentIndex > 0) {
              swipeDown();
            } else {
              resetPosition();
            }
          } else {
            // Swipe up - go to next card
            if (currentIndex < articles.length - 1) {
              swipeUp();
            } else {
              resetPosition();
            }
          }
        } else {
          resetPosition();
        }

        setIsSwipingBack(false);
      },
    })
  ).current;

  const swipeUp = () => {
    Animated.parallel([
      Animated.timing(position, {
        toValue: { x: 0, y: -screenHeight },
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setCurrentIndex((prev) => prev + 1);
      position.setValue({ x: 0, y: 0 });
      opacity.setValue(1);
      Vibration.vibrate(30);
      onSwipeUp && onSwipeUp();
    });
  };

  const swipeDown = () => {
    Animated.parallel([
      Animated.timing(position, {
        toValue: { x: 0, y: screenHeight },
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(previousCardPosition, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setCurrentIndex((prev) => prev - 1);
      position.setValue({ x: 0, y: 0 });
      opacity.setValue(1);
      previousCardPosition.setValue(-screenHeight);
      Vibration.vibrate(30);
      onSwipeDown && onSwipeDown();
    });
  };

  const resetPosition = () => {
    Animated.parallel([
      Animated.spring(position, {
        toValue: { x: 0, y: 0 },
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(previousCardPosition, {
        toValue: -screenHeight,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsSwipingBack(false);
    });
  };

  if (articles.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No articles available</Text>
          <Text style={styles.emptySubtext}>
            Try selecting a different category
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>

      {/* Previous card */}
      {currentIndex > 0 && (
        <Animated.View
          style={[
            styles.cardContainer,
            {
              transform: [{ translateY: previousCardPosition }],
              zIndex: isSwipingBack ? 3 : 1,
            },
          ]}
        >
          <NewsCard
            article={articles[currentIndex - 1]}
            onPress={() =>
              navigation.navigate('ArticleDetail', { article: articles[currentIndex - 1] })
            }
            isSwipable={true}
          />
        </Animated.View>
      )}

      {/* Current card */}
      <Animated.View
        style={[
          styles.cardContainer,
          {
            transform: position.getTranslateTransform(),
            opacity: opacity,
            zIndex: 2,
          },
        ]}
        {...panResponder.panHandlers}
      >
        <NewsCard
          article={articles[currentIndex]}
          onPress={() =>
            navigation.navigate('ArticleDetail', { article: articles[currentIndex] })
          }
          isSwipable={true}
        />
      </Animated.View>

      {/* Next card */}
      {currentIndex < articles.length - 1 && (
        <Animated.View
          style={[
            styles.cardContainer,
            {
              transform: [{ translateY: screenHeight }],
              zIndex: 0,
            },
          ]}
        >
          <NewsCard
            article={articles[currentIndex + 1]}
            onPress={() =>
              navigation.navigate('ArticleDetail', { article: articles[currentIndex + 1] })
            }
            isSwipable={true}
          />
        </Animated.View>
      )}

     

      {/* Swipe indicator */}
      <SwipeIndicator visible={showIndicator && currentIndex === 0} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  progressContainer: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    gap: 4,
    paddingHorizontal: 20,
  },
  progressDot: {
    height: 3,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    flex: 1,
    maxWidth: 30,
  },
  cardContainer: {
    width: screenWidth,
    height: CARD_HEIGHT,
    justifyContent: 'center',
    paddingHorizontal: 10,
    position: 'absolute',
    top: 0,
    left: 0,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#D0D0D0',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#B0B0B0',
  },
  counterContainer: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    alignItems: 'center',
  },
  counterText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 4,
  },
});

export default SwipableCardContainer;
