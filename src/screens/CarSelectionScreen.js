import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator,
  Platform,
  PermissionsAndroid,
  TextInput,
  Modal,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';
import WifiManager from 'react-native-wifi-reborn';

const CarSelectionScreen = ({ navigation }) => {
  const [registeredCars, setRegisteredCars] = useState([]);
  const [showWifiList, setShowWifiList] = useState(false);
  const [availableNetworks, setAvailableNetworks] = useState([]);
  const [isScanning, setIsScanning] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    loadRegisteredCars();
  }, []);

  const loadRegisteredCars = async () => {
    try {
      const cars = await AsyncStorage.getItem('registeredCars');
      if (cars) {
        setRegisteredCars(JSON.parse(cars));
      }
    } catch (error) {
      console.log('Error loading cars:', error);
    }
  };

  const saveRegisteredCar = async (carData) => {
    try {
      const updatedCars = [...registeredCars, carData];
      await AsyncStorage.setItem('registeredCars', JSON.stringify(updatedCars));
      setRegisteredCars(updatedCars);
    } catch (error) {
      console.log('Error saving car:', error);
    }
  };



  const requestLocationPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message: 'This app needs location permission to scan for WiFi networks.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true;
  };

  const scanForNetworks = async () => {
    setIsScanning(true);
    setShowWifiList(true);
    setAvailableNetworks([]);
    
    try {
      // Request location permission for Android
      const hasPermission = await requestLocationPermission();
      if (!hasPermission) {
        Alert.alert('Permission Required', 'Location permission is required to scan for WiFi networks.');
        setIsScanning(false);
        return;
      }

      console.log('Attempting WiFi scan...');
      // Real WiFi scanning
      const networks = await WifiManager.loadWifiList();
      console.log('WiFi scan result:', networks);
      
      if (networks && networks.length > 0) {
        // Filter and format the networks
        const formattedNetworks = networks
          .filter(network => network.SSID && network.SSID.trim() !== '')
          .map((network, index) => ({
            id: index,
            ssid: network.SSID,
            signal: network.level || -70,
            secured: network.capabilities && network.capabilities.includes('WPA'),
            esp32: network.SSID.toLowerCase().includes('battery') || 
                   network.SSID.toLowerCase().includes('esp32') ||
                   network.SSID.toLowerCase().includes('monitor') ||
                   network.SSID === 'BatteryMonitorAP'
          }))
          .sort((a, b) => b.signal - a.signal); // Sort by signal strength

        setAvailableNetworks(formattedNetworks);
      } else {
        throw new Error('No networks found');
      }
      
    } catch (error) {
      console.log('WiFi scan error:', error);
      
      Alert.alert(
        'WiFi Scan Failed',
        'Unable to scan for WiFi networks. This feature requires a development build or physical device. Please ensure:\n\n• You are using a development build (not Expo Go)\n• Location permissions are granted\n• WiFi is enabled on your device',
        [{ text: 'OK' }]
      );
      
      setAvailableNetworks([]);
    } finally {
      setIsScanning(false);
    }
  };

  const [selectedNetwork, setSelectedNetwork] = useState(null);
  const [password, setPassword] = useState('');
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const connectToNetwork = async (network) => {
    if (!network.esp32) {
      Alert.alert('Invalid Network', 'Please select an ESP32 battery monitor network.');
      return;
    }

    if (network.secured) {
      // Show password input modal for secured networks
      setSelectedNetwork(network);
      setPassword('');
      setShowPasswordModal(true);
    } else {
      // Connect directly to open networks
      await performWifiConnection(network, '');
    }
  };

  const performWifiConnection = async (network, password) => {
    setIsConnecting(true);
    setShowPasswordModal(false);
    
    try {
      // Attempt to connect to the WiFi network
      if (network.secured && password) {
        await WifiManager.connectToProtectedSSID(network.ssid, password, false);
      } else if (!network.secured) {
        await WifiManager.connectToProtectedSSID(network.ssid, '', false);
      }

      // Wait a bit for connection to establish
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Check if connected
      const currentSSID = await WifiManager.getCurrentWifiSSID();
      
      if (currentSSID && currentSSID.replace(/"/g, '') === network.ssid) {
        // Successfully connected
        const newCar = {
          id: Date.now(),
          name: `Car (${network.ssid})`,
          ssid: network.ssid,
          registeredAt: new Date().toISOString(),
          lastConnected: new Date().toISOString(),
          password: network.secured ? password : '',
        };

        await saveRegisteredCar(newCar);
        
        // Store the current session
        const sessionData = {
          carId: newCar.id,
          carName: newCar.name,
          ssid: network.ssid,
          esp32IP: '192.168.4.1', // ESP32 AP default IP
          connectedAt: new Date().toISOString()
        };
        
        await AsyncStorage.setItem('currentSession', JSON.stringify(sessionData));
        console.log('Stored new session:', sessionData);
        
        setIsConnecting(false);
        setShowWifiList(false);
        
        Alert.alert(
          'Car Registered Successfully!',
          `Your car has been registered with network: ${network.ssid}`,
          [
            {
              text: 'Go to Dashboard',
              onPress: () => navigation.navigate('Main'),
            },
          ]
        );
      } else {
        throw new Error('Connection failed');
      }
    } catch (error) {
      setIsConnecting(false);
      console.log('Connection error:', error);
      Alert.alert(
        'Connection Failed',
        'Unable to connect to the network. Please check the password and try again.',
        [
          { text: 'Try Again', onPress: () => connectToNetwork(network) },
          { text: 'Cancel' }
        ]
      );
    }
  };

  const selectCar = async (car) => {
    Alert.alert(
      'Connect to Car',
      `Connect to ${car.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Connect',
          onPress: async () => {
            // Update last connected time
            const updatedCars = registeredCars.map(c => 
              c.id === car.id ? { ...c, lastConnected: new Date().toISOString() } : c
            );
            setRegisteredCars(updatedCars);
            await AsyncStorage.setItem('registeredCars', JSON.stringify(updatedCars));
            
            // Store the current session
            const sessionData = {
              carId: car.id,
              carName: car.name,
              ssid: car.ssid,
              esp32IP: '192.168.4.1', // ESP32 AP default IP
              connectedAt: new Date().toISOString()
            };
            
            await AsyncStorage.setItem('currentSession', JSON.stringify(sessionData));
            console.log('Stored selected car session:', sessionData);
            
            navigation.navigate('Main');
          },
        },
      ]
    );
  };

  const getSignalIcon = (signal) => {
    if (signal > -50) return '📶';
    if (signal > -60) return '📶';
    if (signal > -70) return '📶';
    return '📶';
  };

  const getSignalColor = (signal) => {
    if (signal > -50) return '#00FF88';
    if (signal > -60) return '#FFD700';
    if (signal > -70) return '#FF8C00';
    return '#FF4444';
  };

  const renderWifiNetwork = ({ item }) => (
    <Animatable.View animation="fadeInUp" duration={800}>
      <TouchableOpacity
        style={[
          styles.networkItem,
          item.esp32 && styles.esp32Network
        ]}
        onPress={() => connectToNetwork(item)}
        disabled={isConnecting}
      >
        <LinearGradient
          colors={item.esp32 ? ['#1a1a1a', '#2d2d2d'] : ['#1a1a1a', '#1a1a1a']}
          style={styles.networkGradient}
        >
          <View style={styles.networkHeader}>
            <View style={styles.networkInfo}>
              <Text style={[styles.networkName, item.esp32 && styles.esp32NetworkName]}>
                {item.ssid}
              </Text>
              {item.esp32 && (
                <Text style={styles.esp32Label}>🔋 Battery Monitor</Text>
              )}
            </View>
            <View style={styles.networkDetails}>
              <Text style={[styles.signalIcon, { color: getSignalColor(item.signal) }]}>
                {getSignalIcon(item.signal)}
              </Text>
              <Text style={styles.signalText}>{item.signal}dBm</Text>
              {item.secured && <Text style={styles.securityIcon}>🔒</Text>}
            </View>
          </View>
          
          {item.esp32 && (
            <View style={styles.esp32Features}>
              <Text style={styles.featureText}>⚡ Voltage Monitoring</Text>
              <Text style={styles.featureText}>🔄 Current Sensing</Text>
              <Text style={styles.featureText}>💡 LED Control</Text>
            </View>
          )}
        </LinearGradient>
      </TouchableOpacity>
    </Animatable.View>
  );

  const renderRegisteredCar = ({ item }) => (
    <Animatable.View animation="fadeInUp" duration={800}>
      <TouchableOpacity
        style={styles.carItem}
        onPress={() => selectCar(item)}
      >
        <LinearGradient
          colors={['#1a1a1a', '#2d2d2d']}
          style={styles.carGradient}
        >
          <View style={styles.carHeader}>
            <Text style={styles.carIcon}>🚗</Text>
            <View style={styles.carInfo}>
              <Text style={styles.carName}>{item.name}</Text>
              <Text style={styles.carNetwork}>📶 {item.ssid}</Text>
              <Text style={styles.carDate}>
                Last connected: {new Date(item.lastConnected).toLocaleDateString()}
              </Text>
            </View>
            <Text style={styles.connectIcon}>➤</Text>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animatable.View>
  );

  if (showWifiList) {
    return (
      <View style={styles.container}>
        <LinearGradient colors={['#0a0a0a', '#1a1a1a']} style={styles.background}>
          {/* Header */}
          <Animatable.View animation="fadeInDown" duration={1000} style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => setShowWifiList(false)}
            >
              <Text style={styles.backIcon}>←</Text>
            </TouchableOpacity>
            <View style={styles.headerContent}>
              <Text style={styles.headerTitle}>Available Networks</Text>
              <Text style={styles.headerSubtitle}>Select your car's ESP32 network</Text>
            </View>
          </Animatable.View>

          {/* Scanning Indicator */}
          {isScanning && (
            <Animatable.View animation="pulse" iterationCount="infinite" style={styles.scanningContainer}>
              <ActivityIndicator size="large" color="#00D4FF" />
              <Text style={styles.scanningText}>Scanning for networks...</Text>
            </Animatable.View>
          )}

          {/* Network List */}
          {!isScanning && (
            <ScrollView style={styles.networkList} showsVerticalScrollIndicator={false}>
              <FlatList
                data={availableNetworks}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderWifiNetwork}
                scrollEnabled={false}
              />
            </ScrollView>
          )}

          {/* Connection Loading */}
          {isConnecting && (
            <Animatable.View animation="fadeIn" style={styles.connectingOverlay}>
              <ActivityIndicator size="large" color="#00D4FF" />
              <Text style={styles.connectingText}>Connecting to network...</Text>
              <Text style={styles.connectingSubtext}>This may take a few seconds</Text>
            </Animatable.View>
          )}
        </LinearGradient>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#0a0a0a', '#1a1a1a']} style={styles.background}>
        {/* Header */}
        <Animatable.View animation="fadeInDown" duration={1000} style={styles.header}>
          <Text style={styles.headerTitle}>Battery Monitor</Text>
          <Text style={styles.headerSubtitle}>Manage your car connections</Text>
        </Animatable.View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Registered Cars Section */}
          {registeredCars.length > 0 && (
            <Animatable.View animation="fadeInUp" duration={1000} delay={200}>
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>🚗 Your Cars</Text>
                <Text style={styles.sectionSubtitle}>Tap to connect to a registered car</Text>
                
                <FlatList
                  data={registeredCars}
                  keyExtractor={(item) => item.id.toString()}
                  renderItem={renderRegisteredCar}
                  scrollEnabled={false}
                />
              </View>
            </Animatable.View>
          )}

          {/* Register New Car Section */}
          <Animatable.View animation="fadeInUp" duration={1000} delay={400}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>➕ Add New Car</Text>
              <Text style={styles.sectionSubtitle}>
                {registeredCars.length === 0 
                  ? 'Register your first car to get started'
                  : 'Connect to another car battery monitor'
                }
              </Text>
              
              <TouchableOpacity
                style={styles.registerButton}
                onPress={scanForNetworks}
              >
                <LinearGradient
                  colors={['#00D4FF', '#0099CC']}
                  style={styles.registerGradient}
                >
                  <Text style={styles.registerIcon}>📡</Text>
                  <Text style={styles.registerText}>Scan for Networks</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </Animatable.View>

          {/* Instructions */}
          <Animatable.View animation="fadeInUp" duration={1000} delay={600}>
            <View style={styles.instructionsSection}>
              <Text style={styles.instructionsTitle}>📋 Setup Instructions</Text>
              <View style={styles.instructionsList}>
                <Text style={styles.instructionItem}>1. Power on your ESP32 battery monitor</Text>
                <Text style={styles.instructionItem}>2. Wait for the "BatteryMonitorAP" network</Text>
                <Text style={styles.instructionItem}>3. Tap "Scan for Networks" above</Text>
                <Text style={styles.instructionItem}>4. Select your ESP32 network</Text>
                <Text style={styles.instructionItem}>5. Start monitoring your battery! 🔋</Text>
              </View>
            </View>
          </Animatable.View>
        </ScrollView>
      </LinearGradient>
      
      {/* Password Input Modal */}
      <Modal
        visible={showPasswordModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowPasswordModal(false)}
      >
        <View style={styles.modalOverlay}>
          <Animatable.View animation="slideInUp" style={styles.passwordModal}>
            <Text style={styles.modalTitle}>Enter WiFi Password</Text>
            <Text style={styles.modalSubtitle}>Network: {selectedNetwork?.ssid}</Text>
            
            <TextInput
              style={styles.passwordInput}
              placeholder="Enter password"
              placeholderTextColor="#666"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={true}
              autoFocus={true}
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowPasswordModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.connectButton]}
                onPress={() => performWifiConnection(selectedNetwork, password)}
                disabled={!password.trim()}
              >
                <LinearGradient
                  colors={password.trim() ? ['#00D4FF', '#0099CC'] : ['#666', '#555']}
                  style={styles.connectButtonGradient}
                >
                  <Text style={styles.connectButtonText}>Connect</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </Animatable.View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
  },
  header: {
    paddingTop: 50,
    paddingBottom: 30,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  backButton: {
    position: 'absolute',
    left: 20,
    top: 50,
    padding: 10,
  },
  backIcon: {
    fontSize: 24,
    color: '#00D4FF',
  },
  headerContent: {
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
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 5,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#888',
    marginBottom: 15,
  },
  carItem: {
    marginBottom: 15,
  },
  carGradient: {
    borderRadius: 15,
    padding: 20,
    borderWidth: 1,
    borderColor: '#333',
  },
  carHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  carIcon: {
    fontSize: 40,
    marginRight: 15,
  },
  carInfo: {
    flex: 1,
  },
  carName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 5,
  },
  carNetwork: {
    fontSize: 14,
    color: '#00D4FF',
    marginBottom: 3,
  },
  carDate: {
    fontSize: 12,
    color: '#888',
  },
  connectIcon: {
    fontSize: 24,
    color: '#00D4FF',
  },
  registerButton: {
    marginTop: 10,
  },
  registerGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 15,
  },
  registerIcon: {
    fontSize: 24,
    marginRight: 10,
  },
  registerText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  networkList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  networkItem: {
    marginBottom: 15,
  },
  esp32Network: {
    borderWidth: 2,
    borderColor: '#00D4FF',
  },
  networkGradient: {
    borderRadius: 15,
    padding: 15,
  },
  networkHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  networkInfo: {
    flex: 1,
  },
  networkName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 5,
  },
  esp32NetworkName: {
    color: '#00D4FF',
  },
  esp32Label: {
    fontSize: 12,
    color: '#00FF88',
    fontWeight: '500',
  },
  networkDetails: {
    alignItems: 'flex-end',
  },
  signalIcon: {
    fontSize: 18,
    marginBottom: 2,
  },
  signalText: {
    fontSize: 12,
    color: '#888',
    marginBottom: 2,
  },
  securityIcon: {
    fontSize: 12,
  },
  esp32Features: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  featureText: {
    fontSize: 10,
    color: '#888',
  },
  scanningContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanningText: {
    fontSize: 16,
    color: '#00D4FF',
    marginTop: 15,
  },
  connectingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  connectingText: {
    fontSize: 18,
    color: '#00D4FF',
    marginTop: 15,
    fontWeight: 'bold',
  },
  connectingSubtext: {
    fontSize: 14,
    color: '#888',
    marginTop: 5,
  },
  instructionsSection: {
    backgroundColor: '#1a1a1a',
    borderRadius: 15,
    padding: 20,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: '#333',
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 15,
  },
  instructionsList: {
    paddingLeft: 10,
  },
  instructionItem: {
    fontSize: 14,
    color: '#888',
    marginBottom: 8,
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  passwordModal: {
    backgroundColor: '#1a1a1a',
    borderRadius: 15,
    padding: 25,
    width: '100%',
    maxWidth: 350,
    borderWidth: 1,
    borderColor: '#333',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    marginBottom: 20,
  },
  passwordInput: {
    backgroundColor: '#2d2d2d',
    borderRadius: 10,
    padding: 15,
    color: '#ffffff',
    fontSize: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#444',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 15,
  },
  modalButton: {
    flex: 1,
    borderRadius: 10,
    overflow: 'hidden',
  },
  cancelButton: {
    backgroundColor: '#2d2d2d',
    paddingVertical: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#444',
  },
  cancelButtonText: {
    color: '#888',
    fontSize: 16,
    fontWeight: '600',
  },
  connectButton: {
    flex: 1,
  },
  connectButtonGradient: {
    paddingVertical: 15,
    alignItems: 'center',
  },
  connectButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CarSelectionScreen;
