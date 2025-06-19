import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  Alert,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SettingsScreen = ({ navigation }) => {
  const [esp32IP, setEsp32IP] = useState('192.168.4.1');
  const [wifiSSID, setWifiSSID] = useState('ACCESS DENIED 2');
  const [wifiPassword, setWifiPassword] = useState('123456');
  const [notifications, setNotifications] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState('2');
  const [darkMode, setDarkMode] = useState(true);
  const [showWifiModal, setShowWifiModal] = useState(false);

  const [thresholds, setThresholds] = useState({
    lowVoltage: '11.8',
    highVoltage: '14.4',
    maxCurrent: '10.0',
    maxTemperature: '40',
  });

  const saveSettings = () => {
    Alert.alert('Settings Saved', 'Your settings have been saved successfully!');
  };

  const testConnection = async () => {
    try {
      const response = await fetch(`http://${esp32IP}/`, { timeout: 5000 });
      if (response.ok) {
        Alert.alert('Success', 'Connected to ESP32 successfully!');
      } else {
        Alert.alert('Error', 'Failed to connect to ESP32');
      }
    } catch (error) {
      Alert.alert('Error', 'Connection failed. Please check the IP address.');
    }
  };

  const resetToDefaults = () => {
    Alert.alert(
      'Reset Settings',
      'Are you sure you want to reset all settings to default values?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Reset', 
          onPress: () => {
            setEsp32IP('192.168.4.1');
            setWifiSSID('ACCESS DENIED 2');
            setWifiPassword('123456');
            setRefreshInterval('2');
            setThresholds({
              lowVoltage: '11.8',
              highVoltage: '14.4',
              maxCurrent: '10.0',
              maxTemperature: '40',
            });
            Alert.alert('Reset Complete', 'Settings have been reset to defaults.');
          }
        }
      ]
    );
  };

  const logout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to disconnect from the current car? You will need to reconnect to continue monitoring.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              // Clear any stored session data if needed
              await AsyncStorage.removeItem('currentSession');
              
              // Navigate back to car selection
              navigation.reset({
                index: 0,
                routes: [{ name: 'CarSelection' }],
              });
            } catch (error) {
              console.log('Logout error:', error);
              Alert.alert('Error', 'Failed to logout properly.');
            }
          }
        }
      ]
    );
  };

  const renderSettingItem = (title, subtitle, rightComponent, icon, color = '#00D4FF') => (
    <View style={styles.settingItem}>
      <View style={styles.settingLeft}>
        <Text style={[styles.settingIcon, { color }]}>{icon}</Text>
        <View style={styles.settingText}>
          <Text style={styles.settingTitle}>{title}</Text>
          {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      {rightComponent}
    </View>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <LinearGradient
        colors={['#1a1a1a', '#2d2d2d', '#1a1a1a']}
        style={styles.header}
      >
        <Animatable.View animation="fadeInDown" duration={1000}>
          <Text style={styles.headerTitle}>Settings</Text>
          <Text style={styles.headerSubtitle}>Configure your battery monitor</Text>
        </Animatable.View>
      </LinearGradient>

      {/* Connection Settings */}
      <Animatable.View animation="fadeIn" duration={1000} delay={200}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Connection</Text>
          
          {renderSettingItem(
            'ESP32 IP Address',
            esp32IP,
            <TouchableOpacity 
              style={styles.editButton}
              onPress={() => Alert.prompt('ESP32 IP', 'Enter IP address:', setEsp32IP, 'plain-text', esp32IP)}
            >
              <Text style={styles.editIcon}>✏️</Text>
            </TouchableOpacity>,
            '🌐',
            '#00D4FF'
          )}

          {renderSettingItem(
            'WiFi Settings',
            `SSID: ${wifiSSID}`,
            <TouchableOpacity 
              style={styles.editButton}
              onPress={() => setShowWifiModal(true)}
            >
              <Text style={styles.editIcon}>📶</Text>
            </TouchableOpacity>,
            '📶',
            '#00FF88'
          )}

          <TouchableOpacity style={styles.testButton} onPress={testConnection}>
            <LinearGradient colors={['#00D4FF', '#0099CC']} style={styles.testGradient}>
              <Text style={styles.testIcon}>🔄</Text>
              <Text style={styles.testButtonText}>Test Connection</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </Animatable.View>

      {/* App Settings */}
      <Animatable.View animation="fadeIn" duration={1000} delay={300}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App Settings</Text>
          
          {renderSettingItem(
            'Notifications',
            'Receive battery alerts',
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ false: '#333', true: '#00D4FF50' }}
              thumbColor={notifications ? '#00D4FF' : '#666'}
            />,
            'notifications',
            '#FFD700'
          )}

          {renderSettingItem(
            'Auto Refresh',
            'Automatically update data',
            <Switch
              value={autoRefresh}
              onValueChange={setAutoRefresh}
              trackColor={{ false: '#333', true: '#00FF8850' }}
              thumbColor={autoRefresh ? '#00FF88' : '#666'}
            />,
            'refresh',
            '#00FF88'
          )}

          {renderSettingItem(
            'Refresh Interval',
            `${refreshInterval} seconds`,
            <TouchableOpacity 
              style={styles.editButton}
              onPress={() => Alert.prompt(
                'Refresh Interval', 
                'Enter interval in seconds:', 
                setRefreshInterval, 
                'numeric', 
                refreshInterval
              )}
            >
              <Text style={styles.alertIcon}>⏰</Text>
            </TouchableOpacity>,
            'time',
            '#FF6B6B'
          )}

          {renderSettingItem(
            'Dark Mode',
            'Use dark theme',
            <Switch
              value={darkMode}
              onValueChange={setDarkMode}
              trackColor={{ false: '#333', true: '#9966FF50' }}
              thumbColor={darkMode ? '#9966FF' : '#666'}
            />,
            'moon',
            '#9966FF'
          )}
        </View>
      </Animatable.View>

      {/* Alert Thresholds */}
      <Animatable.View animation="fadeIn" duration={1000} delay={400}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Alert Thresholds</Text>
          
          {renderSettingItem(
            'Low Voltage Alert',
            `${thresholds.lowVoltage}V`,
            <TouchableOpacity 
              style={styles.editButton}
              onPress={() => Alert.prompt(
                'Low Voltage Threshold', 
                'Enter voltage:', 
                (value) => setThresholds(prev => ({...prev, lowVoltage: value})), 
                'numeric', 
                thresholds.lowVoltage
              )}
            >
              <Text style={styles.alertIcon}>⚠️</Text>
            </TouchableOpacity>,
            'battery-dead',
            '#FF4444'
          )}

          {renderSettingItem(
            'High Voltage Alert',
            `${thresholds.highVoltage}V`,
            <TouchableOpacity 
              style={styles.editButton}
              onPress={() => Alert.prompt(
                'High Voltage Threshold', 
                'Enter voltage:', 
                (value) => setThresholds(prev => ({...prev, highVoltage: value})), 
                'numeric', 
                thresholds.highVoltage
              )}
            >
              <Text style={styles.alertIcon}>⚠️</Text>
            </TouchableOpacity>,
            'battery-full',
            '#FFD700'
          )}

          {renderSettingItem(
            'Max Current Alert',
            `${thresholds.maxCurrent}A`,
            <TouchableOpacity 
              style={styles.editButton}
              onPress={() => Alert.prompt(
                'Max Current Threshold', 
                'Enter current:', 
                (value) => setThresholds(prev => ({...prev, maxCurrent: value})), 
                'numeric', 
                thresholds.maxCurrent
              )}
            >
              <Text style={styles.alertIcon}>⚡</Text>
            </TouchableOpacity>,
            'flash',
            '#FF8C00'
          )}

          {renderSettingItem(
            'Max Temperature',
            `${thresholds.maxTemperature}°C`,
            <TouchableOpacity 
              style={styles.editButton}
              onPress={() => Alert.prompt(
                'Max Temperature Threshold', 
                'Enter temperature:', 
                (value) => setThresholds(prev => ({...prev, maxTemperature: value})), 
                'numeric', 
                thresholds.maxTemperature
              )}
            >
              <Text style={styles.alertIcon}>🌡️</Text>
            </TouchableOpacity>,
            'thermometer',
            '#FF6B6B'
          )}
        </View>
      </Animatable.View>

      {/* Action Buttons */}
      <Animatable.View animation="fadeInUp" duration={1000} delay={500}>
        <View style={styles.actionSection}>
          <TouchableOpacity style={styles.actionButton} onPress={saveSettings}>
            <LinearGradient colors={['#00FF88', '#00CC66']} style={styles.actionGradient}>
              <Text style={styles.buttonIcon}>💾</Text>
              <Text style={styles.actionText}>Save Settings</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={resetToDefaults}>
            <LinearGradient colors={['#FF4444', '#CC0000']} style={styles.actionGradient}>
              <Text style={styles.buttonIcon}>🔄</Text>
              <Text style={styles.actionText}>Reset to Defaults</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={logout}>
            <LinearGradient colors={['#FF8C00', '#FF6B00']} style={styles.actionGradient}>
              <Text style={styles.buttonIcon}>🚪</Text>
              <Text style={styles.actionText}>Disconnect Car</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </Animatable.View>

      {/* WiFi Settings Modal */}
      <Modal
        visible={showWifiModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowWifiModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>WiFi Settings</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>SSID</Text>
              <TextInput
                style={styles.textInput}
                value={wifiSSID}
                onChangeText={setWifiSSID}
                placeholder="WiFi Network Name"
                placeholderTextColor="#666"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Password</Text>
              <TextInput
                style={styles.textInput}
                value={wifiPassword}
                onChangeText={setWifiPassword}
                placeholder="WiFi Password"
                placeholderTextColor="#666"
                secureTextEntry
              />
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowWifiModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.saveButton]}
                onPress={() => {
                  setShowWifiModal(false);
                  Alert.alert('WiFi Settings', 'WiFi settings updated!');
                }}
              >
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 15,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#333',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingText: {
    marginLeft: 15,
    flex: 1,
  },
  settingIcon: {
    fontSize: 24,
    marginRight: 0,
  },
  editIcon: {
    fontSize: 20,
  },
  testIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  alertIcon: {
    fontSize: 20,
  },
  buttonIcon: {
    fontSize: 24,
    marginRight: 8,
  },
  settingTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
  },
  settingSubtitle: {
    color: '#666',
    fontSize: 14,
    marginTop: 2,
  },
  editButton: {
    padding: 8,
  },
  testButton: {
    marginTop: 15,
    borderRadius: 10,
    overflow: 'hidden',
  },
  testGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  testButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  actionSection: {
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    padding: 20,
    width: '85%',
    borderWidth: 1,
    borderColor: '#333',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 15,
  },
  inputLabel: {
    color: '#ffffff',
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '500',
  },
  textInput: {
    backgroundColor: '#2d2d2d',
    borderRadius: 10,
    padding: 12,
    color: '#ffffff',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#444',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#333',
  },
  saveButton: {
    backgroundColor: '#00D4FF',
  },
  cancelButtonText: {
    color: '#ffffff',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '500',
  },
  saveButtonText: {
    color: '#ffffff',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default SettingsScreen;
