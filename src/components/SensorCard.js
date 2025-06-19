import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const SensorCard = ({ title, value, icon, color, subtitle }) => {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#1a1a1a', '#2d2d2d']}
        style={styles.card}
      >
        <View style={styles.header}>
          <Text style={[styles.iconText, { color }]}>{icon}</Text>
          <View style={[styles.indicator, { backgroundColor: color }]} />
        </View>
        
        <Text style={[styles.value, { color }]}>{value}</Text>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
        
        {/* Subtle glow effect */}
        <View style={[styles.glow, { shadowColor: color }]} />
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: (width - 50) / 2,
    marginBottom: 15,
  },
  card: {
    borderRadius: 15,
    padding: 15,
    borderWidth: 1,
    borderColor: '#333',
    position: 'relative',
    minHeight: 120,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  iconText: {
    fontSize: 24,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  value: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  title: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '600',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 12,
    color: '#888',
  },
  glow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 15,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
});

export default SensorCard;
