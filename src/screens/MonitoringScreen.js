import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';
import { LineChart } from 'react-native-chart-kit';

const { width, height } = Dimensions.get('window');

const MonitoringScreen = () => {
  const [timeRange, setTimeRange] = useState('1H'); // 1H, 6H, 24H
  const [selectedMetric, setSelectedMetric] = useState('voltage');
  const [esp32IP, setEsp32IP] = useState('192.168.4.1');
  const [currentSession, setCurrentSession] = useState(null);

  useEffect(() => {
    loadCurrentSession();
  }, []);

  const loadCurrentSession = async () => {
    try {
      const sessionData = await AsyncStorage.getItem('currentSession');
      if (sessionData) {
        const session = JSON.parse(sessionData);
        setCurrentSession(session);
        setEsp32IP(session.esp32IP || '192.168.4.1');
      }
    } catch (error) {
      console.log('Error loading session:', error);
    }
  };
  
  const [historicalData, setHistoricalData] = useState({
    voltage: {
      labels: ['10:00', '10:15', '10:30', '10:45', '11:00', '11:15'],
      datasets: [{
        data: [12.6, 12.5, 12.7, 12.4, 12.8, 12.6],
        color: () => '#00D4FF',
      }]
    },
    current1: {
      labels: ['10:00', '10:15', '10:30', '10:45', '11:00', '11:15'],
      datasets: [{
        data: [2.3, 2.1, 2.5, 2.2, 2.7, 2.4],
        color: () => '#00FF88',
      }]
    },
    current2: {
      labels: ['10:00', '10:15', '10:30', '10:45', '11:00', '11:15'],
      datasets: [{
        data: [1.8, 1.6, 1.9, 1.7, 2.0, 1.8],
        color: () => '#FFD700',
      }]
    },
    temperature: {
      labels: ['10:00', '10:15', '10:30', '10:45', '11:00', '11:15'],
      datasets: [{
        data: [24, 25, 26, 25, 27, 26],
        color: () => '#FF6B6B',
      }]
    }
  });

  const [realTimeStats, setRealTimeStats] = useState({
    voltage: { current: 12.6, avg: 12.5, min: 12.1, max: 12.8 },
    current1: { current: 2.3, avg: 2.2, min: 1.8, max: 2.7 },
    current2: { current: 1.8, avg: 1.7, min: 1.4, max: 2.0 },
    temperature: { current: 26, avg: 25, min: 23, max: 28 },
  });

  const metrics = [
    {
      id: 'voltage',
      name: 'Voltage',
      unit: 'V',
      icon: '⚡',
      color: '#00D4FF',
    },
    {
      id: 'current1',
      name: 'Current 1',
      unit: 'A',
      icon: '📈',
      color: '#00FF88',
    },
    {
      id: 'current2',
      name: 'Current 2',
      unit: 'A',
      icon: '📉',
      color: '#FFD700',
    },
    {
      id: 'temperature',
      name: 'Temperature',
      unit: '°C',
      icon: '🌡️',
      color: '#FF6B6B',
    },
  ];

  const timeRanges = ['1H', '6H', '24H'];

  const chartConfig = {
    backgroundColor: '#1a1a1a',
    backgroundGradientFrom: '#1a1a1a',
    backgroundGradientTo: '#2d2d2d',
    decimalPlaces: 1,
    color: (opacity = 1) => `rgba(0, 212, 255, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '4',
      strokeWidth: '2',
      stroke: '#00D4FF',
    },
    propsForBackgroundLines: {
      strokeDasharray: '',
      stroke: '#333',
      strokeWidth: 1,
    },
  };

  const renderMetricButton = (metric) => (
    <TouchableOpacity
      key={metric.id}
      style={[
        styles.metricButton,
        selectedMetric === metric.id && styles.selectedMetricButton
      ]}
      onPress={() => setSelectedMetric(metric.id)}
    >
      <Text style={[
        styles.metricButtonIcon,
        { color: selectedMetric === metric.id ? metric.color : '#666' }
      ]}>
        {metric.icon}
      </Text>
      <Text style={[
        styles.metricButtonText,
        selectedMetric === metric.id && { color: metric.color }
      ]}>
        {metric.name}
      </Text>
    </TouchableOpacity>
  );

  const renderTimeRangeButton = (range) => (
    <TouchableOpacity
      key={range}
      style={[
        styles.timeButton,
        timeRange === range && styles.selectedTimeButton
      ]}
      onPress={() => setTimeRange(range)}
    >
      <Text style={[
        styles.timeButtonText,
        timeRange === range && styles.selectedTimeButtonText
      ]}>
        {range}
      </Text>
    </TouchableOpacity>
  );

  const renderStatCard = (title, value, unit, color) => (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <Text style={styles.statTitle}>{title}</Text>
      <Text style={[styles.statValue, { color }]}>
        {value}{unit}
      </Text>
    </View>
  );

  const currentMetric = metrics.find(m => m.id === selectedMetric);
  const currentStats = realTimeStats[selectedMetric];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <LinearGradient
        colors={['#1a1a1a', '#2d2d2d', '#1a1a1a']}
        style={styles.header}
      >
        <Animatable.View animation="fadeInDown" duration={1000}>
          <Text style={styles.headerTitle}>Real-time Monitoring</Text>
          <Text style={styles.headerSubtitle}>Historical data & analytics</Text>
        </Animatable.View>
      </LinearGradient>

      {/* Metric Selection */}
      <Animatable.View animation="fadeIn" duration={1000} delay={200}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Metric</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.metricSelector}
          >
            {metrics.map(renderMetricButton)}
          </ScrollView>
        </View>
      </Animatable.View>

      {/* Time Range Selection */}
      <Animatable.View animation="fadeIn" duration={1000} delay={300}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Time Range</Text>
          <View style={styles.timeSelector}>
            {timeRanges.map(renderTimeRangeButton)}
          </View>
        </View>
      </Animatable.View>

      {/* Chart */}
      <Animatable.View animation="fadeInUp" duration={1000} delay={400}>
        <View style={styles.chartSection}>
          <View style={styles.chartHeader}>
            <Text style={[styles.chartIcon, { color: currentMetric.color }]}>{currentMetric.icon}</Text>
            <Text style={[styles.chartTitle, { color: currentMetric.color }]}>
              {currentMetric.name} ({currentMetric.unit})
            </Text>
          </View>
          
          <View style={styles.chartContainer}>
            <LineChart
              data={historicalData[selectedMetric]}
              width={width - 40}
              height={220}
              chartConfig={{
                ...chartConfig,
                color: (opacity = 1) => `${currentMetric.color}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`,
              }}
              bezier
              style={styles.chart}
            />
          </View>
        </View>
      </Animatable.View>

      {/* Statistics */}
      <Animatable.View animation="fadeIn" duration={1000} delay={500}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Statistics</Text>
          <View style={styles.statsGrid}>
            {renderStatCard('Current', currentStats.current, currentMetric.unit, currentMetric.color)}
            {renderStatCard('Average', currentStats.avg, currentMetric.unit, '#888')}
            {renderStatCard('Minimum', currentStats.min, currentMetric.unit, '#FF4444')}
            {renderStatCard('Maximum', currentStats.max, currentMetric.unit, '#00FF88')}
          </View>
        </View>
      </Animatable.View>

      {/* Alerts Section */}
      <Animatable.View animation="fadeInUp" duration={1000} delay={600}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Alerts</Text>
          <View style={styles.alertsContainer}>
            <View style={styles.alertItem}>
              <Text style={styles.alertIcon}>⚠️</Text>
              <View style={styles.alertContent}>
                <Text style={styles.alertText}>Voltage dropped below 12.0V</Text>
                <Text style={styles.alertTime}>2 minutes ago</Text>
              </View>
            </View>
            <View style={styles.alertItem}>
              <Text style={styles.alertIcon}>✅</Text>
              <View style={styles.alertContent}>
                <Text style={styles.alertText}>Battery voltage normalized</Text>
                <Text style={styles.alertTime}>5 minutes ago</Text>
              </View>
            </View>
          </View>
        </View>
      </Animatable.View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 30,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
  },
  section: {
    marginHorizontal: 20,
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 15,
  },
  metricSelector: {
    flexDirection: 'row',
  },
  metricButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginRight: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#333',
  },
  selectedMetricButton: {
    backgroundColor: '#2d2d2d',
    borderColor: '#00D4FF',
  },
  metricButtonIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  metricButtonText: {
    color: '#888',
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
  },
  chartIcon: {
    fontSize: 24,
    marginRight: 10,
  },
  alertIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  timeSelector: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  timeButton: {
    backgroundColor: '#1a1a1a',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#333',
  },
  selectedTimeButton: {
    backgroundColor: '#00D4FF20',
    borderColor: '#00D4FF',
  },
  timeButtonText: {
    color: '#888',
    fontSize: 14,
    fontWeight: '500',
  },
  selectedTimeButtonText: {
    color: '#00D4FF',
  },
  chartSection: {
    marginHorizontal: 20,
    marginBottom: 25,
  },
  chartHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  chartContainer: {
    backgroundColor: '#1a1a1a',
    borderRadius: 15,
    padding: 10,
    borderWidth: 1,
    borderColor: '#333',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: '#1a1a1a',
    width: (width - 50) / 2,
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderColor: '#333',
  },
  statTitle: {
    color: '#888',
    fontSize: 12,
    marginBottom: 5,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  alertsContainer: {
    backgroundColor: '#1a1a1a',
    borderRadius: 15,
    padding: 15,
    borderWidth: 1,
    borderColor: '#333',
  },
  alertItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  alertContent: {
    marginLeft: 15,
    flex: 1,
  },
  alertText: {
    color: '#ffffff',
    fontSize: 14,
    marginBottom: 2,
  },
  alertTime: {
    color: '#666',
    fontSize: 12,
  },
});

export default MonitoringScreen;
