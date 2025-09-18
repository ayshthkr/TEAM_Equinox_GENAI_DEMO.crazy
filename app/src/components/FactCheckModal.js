// src/components/FactCheckModal.js
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Modal, Portal, Button, Card } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';

const FactCheckModal = ({ visible, article, onDismiss }) => {
  if (!article) return null;

  const getStatusConfig = (status) => {
    switch (status.toLowerCase()) {
      case 'verified':
        return { icon: 'checkmark-circle', color: '#4CAF50', label: 'Verified' };
      case 'disputed':
        return { icon: 'warning', color: '#FF9800', label: 'Disputed' };
      case 'false':
        return { icon: 'close-circle', color: '#F44336', label: 'False' };
      default:
        return { icon: 'help-circle', color: '#757575', label: 'Unverified' };
    }
  };

  const config = getStatusConfig(article.factCheck.status);

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={styles.modalContainer}
      >
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.header}>
              <Ionicons name={config.icon} size={24} color={config.color} />
              <Text style={[styles.title, { color: config.color }]}>
                {config.label}
              </Text>
              <Text style={styles.confidence}>
                {article.factCheck.confidence}% confidence
              </Text>
            </View>
            
            <ScrollView style={styles.content}>
              <Text style={styles.articleTitle}>{article.title}</Text>
              <Text style={styles.explanation}>
                {article.factCheck.explanation}
              </Text>
            </ScrollView>
            
            <Button
              mode="contained"
              onPress={onDismiss}
              style={styles.closeButton}
            >
              Close
            </Button>
          </Card.Content>
        </Card>
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    margin: 20,
    flex: 1,
    justifyContent: 'center',
  },
  card: {
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 8,
    flex: 1,
  },
  confidence: {
    fontSize: 14,
    color: '#757575',
  },
  content: {
    maxHeight: 300,
  },
  articleTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#212121',
  },
  explanation: {
    fontSize: 14,
    lineHeight: 20,
    color: '#424242',
    marginBottom: 16,
  },
  closeButton: {
    marginTop: 16,
  },
});

export default FactCheckModal;