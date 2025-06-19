import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import * as Animatable from 'react-native-animatable';

const ConnectionStatus = ({ isConnected }) => {
  return (
    <Animatable.View 
      animation={isConnected ? "pulse" : "shake"} 
      iterationCount="infinite" 
      duration={isConnected ? 2000 : 1000}
      style={styles.container}
    >
      <View style={[styles.statusCard, { borderColor: isConnected ? '#00FF88' : '#FF4444' }]}>
        <Text style={[styles.wifiIcon, { color: isConnected ? '#00FF88' : '#FF4444' }]}>
          {isConnected ? '📶' : '📵'}
        </Text>
        <Text style={[styles.statusText, { color: isConnected ? '#00FF88' : '#FF4444' }]}>
          {isConnected ? 'Connected' : 'Disconnected'}
        </Text>
        <View style={[styles.indicator, { backgroundColor: isConnected ? '#00FF88' : '#FF4444' }]} />
      </View>
    </Animatable.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 15,
  },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2d2d2d',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  wifiIcon: {
    fontSize: 16,
  },
  statusText: {
    marginLeft: 8,
    marginRight: 8,
    fontSize: 14,
    fontWeight: '600',
  },
  indicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});

export default ConnectionStatus;
