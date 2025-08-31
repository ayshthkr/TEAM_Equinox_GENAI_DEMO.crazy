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
        <Ionicons name="chevron-up" size={20} color="#FFFFFF" />
        <Text style={styles.text}>Swipe up</Text>
        <Ionicons name="chevron-down" size={20} color="#FFFFFF" />
        <Text style={styles.text}>Swipe down</Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 150,
    right: 20,
    alignItems: 'center',
    zIndex: 1000,
  },
  indicator: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  text: {
    fontSize: 10,
    color: '#FFFFFF',
    marginVertical: 2,
    fontWeight: '500',
  },
});

export default SwipeIndicator;
