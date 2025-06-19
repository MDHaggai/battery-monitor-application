import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';
import WifiManager from 'react-native-wifi-reborn';

import BatteryWidget from '../components/BatteryWidget';
import SensorCard from '../components/SensorCard';
import ConnectionStatus from '../components/ConnectionStatus';

const { width, height } = Dimensions.get('window');

const DashboardScreen = () => {
  const [batteryData, setBatteryData] = useState({
    voltage: 12.6,
    current1: 2.3,
    current2: 1.8,
    percentage: 85,
    temperature: 24,
    status: 'Good',
  });
  
  const [isConnected, setIsConnected] = useState(false);
  const [esp32IP, setEsp32IP] = useState('192.168.4.1');
  const [currentSession, setCurrentSession] = useState(null);

  useEffect(() => {
    loadCurrentSession();
    fetchBatteryData();
    checkWifiConnection();
    const interval = setInterval(() => {
      fetchBatteryData();
      checkWifiConnection();
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const loadCurrentSession = async () => {
    try {
      const sessionData = await AsyncStorage.getItem('currentSession');
      if (sessionData) {
        const session = JSON.parse(sessionData);
        console.log('Dashboard loaded session:', session);
        setCurrentSession(session);
        setEsp32IP(session.esp32IP || '192.168.4.1');
      } else {
        console.log('No session found in Dashboard');
      }
    } catch (error) {
      console.log('Error loading session:', error);
    }
  };

  const checkWifiConnection = async () => {
    try {
      if (currentSession) {
        const currentSSID = await WifiManager.getCurrentWifiSSID();
        const isConnectedToTargetNetwork = currentSSID && 
          currentSSID.replace(/"/g, '') === currentSession.ssid;
        
        if (!isConnectedToTargetNetwork) {
          setIsConnected(false);
        }
      }
    } catch (error) {
      console.log('WiFi check error:', error);
    }
  };

  const fetchBatteryData = async () => {
    try {
      const response = await fetch(`http://${esp32IP}/`, {
        timeout: 5000,
      });
      
      if (response.ok) {
        const data = await response.json();
        setBatteryData({
          voltage: data.voltage || 0,
          current1: data.current1 || 0,
          current2: data.current2 || 0,
          percentage: data.percentage || 0,
          temperature: data.temperature || 24,
          status: getStatusFromVoltage(data.voltage),
        });
        setIsConnected(true);
      } else {
        setIsConnected(false);
      }
    } catch (error) {
      console.log('Connection error:', error);
      setIsConnected(false);
      // Use mock data for demo
      setBatteryData(prev => ({
        ...prev,
        voltage: 12.6 + (Math.random() - 0.5) * 0.2,
        current1: 2.3 + (Math.random() - 0.5) * 0.5,
        current2: 1.8 + (Math.random() - 0.5) * 0.3,
      }));
    }
  };

  const getStatusFromVoltage = (voltage) => {
    if (voltage >= 12.6) return 'Excellent';
    if (voltage >= 12.4) return 'Good';
    if (voltage >= 12.0) return 'Fair';
    if (voltage >= 11.8) return 'Low';
    return 'Critical';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Excellent': return '#00FF88';
      case 'Good': return '#00D4FF';
      case 'Fair': return '#FFD700';
      case 'Low': return '#FF8C00';
      case 'Critical': return '#FF4444';
      default: return '#666';
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <LinearGradient
        colors={['#1a1a1a', '#2d2d2d', '#1a1a1a']}
        style={styles.header}
      >
        <Animatable.View animation="fadeInDown" duration={1000}>
          <Text style={styles.headerTitle}>
            {currentSession ? currentSession.carName : 'Car Battery Monitor'}
          </Text>
          <Text style={styles.headerSubtitle}>
            {currentSession ? `Connected to ${currentSession.ssid}` : 'Real-time monitoring system'}
          </Text>
        </Animatable.View>
        
        <ConnectionStatus isConnected={isConnected} />
      </LinearGradient>

      <Animatable.View animation="fadeInUp" duration={1000} delay={200}>
        <BatteryWidget 
          percentage={batteryData.percentage}
          voltage={batteryData.voltage}
          status={batteryData.status}
          statusColor={getStatusColor(batteryData.status)}
        />
      </Animatable.View>

      <View style={styles.sensorsGrid}>
        <Animatable.View animation="fadeInLeft" duration={1000} delay={400}>
          <SensorCard
            title="Voltage"
            value={`${batteryData.voltage.toFixed(2)}V`}
            icon="⚡"
            color="#00D4FF"
            subtitle="Battery Voltage"
          />
        </Animatable.View>

        <Animatable.View animation="fadeInRight" duration={1000} delay={500}>
          <SensorCard
            title="Current 1"
            value={`${batteryData.current1.toFixed(2)}A`}
            icon="📈"
            color="#00FF88"
            subtitle="Primary Current"
          />
        </Animatable.View>

        <Animatable.View animation="fadeInLeft" duration={1000} delay={600}>
          <SensorCard
            title="Current 2"
            value={`${batteryData.current2.toFixed(2)}A`}
            icon="📉"
            color="#FFD700"
            subtitle="Secondary Current"
          />
        </Animatable.View>

        <Animatable.View animation="fadeInRight" duration={1000} delay={700}>
          <SensorCard
            title="Temperature"
            value={`${batteryData.temperature}°C`}
            icon="🌡️"
            color="#FF6B6B"
            subtitle="Battery Temp"
          />
        </Animatable.View>
      </View>

      <Animatable.View animation="fadeIn" duration={1000} delay={800}>
        <TouchableOpacity 
          style={styles.emergencyButton}
          onPress={() => Alert.alert('Emergency', 'Emergency shutdown activated!')}
        >
          <LinearGradient
            colors={['#FF4444', '#CC0000']}
            style={styles.emergencyGradient}
          >
            <Text style={styles.emergencyIcon}>⚠️</Text>
            <Text style={styles.emergencyText}>Emergency Shutdown</Text>
          </LinearGradient>
        </TouchableOpacity>
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
  sensorsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    marginTop: 20,
  },
  emergencyButton: {
    marginHorizontal: 20,
    marginTop: 30,
    marginBottom: 30,
    borderRadius: 15,
    overflow: 'hidden',
  },
  emergencyGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  emergencyIcon: {
    fontSize: 24,
    marginRight: 10,
  },
  emergencyText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default DashboardScreen;
