import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';

const BatteryWidget = ({ percentage, voltage, status, statusColor }) => {
  const getBatteryIcon = () => {
    if (percentage >= 75) return 'battery-full';
    if (percentage >= 50) return 'battery-half';
    if (percentage >= 25) return 'battery-quarter';
    return 'battery-dead';
  };

  const getBatteryColor = () => {
    if (percentage >= 60) return '#00FF88';
    if (percentage >= 30) return '#FFD700';
    return '#FF4444';
  };

  const batteryWidth = Math.max(percentage, 5); // Minimum 5% for visibility

  return (
    <Animatable.View animation="pulse" iterationCount="infinite" duration={3000}>
      <View style={styles.container}>
        <LinearGradient
          colors={['#1a1a1a', '#2d2d2d']}
          style={styles.widget}
        >
          {/* Battery Icon and Percentage */}
          <View style={styles.batterySection}>
            <View style={styles.batteryContainer}>
              <View style={styles.batteryShell}>
                <View style={styles.batteryTip} />
                <LinearGradient
                  colors={[getBatteryColor(), getBatteryColor() + '80']}
                  style={[styles.batteryFill, { width: `${batteryWidth}%` }]}
                />
              </View>
              <Text style={[styles.percentageText, { color: getBatteryColor() }]}>
                {percentage.toFixed(1)}%
              </Text>
            </View>
          </View>

          {/* Status and Voltage */}
          <View style={styles.infoSection}>
            <View style={styles.statusContainer}>
              <Text style={[styles.statusIcon, { color: statusColor }]}>✓</Text>
              <Text style={[styles.statusText, { color: statusColor }]}>{status}</Text>
            </View>
            
            <View style={styles.voltageContainer}>
              <Text style={styles.voltageIcon}>⚡</Text>
              <Text style={styles.voltageText}>{voltage.toFixed(2)}V</Text>
            </View>
          </View>

          {/* Animated Lightning Effect */}
          {percentage > 20 && (
            <Animatable.View 
              animation="flash" 
              iterationCount="infinite" 
              duration={2000}
              style={styles.lightningContainer}
            >
              <Text style={[styles.lightningIcon, { color: getBatteryColor() }]}>⚡</Text>
            </Animatable.View>
          )}
        </LinearGradient>
      </View>
    </Animatable.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginTop: 20,
  },
  widget: {
    borderRadius: 20,
    padding: 25,
    borderWidth: 1,
    borderColor: '#333',
    position: 'relative',
  },
  batterySection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  batteryContainer: {
    alignItems: 'center',
  },
  batteryShell: {
    width: 100,
    height: 40,
    borderWidth: 3,
    borderColor: '#333',
    borderRadius: 8,
    position: 'relative',
    backgroundColor: '#0a0a0a',
    overflow: 'hidden',
  },
  batteryTip: {
    position: 'absolute',
    right: -8,
    top: 12,
    width: 6,
    height: 16,
    backgroundColor: '#333',
    borderTopRightRadius: 3,
    borderBottomRightRadius: 3,
  },
  batteryFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    height: '100%',
    borderRadius: 5,
  },
  percentageText: {
    fontSize: 32,
    fontWeight: 'bold',
    marginTop: 15,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  infoSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  statusText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  voltageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  voltageIcon: {
    fontSize: 18,
    color: '#00D4FF',
    marginRight: 6,
  },
  voltageText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#00D4FF',
  },
  lightningIcon: {
    fontSize: 24,
  },
  lightningContainer: {
    position: 'absolute',
    top: 15,
    right: 15,
  },
});

export default BatteryWidget;
