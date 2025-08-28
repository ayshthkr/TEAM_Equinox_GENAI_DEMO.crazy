// src/components/NewsCard.js
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Image,
} from 'react-native';
import { Card, Chip, IconButton } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import BiasIndicator from './BiasIndicator';
import FactCheckBadge from './FactCheckBadge';
import FactCheckModal from './FactCheckModal';
import Colors from '../constants/colors';

const { width } = Dimensions.get('window');

const NewsCard = ({ article, onPress, isSwipable = false }) => {
  const [showModal, setShowModal] = useState(false);
  const [imageError, setImageError] = useState(false);

  const getBiasColor = (bias) => {
    switch (bias.toLowerCase()) {
      case 'left': return Colors.bias.left;
      case 'center': return Colors.bias.center;
      case 'right': return Colors.bias.right;
      default: return Colors.text.tertiary;
    }
  };

  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const articleTime = new Date(timestamp);
    const diffInHours = Math.floor((now - articleTime) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const days = Math.floor(diffInHours / 24);
    if (days < 7) return `${days}d ago`;
    return `${Math.floor(days / 7)}w ago`;
  };

  const getScoreColor = (score) => {
    if (score > 0.3) return Colors.status.verified;
    if (score > 0.2) return Colors.status.disputed;
    return Colors.status.unknown;
  };

  const formatScore = (score) => {
    return Math.round(score * 100);
  };

  return (
    <>
      <Card style={[styles.card, isSwipable && styles.swipableCard]}>
        <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
          {/* Image Header */}
          {article.image && !imageError && (
            <View style={styles.imageContainer}>
              <Image
                source={{ uri: article.image }}
                style={styles.articleImage}
                onError={() => setImageError(true)}
                resizeMode="cover"
              />
              <View style={styles.imageOverlay}>
                <Chip
                  mode="flat"
                  style={[styles.categoryChip, { backgroundColor: getBiasColor(article.bias) }]}
                  textStyle={styles.categoryChipText}
                >
                  {article.category}
                </Chip>
              </View>
            </View>
          )}

          <Card.Content style={[styles.cardContent, isSwipable && styles.swipableCardContent]}>
            {/* Header with source and time */}
            <View style={styles.header}>
              <View style={styles.sourceContainer}>
                {article.favicon && (
                  <Image
                    source={{ uri: article.favicon }}
                    style={styles.favicon}
                    onError={() => {}}
                  />
                )}
                <Text style={styles.sourceText}>{article.source}</Text>
              </View>
              <View style={styles.metaContainer}>
                <Text style={styles.timeText}>{getTimeAgo(article.timestamp)}</Text>
                <View style={[styles.scoreIndicator, { backgroundColor: getScoreColor(article.score) }]}>
                  <Text style={styles.scoreText}>{formatScore(article.score)}</Text>
                </View>
              </View>
            </View>

            {/* Article Title */}
            <Text style={[styles.title, isSwipable && styles.swipableTitle]} numberOfLines={isSwipable ? 4 : 3}>
              {article.title}
            </Text>

            {/* Article Summary */}
            <Text style={[styles.summary, isSwipable && styles.swipableSummary]} numberOfLines={isSwipable ? 6 : 3}>
              {article.summary}
            </Text>

            {/* Bottom section with bias and fact-check */}
            <View style={styles.footer}>
              <View style={styles.leftFooter}>
                <BiasIndicator bias={article.bias} />
                {article.author && (
                  <Text style={styles.authorText}>by {article.author}</Text>
                )}
              </View>

              <View style={styles.rightFooter}>
                <TouchableOpacity onPress={() => setShowModal(true)} style={styles.factCheckButton}>
                  <FactCheckBadge
                    status={article.factCheck.status}
                    confidence={article.factCheck.confidence}
                  />
                </TouchableOpacity>
                <IconButton
                  icon="share-variant"
                  size={18}
                  iconColor={Colors.text.tertiary}
                  onPress={() => {/* Handle share */}}
                />
              </View>
            </View>
          </Card.Content>
        </TouchableOpacity>
      </Card>

      <FactCheckModal
        visible={showModal}
        article={article}
        onDismiss={() => setShowModal(false)}
      />
    </>
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    overflow: 'hidden',
  },
  swipableCard: {
    marginHorizontal: 8,
    marginVertical: 0,
    elevation: 8,
    borderRadius: 20,
    height: '95%',
    backgroundColor: Colors.background.tertiary,
    borderWidth: 1,
    borderColor: Colors.border.secondary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
  },
  imageContainer: {
    position: 'relative',
    height: 180,
    width: '100%',
  },
  articleImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    top: 12,
    left: 12,
  },
  cardContent: {
    padding: 16,
  },
  swipableCardContent: {
    padding: 20,
    height: '100%',
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sourceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  favicon: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 6,
  },
  metaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  scoreIndicator: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    minWidth: 28,
    alignItems: 'center',
  },
  scoreText: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  categoryChip: {
    height: 24,
    paddingHorizontal: 8,
  },
  categoryChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  timeText: {
    fontSize: 11,
    color: Colors.text.tertiary,
    fontWeight: '500',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: 8,
    lineHeight: 22,
  },
  swipableTitle: {
    fontSize: 20,
    lineHeight: 26,
    marginBottom: 12,
    color: Colors.text.primary,
    fontWeight: '700',
  },
  summary: {
    fontSize: 14,
    color: Colors.text.secondary,
    lineHeight: 20,
    marginBottom: 16,
  },
  swipableSummary: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 20,
    flex: 1,
    color: Colors.text.secondary,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  leftFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  rightFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sourceText: {
    fontSize: 12,
    color: Colors.text.secondary,
    fontWeight: '500',
  },
  authorText: {
    fontSize: 11,
    color: Colors.text.tertiary,
    marginLeft: 12,
    fontStyle: 'italic',
  },
  factCheckButton: {
    marginRight: 4,
  },
});

export default NewsCard;