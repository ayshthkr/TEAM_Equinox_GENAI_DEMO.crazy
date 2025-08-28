// src/screens/BiasAnalyticsScreen.js
import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Text,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import { Appbar, Card, SegmentedButtons } from 'react-native-paper';
import { PieChart, BarChart } from 'react-native-chart-kit';
import { mockNewsData } from '../data/mockData';

const { width } = Dimensions.get('window');

const BiasAnalyticsScreen = () => {
  const [selectedView, setSelectedView] = useState('bias');

  // Calculate bias distribution
  const biasData = mockNewsData.reduce((acc, article) => {
    acc[article.bias] = (acc[article.bias] || 0) + 1;
    return acc;
  }, {});

  // Calculate category distribution
  const categoryData = mockNewsData.reduce((acc, article) => {
    acc[article.category] = (acc[article.category] || 0) + 1;
    return acc;
  }, {});

  // Prepare pie chart data for bias
  const pieData = Object.entries(biasData).map(([key, value]) => ({
    name: key.charAt(0).toUpperCase() + key.slice(1),
    population: value,
    color: key === 'left' ? '#FF5722' : key === 'center' ? '#4CAF50' : '#2196F3',
    legendFontColor: '#7F7F7F',
    legendFontSize: 15,
  }));

  // Prepare bar chart data for categories
  const barData = {
    labels: Object.keys(categoryData).map(cat => cat.slice(0, 8)), // Truncate for mobile
    datasets: [
      {
        data: Object.values(categoryData),
      },
    ],
  };

  const chartConfig = {
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.5,
    useShadowColorFromDataset: false,
  };

  return (
    <SafeAreaView style={styles.container}>
      <Appbar.Header>
        <Appbar.Content title="Bias Analytics" />
      </Appbar.Header>

      <SegmentedButtons
        value={selectedView}
        onValueChange={setSelectedView}
        buttons={[
          { value: 'bias', label: 'Bias Distribution' },
          { value: 'category', label: 'Category Trends' },
        ]}
        style={styles.segmentedButtons}
      />

      <ScrollView style={styles.scrollView}>
        {selectedView === 'bias' ? (
          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.cardTitle}>Political Bias Distribution</Text>
              <PieChart
                data={pieData}
                width={width - 64}
                height={220}
                chartConfig={chartConfig}
                accessor="population"
                backgroundColor="transparent"
                paddingLeft="15"
                center={[10, 10]}
                absolute
              />
              <View style={styles.statsContainer}>
                {Object.entries(biasData).map(([bias, count]) => (
                  <View key={bias} style={styles.statItem}>
                    <View 
                      style={[
                        styles.statColor,
                        { 
                          backgroundColor: bias === 'left' ? '#FF5722' : 
                                         bias === 'center' ? '#4CAF50' : '#2196F3'
                        }
                      ]} 
                    />
                    <Text style={styles.statLabel}>
                      {bias.charAt(0).toUpperCase() + bias.slice(1)}: {count} articles
                    </Text>
                  </View>
                ))}
              </View>
            </Card.Content>
          </Card>
        ) : (
          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.cardTitle}>Articles by Category</Text>
              <BarChart
                data={barData}
                width={width - 64}
                height={220}
                chartConfig={chartConfig}
                verticalLabelRotation={30}
                style={styles.chart}
              />
            </Card.Content>
          </Card>
        )}

        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.cardTitle}>Fact-Check Summary</Text>
            <View style={styles.factCheckStats}>
              {Object.entries(
                mockNewsData.reduce((acc, article) => {
                  acc[article.factCheck.status] = (acc[article.factCheck.status] || 0) + 1;
                  return acc;
                }, {})
              ).map(([status, count]) => (
                <View key={status} style={styles.factCheckItem}>
                  <Text style={styles.factCheckLabel}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </Text>
                  <Text style={styles.factCheckCount}>{count}</Text>
                </View>
              ))}
            </View>
          </Card.Content>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  segmentedButtons: {
    margin: 16,
  },
  scrollView: {
    flex: 1,
  },
  card: {
    margin: 16,
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#212121',
  },
  chart: {
    borderRadius: 16,
  },
  statsContainer: {
    marginTop: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statColor: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 12,
  },
  statLabel: {
    fontSize: 14,
    color: '#424242',
  },
  factCheckStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
  },
  factCheckItem: {
    alignItems: 'center',
  },
  factCheckLabel: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 4,
  },
  factCheckCount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2196F3',
  },
});

export default BiasAnalyticsScreen;