// src/screens/ReelsScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import SwipableCardContainer from '../components/SwipableCardContainer';
import { convertJsonToAppFormat } from '../data/dataAdapter';
import Colors from '../constants/colors';

const ReelsScreen = ({ navigation }) => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadArticles();
  }, []);

  const loadArticles = async () => {
    setLoading(true);
    try {
      // Simulate loading time for better UX
      await new Promise(resolve => setTimeout(resolve, 500));
      const allArticles = convertJsonToAppFormat();
      setArticles(allArticles);
    } catch (error) {
      console.error('Error loading articles:', error);
      setArticles([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar 
        barStyle="light-content" 
        backgroundColor={Colors.background.primary}
        translucent={true}
      />
      
      {!loading && articles.length > 0 && (
        <SwipableCardContainer
          articles={articles}
          navigation={navigation}
          onSwipeUp={() => {
            // Optional: Add analytics or other actions on swipe up
          }}
          onSwipeDown={() => {
            // Optional: Add analytics or other actions on swipe down
          }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
});

export default ReelsScreen;
