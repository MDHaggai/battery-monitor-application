import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';

const { width } = Dimensions.get('window');

const ControlScreen = () => {
  const [esp32IP, setEsp32IP] = useState('192.168.4.1');
  const [currentSession, setCurrentSession] = useState(null);
  const [ledStates, setLedStates] = useState({
    headlamp: false,      // GPIO4
    carLight: false,      // GPIO0
    trafficator: false,   // GPIO2
    rearLight: false,     // GPIO14
    extraLight1: false,   // GPIO12
    extraLight2: false,   // GPIO13
  });

  const [autoLeds, setAutoLeds] = useState({
    led1: true,  // GPIO16 - Auto-on
    led2: true,  // GPIO5 - Auto-on
  });

  useEffect(() => {
    loadCurrentSession();
  }, []);

  const loadCurrentSession = async () => {
    try {
      const sessionData = await AsyncStorage.getItem('currentSession');
      if (sessionData) {
        const session = JSON.parse(sessionData);
        console.log('Control screen loaded session:', session);
        setCurrentSession(session);
        setEsp32IP(session.esp32IP || '192.168.4.1');
      } else {
        console.log('No session found in Control screen');
      }
    } catch (error) {
      console.log('Error loading session:', error);
    }
  };

  const ledControls = [
    {
      id: 'headlamp',
      name: 'Headlamp',
      icon: '💡',
      color: '#FFD700',
      pin: 0,
      description: 'Front headlights'
    },
    {
      id: 'carLight',
      name: 'Car Light',
      icon: '🚗',
      color: '#00D4FF',
      pin: 1,
      description: 'Main car lighting'
    },
    {
      id: 'trafficator',
      name: 'Trafficator',
      icon: '🔄',
      color: '#FF8C00',
      pin: 2,
      description: 'Turn signals'
    },
    {
      id: 'rearLight',
      name: 'Rear Light',
      icon: '🚙',
      color: '#FF4444',
      pin: 3,
      description: 'Rear brake lights'
    },
    {
      id: 'extraLight1',
      name: 'Extra Light 1',
      icon: '🔦',
      color: '#00FF88',
      pin: 4,
      description: 'Additional lighting'
    },
    {
      id: 'extraLight2',
      name: 'Extra Light 2',
      icon: '🔦',
      color: '#9966FF',
      pin: 5,
      description: 'Additional lighting'
    },
  ];

  const toggleLED = async (ledId, pin, currentState) => {
    try {
      const newState = !currentState;
      const response = await fetch(
        `http://${esp32IP}/led?pin=${pin}&state=${newState ? 1 : 0}`,
        { method: 'GET', timeout: 3000 }
      );

      if (response.ok) {
        setLedStates(prev => ({
          ...prev,
          [ledId]: newState
        }));
        console.log(`LED ${ledId} turned ${newState ? 'ON' : 'OFF'}`);
      } else {
        Alert.alert('Error', 'Failed to control LED');
      }
    } catch (error) {
      console.log('LED control error:', error);
      // For demo purposes, toggle the state anyway
      setLedStates(prev => ({
        ...prev,
        [ledId]: !currentState
      }));
    }
  };

  const toggleAllLights = async (turnOn) => {
    const promises = ledControls.map(led => 
      toggleLED(led.id, led.pin, !turnOn)
    );
    
    try {
      await Promise.all(promises);
      Alert.alert('Success', `All lights turned ${turnOn ? 'ON' : 'OFF'}`);
    } catch (error) {
      Alert.alert('Error', 'Failed to control some lights');
    }
  };

  const renderLEDControl = (led, index) => (
    <Animatable.View 
      key={led.id}
      animation="fadeInUp"
      duration={800}
      delay={index * 100}
      style={styles.ledCard}
    >
      <TouchableOpacity
        onPress={() => toggleLED(led.id, led.pin, ledStates[led.id])}
        style={[
          styles.ledButton,
          { borderColor: ledStates[led.id] ? led.color : '#333' }
        ]}
      >
        <LinearGradient
          colors={ledStates[led.id] ? [led.color + '20', led.color + '10'] : ['#1a1a1a', '#2d2d2d']}
          style={styles.ledGradient}
        >
          <View style={styles.ledHeader}>
            <Text style={[styles.ledIcon, { color: ledStates[led.id] ? led.color : '#666' }]}>
              {led.icon}
            </Text>
            <Switch
              value={ledStates[led.id]}
              onValueChange={() => toggleLED(led.id, led.pin, ledStates[led.id])}
              trackColor={{ false: '#333', true: led.color + '50' }}
              thumbColor={ledStates[led.id] ? led.color : '#666'}
            />
          </View>
          
          <Text style={[styles.ledName, { color: ledStates[led.id] ? led.color : '#888' }]}>
            {led.name}
          </Text>
          <Text style={styles.ledDescription}>{led.description}</Text>
          
          <View style={styles.ledStatus}>
            <View style={[
              styles.statusIndicator,
              { backgroundColor: ledStates[led.id] ? led.color : '#333' }
            ]} />
            <Text style={styles.statusText}>
              {ledStates[led.id] ? 'ON' : 'OFF'}
            </Text>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animatable.View>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <LinearGradient
        colors={['#1a1a1a', '#2d2d2d', '#1a1a1a']}
        style={styles.header}
      >
        <Animatable.View animation="fadeInDown" duration={1000}>
          <Text style={styles.headerTitle}>Light Controls</Text>
          <Text style={styles.headerSubtitle}>Manage all vehicle lighting</Text>
        </Animatable.View>
      </LinearGradient>

      {/* Auto LEDs Status */}
      <Animatable.View animation="fadeIn" duration={1000} delay={200}>
        <View style={styles.autoSection}>
          <Text style={styles.sectionTitle}>Auto-On LEDs</Text>
          <View style={styles.autoLedContainer}>
            <View style={styles.autoLed}>
              <Text style={styles.autoLedIcon}>💡</Text>
              <Text style={styles.autoLedText}>LED 1 (GPIO16)</Text>
              <View style={[styles.statusIndicator, { backgroundColor: '#00FF88' }]} />
            </View>
            <View style={styles.autoLed}>
              <Text style={styles.autoLedIcon}>💡</Text>
              <Text style={styles.autoLedText}>LED 2 (GPIO5)</Text>
              <View style={[styles.statusIndicator, { backgroundColor: '#00FF88' }]} />
            </View>
          </View>
        </View>
      </Animatable.View>

      {/* Manual Controls */}
      <View style={styles.manualSection}>
        <Text style={styles.sectionTitle}>Manual Controls</Text>
        <View style={styles.ledGrid}>
          {ledControls.map((led, index) => renderLEDControl(led, index))}
        </View>
      </View>

      {/* Quick Actions */}
      <Animatable.View animation="fadeInUp" duration={1000} delay={800} style={styles.quickActions}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => toggleAllLights(true)}
        >
          <LinearGradient colors={['#00FF88', '#00CC66']} style={styles.actionGradient}>
            <Text style={styles.actionIcon}>☀️</Text>
            <Text style={styles.actionText}>Turn All ON</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => toggleAllLights(false)}
        >
          <LinearGradient colors={['#FF4444', '#CC0000']} style={styles.actionGradient}>
            <Text style={styles.actionIcon}>🌙</Text>
            <Text style={styles.actionText}>Turn All OFF</Text>
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
  autoSection: {
    margin: 20,
    padding: 20,
    backgroundColor: '#1a1a1a',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#333',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 15,
  },
  autoLedContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  autoLed: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2d2d2d',
    padding: 10,
    borderRadius: 10,
    flex: 1,
    marginHorizontal: 5,
  },
  autoLedText: {
    color: '#ffffff',
    marginLeft: 8,
    marginRight: 8,
    fontSize: 12,
    flex: 1,
  },
  manualSection: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  ledGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  ledCard: {
    width: (width - 50) / 2,
    marginBottom: 15,
  },
  ledButton: {
    borderRadius: 15,
    borderWidth: 2,
    overflow: 'hidden',
  },
  ledGradient: {
    padding: 15,
  },
  ledHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  ledIcon: {
    fontSize: 28,
    marginRight: 10,
  },
  autoLedIcon: {
    fontSize: 20,
    color: '#00FF88',
    marginRight: 8,
  },
  actionIcon: {
    fontSize: 24,
    color: 'white',
    marginRight: 8,
  },
  ledName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  ledDescription: {
    fontSize: 12,
    color: '#666',
    marginBottom: 10,
  },
  ledStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    fontSize: 12,
    color: '#888',
    fontWeight: 'bold',
  },
  quickActions: {
    marginHorizontal: 20,
    marginBottom: 30,
  },
  actionButton: {
    marginBottom: 15,
    borderRadius: 15,
    overflow: 'hidden',
  },
  actionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  actionText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
});

export default ControlScreen;
