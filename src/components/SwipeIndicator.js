// src/components/SwipeIndicator.js
import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const SwipeIndicator = ({ visible = true }) => {
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      const animation = Animated.loop(
        Animated.sequence([
          Animated.parallel([
            Animated.timing(translateY, {
              toValue: -10,
              duration: 1000,
              useNativeDriver: true,
            }),
            Animated.timing(fadeAnim, {
              toValue: 0.3,
              duration: 1000,
              useNativeDriver: true,
            }),
          ]),
          Animated.parallel([
            Animated.timing(translateY, {
              toValue: 0,
              duration: 1000,
              useNativeDriver: true,
            }),
            Animated.timing(fadeAnim, {
              toValue: 1,
              duration: 1000,
              useNativeDriver: true,
            }),
          ]),
        ])
      );
      animation.start();
      
      return () => animation.stop();
    }
  }, [visible, fadeAnim, translateY]);

  if (!visible) return null;

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.indicator,
          {
            opacity: fadeAnim,
            transform: [{ translateY }],
          },
        ]}
      >
        <Ionicons name="chevron-up" size={24} color="#D0D0D0" />
        <Text style={styles.text}>Swipe up for next</Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 1000,
  },
  indicator: {
    alignItems: 'center',
    backgroundColor: 'rgba(42, 42, 42, 0.95)', // Dark background
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#606060',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  text: {
    fontSize: 12,
    color: '#D0D0D0', // Light text for dark theme
    marginTop: 2,
  },
});

export default SwipeIndicator;
