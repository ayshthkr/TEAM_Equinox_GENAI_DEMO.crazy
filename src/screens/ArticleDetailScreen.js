// src/screens/ArticleDetailScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Share,
  Linking,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { Appbar, Card, Chip, IconButton, Divider } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import BiasIndicator from '../components/BiasIndicator';
import FactCheckBadge from '../components/FactCheckBadge';
import FactCheckModal from '../components/FactCheckModal';
import Colors from '../constants/colors';

const { width } = Dimensions.get('window');

const ArticleDetailScreen = ({ route, navigation }) => {
  const { article } = route.params;
  const [showFactCheckModal, setShowFactCheckModal] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleShare = async () => {
    try {
      await Share.share({
        message: `${article.title}\n\n${article.summary}\n\nRead more: ${article.url}`,
        url: article.url,
        title: article.title,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleOpenUrl = () => {
    if (article.url) {
      Linking.openURL(article.url);
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

  const getBiasColor = (bias) => {
    switch (bias.toLowerCase()) {
      case 'left': return Colors.bias.left;
      case 'center': return Colors.bias.center;
      case 'right': return Colors.bias.right;
      default: return Colors.text.tertiary;
    }
  };

  const formatScore = (score) => {
    return Math.round(score * 100);
  };

  const getScoreColor = (score) => {
    if (score >= 0.8) return Colors.status.verified;
    if (score >= 0.6) return Colors.status.disputed;
    return Colors.status.false;
  };

  return (
    <SafeAreaView style={styles.container} edges={['right', 'left']}>
      <Appbar.Header style={styles.header}>
        <Appbar.BackAction 
          onPress={() => navigation.goBack()} 
          color={Colors.text.primary}
          size={24}
        />
        <Appbar.Content 
          title="Article Details" 
          titleStyle={styles.headerTitle}
        />
        <Appbar.Action 
          icon="share-variant" 
          onPress={handleShare} 
          color={Colors.text.primary}
          size={24}
        />
        <Appbar.Action 
          icon="open-in-new" 
          onPress={handleOpenUrl} 
          color={Colors.text.primary}
          size={24}
        />
      </Appbar.Header>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Hero Image */}
        {article.image && !imageError && (
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: article.image }}
              style={styles.heroImage}
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

        <View style={styles.content}>
          {/* Article Header */}
          <View style={styles.articleHeader}>
            <Text style={styles.title}>{article.title}</Text>

            <View style={styles.metaInfo}>
              <View style={styles.sourceContainer}>
                {article.favicon && (
                  <Image
                    source={{ uri: article.favicon }}
                    style={styles.favicon}
                    onError={() => {}}
                  />
                )}
                <Text style={styles.sourceText}>{article.source}</Text>
                {article.author && (
                  <Text style={styles.authorText}>• by {article.author}</Text>
                )}
              </View>
              <Text style={styles.timeText}>{getTimeAgo(article.timestamp)}</Text>
            </View>
          </View>

          <Divider style={styles.divider} />

          {/* Article Summary */}
          <Card style={styles.summaryCard} elevation={1}>
            <Card.Content>
              <Text style={styles.summaryTitle}>Summary</Text>
              <Text style={styles.summaryText}>{article.summary}</Text>
            </Card.Content>
          </Card>

          {/* Analysis Section */}
          <Card style={styles.analysisCard} elevation={1}>
            <Card.Content>
              <View style={styles.analysisHeader}>
                <Text style={styles.analysisTitle}>Credibility Analysis</Text>
                <IconButton
                  icon="information-outline"
                  size={16}
                  onPress={() => setShowFactCheckModal(true)}
                  style={styles.infoIcon}
                  iconColor={Colors.text.secondary}
                />
              </View>

              <View style={styles.analysisGrid}>
                {/* Credibility Score */}
                <View style={styles.analysisItem}>
                  <Text style={styles.analysisLabel}>Credibility Score</Text>
                  <View style={[styles.scoreContainer, { backgroundColor: getScoreColor(article.score) + '20' }]}>
                    <Text style={[styles.scoreText, { color: getScoreColor(article.score) }]}>
                      {formatScore(article.score)}/100
                    </Text>
                  </View>
                </View>

                {/* Political Bias */}
                <View style={styles.analysisItem}>
                  <Text style={styles.analysisLabel}>Political Bias</Text>
                  <BiasIndicator bias={article.bias} />
                </View>

                {/* Fact Check */}
                <View style={styles.analysisItem}>
                  <Text style={styles.analysisLabel}>Fact Check</Text>
                  <FactCheckBadge
                    status={article.factCheck.status}
                    confidence={article.factCheck.confidence}
                  />
                </View>

                {/* Category */}
                <View style={styles.analysisItem}>
                  <Text style={styles.analysisLabel}>Category</Text>
                  <Chip
                    mode="outlined"
                    style={[styles.categoryBadge, { borderColor: getBiasColor(article.bias) }]}
                    textStyle={[styles.categoryBadgeText, { color: getBiasColor(article.bias) }]}
                  >
                    {article.category}
                  </Chip>
                </View>
              </View>
            </Card.Content>
          </Card>

          {/* Full Article Text */}
          {article.originalText && (
            <Card style={styles.textCard} elevation={1}>
              <Card.Content>
                <Text style={styles.textTitle}>Full Article</Text>
                <Text style={styles.fullText}>{article.originalText}</Text>
              </Card.Content>
            </Card>
          )}

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
              <IconButton
                icon="share-variant"
                size={20}
                iconColor={Colors.text.primary}
                style={styles.actionIcon}
              />
              <Text style={styles.actionText}>Share</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton} onPress={() => {}}>
              <IconButton
                icon="bookmark-outline"
                size={20}
                iconColor={Colors.text.primary}
                style={styles.actionIcon}
              />
              <Text style={styles.actionText}>Save</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton} onPress={handleOpenUrl}>
              <IconButton
                icon="open-in-new"
                size={20}
                iconColor={Colors.text.primary}
                style={styles.actionIcon}
              />
              <Text style={styles.actionText}>Open</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <FactCheckModal
        visible={showFactCheckModal}
        article={article}
        onDismiss={() => setShowFactCheckModal(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  header: {
    backgroundColor: Colors.background.secondary,
    elevation: 0,
    shadowOpacity: 0,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.primary,
  },
  headerTitle: {
    color: Colors.text.primary,
    fontWeight: '600',
    fontSize: 18,
    letterSpacing: -0.5,
  },
  scrollView: {
    flex: 1,
  },
  imageContainer: {
    position: 'relative',
    height: 280,
    width: '100%',
    backgroundColor: Colors.background.tertiary,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    top: 20,
    left: 20,
  },
  categoryChip: {
    height: 32,
    paddingHorizontal: 16,
    borderRadius: 16,
  },
  categoryChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  content: {
    padding: 20,
  },
  articleHeader: {
    marginBottom: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: Colors.text.primary,
    lineHeight: 34,
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  metaInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  sourceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    flexWrap: 'wrap',
  },
  favicon: {
    width: 22,
    height: 22,
    borderRadius: 11,
    marginRight: 10,
    backgroundColor: Colors.background.tertiary,
  },
  sourceText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text.secondary,
    marginRight: 8,
  },
  authorText: {
    fontSize: 14,
    color: Colors.text.tertiary,
    fontStyle: 'italic',
  },
  timeText: {
    fontSize: 13,
    color: Colors.text.tertiary,
    fontWeight: '500',
  },
  divider: {
    backgroundColor: Colors.border.primary,
    marginVertical: 20,
    height: 1,
  },
  summaryCard: {
    backgroundColor: Colors.background.secondary,
    marginBottom: 20,
    borderRadius: 16,
    borderWidth: 0,
    elevation: 2,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  summaryText: {
    fontSize: 16,
    color: Colors.text.secondary,
    lineHeight: 24,
    letterSpacing: 0.2,
  },
  analysisCard: {
    backgroundColor: Colors.background.secondary,
    marginBottom: 20,
    borderRadius: 16,
    borderWidth: 0,
    elevation: 2,
  },
  analysisHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  analysisTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    letterSpacing: -0.5,
  },
  infoIcon: {
    margin: 0,
  },
  analysisGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
  },
  analysisItem: {
    width: '48%',
    marginBottom: 16,
  },
  analysisLabel: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 8,
    fontWeight: '500',
  },
  scoreContainer: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  scoreText: {
    fontSize: 14,
    fontWeight: '600',
  },
  categoryBadge: {
    height: 32,
    borderRadius: 16,
    backgroundColor: 'transparent',
    borderWidth: 1.5,
  },
  categoryBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  textCard: {
    backgroundColor: Colors.background.secondary,
    marginBottom: 20,
    borderRadius: 16,
    borderWidth: 0,
    elevation: 2,
  },
  textTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  fullText: {
    fontSize: 15,
    color: Colors.text.secondary,
    lineHeight: 22,
    letterSpacing: 0.2,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    marginTop: 24,
    marginBottom: 40,
  },
  actionButton: {
    alignItems: 'center',
    backgroundColor: Colors.surface.primary,
    padding: 12,
    borderRadius: 20,
    minWidth: 80,
    elevation: 2,
  },
  actionIcon: {
    margin: 0,
  },
  actionText: {
    fontSize: 12,
    color: Colors.text.primary,
    fontWeight: '500',
    marginTop: 4,
  },
});

export default ArticleDetailScreen;