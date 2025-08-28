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
  return (
    <SafeAreaView style={styles.container}>
      <Appbar.Header style={styles.header}>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Article Details" titleStyle={styles.headerTitle} />
        <Appbar.Action icon="share-variant" onPress={handleShare} />
        <Appbar.Action icon="open-in-new" onPress={handleOpenUrl} />
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
                  <Text style={styles.authorText}>by {article.author}</Text>
                )}
              </View>
              <Text style={styles.timeText}>{getTimeAgo(article.timestamp)}</Text>
            </View>
          </View>

          <Divider style={styles.divider} />

          {/* Article Summary */}
          <Card style={styles.summaryCard}>
            <Card.Content>
              <Text style={styles.summaryTitle}>Summary</Text>
              <Text style={styles.summaryText}>{article.summary}</Text>
            </Card.Content>
          </Card>

          {/* Analysis Section */}
          <Card style={styles.analysisCard}>
            <Card.Content>
              <Text style={styles.analysisTitle}>Analysis</Text>

              <View style={styles.analysisRow}>
                <Text style={styles.analysisLabel}>Credibility Score:</Text>
                <View style={styles.scoreContainer}>
                  <Text style={styles.scoreText}>{formatScore(article.score)}/100</Text>
                </View>
              </View>

              <View style={styles.analysisRow}>
                <Text style={styles.analysisLabel}>Political Bias:</Text>
                <BiasIndicator bias={article.bias} />
              </View>

              <View style={styles.analysisRow}>
                <Text style={styles.analysisLabel}>Fact Check:</Text>
                <IconButton
                  icon="information"
                  size={16}
                  onPress={() => setShowFactCheckModal(true)}
                  style={styles.infoButton}
                />
                <FactCheckBadge
                  status={article.factCheck.status}
                  confidence={article.factCheck.confidence}
                />
              </View>
            </Card.Content>
          </Card>

          {/* Full Article Text */}
          {article.originalText && (
            <Card style={styles.textCard}>
              <Card.Content>
                <Text style={styles.textTitle}>Full Article</Text>
                <Text style={styles.fullText}>{article.originalText}</Text>
              </Card.Content>
            </Card>
          )}

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <IconButton
              icon="share-variant"
              mode="contained"
              onPress={handleShare}
              style={styles.actionButton}
              iconColor={Colors.text.primary}
            />
            <IconButton
              icon="bookmark-outline"
              mode="contained"
              onPress={() => {/* Handle bookmark */}}
              style={styles.actionButton}
              iconColor={Colors.text.primary}
            />
            <IconButton
              icon="open-in-new"
              mode="contained"
              onPress={handleOpenUrl}
              style={styles.actionButton}
              iconColor={Colors.text.primary}
            />
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
    elevation: 4,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.primary,
  },
  headerTitle: {
    color: Colors.text.primary,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  imageContainer: {
    position: 'relative',
    height: 250,
    width: '100%',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    top: 16,
    left: 16,
  },
  categoryChip: {
    height: 28,
    paddingHorizontal: 12,
  },
  categoryChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  content: {
    padding: 16,
  },
  articleHeader: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text.primary,
    lineHeight: 32,
    marginBottom: 12,
  },
  metaInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sourceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  favicon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 8,
  },
  sourceText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.secondary,
  },
  authorText: {
    fontSize: 12,
    color: Colors.text.tertiary,
    marginLeft: 8,
    fontStyle: 'italic',
  },
  timeText: {
    fontSize: 12,
    color: Colors.text.tertiary,
  },
  divider: {
    backgroundColor: Colors.border.primary,
    marginVertical: 16,
  },
  summaryCard: {
    backgroundColor: Colors.background.tertiary,
    marginBottom: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border.primary,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 8,
  },
  summaryText: {
    fontSize: 15,
    color: Colors.text.secondary,
    lineHeight: 22,
  },
  analysisCard: {
    backgroundColor: Colors.background.tertiary,
    marginBottom: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border.primary,
  },
  analysisTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 12,
  },
  analysisRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  analysisLabel: {
    fontSize: 14,
    color: Colors.text.secondary,
    width: 120,
  },
  scoreContainer: {
    backgroundColor: Colors.accent.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginLeft: 8,
  },
  scoreText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  infoButton: {
    margin: 0,
    marginLeft: 8,
  },
  textCard: {
    backgroundColor: Colors.background.tertiary,
    marginBottom: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border.primary,
  },
  textTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 12,
  },
  fullText: {
    fontSize: 14,
    color: Colors.text.secondary,
    lineHeight: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginTop: 16,
    marginBottom: 32,
  },
  actionButton: {
    backgroundColor: Colors.surface.primary,
    borderRadius: 24,
  },
});

export default ArticleDetailScreen;