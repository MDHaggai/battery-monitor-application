import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';

const { width } = Dimensions.get('window');

const DocumentsScreen = () => {
  const [currentSession, setCurrentSession] = useState(null);
  const [documents, setDocuments] = useState([]);

  // Sample documents data
  const sampleDocuments = [
    {
      id: 1,
      title: 'Vehicle Registration Certificate',
      type: 'registration',
      issueDate: '2024-01-15',
      expiryDate: '2026-01-15',
      status: 'valid',
      documentNumber: 'REG-2024-001234',
      icon: '📄',
      color: '#00D4FF',
      description: 'Official vehicle registration document'
    },
    {
      id: 2,
      title: 'Insurance Policy',
      type: 'insurance',
      issueDate: '2024-03-10',
      expiryDate: '2025-03-10',
      status: 'valid',
      documentNumber: 'INS-POL-567890',
      icon: '🛡️',
      color: '#00FF88',
      description: 'Comprehensive vehicle insurance coverage'
    },
    {
      id: 3,
      title: 'Annual Safety Inspection',
      type: 'inspection',
      issueDate: '2024-06-05',
      expiryDate: '2025-06-05',
      status: 'expiring_soon',
      documentNumber: 'INSP-2024-789123',
      icon: '🔍',
      color: '#FFD700',
      description: 'Annual vehicle safety and emissions inspection'
    }
  ];

  useEffect(() => {
    loadCurrentSession();
    loadDocuments();
  }, []);

  const loadCurrentSession = async () => {
    try {
      const sessionData = await AsyncStorage.getItem('currentSession');
      if (sessionData) {
        const session = JSON.parse(sessionData);
        setCurrentSession(session);
      }
    } catch (error) {
      console.log('Error loading session:', error);
    }
  };

  const loadDocuments = () => {
    // For now, use sample data. In a real app, this would load from AsyncStorage or an API
    setDocuments(sampleDocuments);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'valid': return '#00FF88';
      case 'expiring_soon': return '#FFD700';
      case 'expired': return '#FF4444';
      default: return '#888';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'valid': return 'Valid';
      case 'expiring_soon': return 'Expiring Soon';
      case 'expired': return 'Expired';
      default: return 'Unknown';
    }
  };

  const getDaysUntilExpiry = (expiryDate) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handleDocumentPress = (document) => {
    const daysUntilExpiry = getDaysUntilExpiry(document.expiryDate);
    let message = `Document: ${document.title}\n`;
    message += `Number: ${document.documentNumber}\n`;
    message += `Issue Date: ${new Date(document.issueDate).toLocaleDateString()}\n`;
    message += `Expiry Date: ${new Date(document.expiryDate).toLocaleDateString()}\n`;
    message += `Status: ${getStatusText(document.status)}\n`;
    
    if (daysUntilExpiry > 0) {
      message += `Days until expiry: ${daysUntilExpiry}`;
    } else {
      message += `Expired ${Math.abs(daysUntilExpiry)} days ago`;
    }

    Alert.alert('Document Details', message, [
      { text: 'View Document', onPress: () => Alert.alert('Feature Coming Soon', 'Document viewing will be available in a future update.') },
      { text: 'Close', style: 'cancel' }
    ]);
  };

  const renderDocument = (document, index) => (
    <Animatable.View
      key={document.id}
      animation="fadeInUp"
      duration={800}
      delay={index * 100}
      style={styles.documentCard}
    >
      <TouchableOpacity
        onPress={() => handleDocumentPress(document)}
        style={[styles.documentButton, { borderColor: document.color }]}
      >
        <LinearGradient
          colors={[document.color + '20', document.color + '10']}
          style={styles.documentGradient}
        >
          <View style={styles.documentHeader}>
            <View style={styles.documentIcon}>
              <Text style={[styles.iconText, { color: document.color }]}>
                {document.icon}
              </Text>
            </View>
            <View style={styles.documentInfo}>
              <Text style={styles.documentTitle}>{document.title}</Text>
              <Text style={styles.documentDescription}>{document.description}</Text>
              <Text style={styles.documentNumber}>#{document.documentNumber}</Text>
            </View>
            <View style={styles.documentStatus}>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(document.status) }]}>
                <Text style={styles.statusText}>{getStatusText(document.status)}</Text>
              </View>
            </View>
          </View>
          
          <View style={styles.documentDates}>
            <View style={styles.dateInfo}>
              <Text style={styles.dateLabel}>Issued</Text>
              <Text style={styles.dateValue}>{new Date(document.issueDate).toLocaleDateString()}</Text>
            </View>
            <View style={styles.dateInfo}>
              <Text style={styles.dateLabel}>Expires</Text>
              <Text style={[styles.dateValue, { color: getStatusColor(document.status) }]}>
                {new Date(document.expiryDate).toLocaleDateString()}
              </Text>
            </View>
            <View style={styles.dateInfo}>
              <Text style={styles.dateLabel}>Days Left</Text>
              <Text style={[styles.dateValue, { color: getStatusColor(document.status) }]}>
                {getDaysUntilExpiry(document.expiryDate)}
              </Text>
            </View>
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
          <Text style={styles.headerTitle}>
            {currentSession ? `${currentSession.carName} Documents` : 'Car Documents'}
          </Text>
          <Text style={styles.headerSubtitle}>
            Manage your vehicle documentation
          </Text>
        </Animatable.View>
      </LinearGradient>

      <View style={styles.content}>
        {/* Documents Overview */}
        <Animatable.View animation="fadeInUp" duration={1000} delay={200}>
          <View style={styles.overviewSection}>
            <Text style={styles.sectionTitle}>📋 Document Overview</Text>
            <View style={styles.overviewStats}>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{documents.filter(d => d.status === 'valid').length}</Text>
                <Text style={styles.statLabel}>Valid</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={[styles.statNumber, { color: '#FFD700' }]}>
                  {documents.filter(d => d.status === 'expiring_soon').length}
                </Text>
                <Text style={styles.statLabel}>Expiring Soon</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={[styles.statNumber, { color: '#FF4444' }]}>
                  {documents.filter(d => d.status === 'expired').length}
                </Text>
                <Text style={styles.statLabel}>Expired</Text>
              </View>
            </View>
          </View>
        </Animatable.View>

        {/* Documents List */}
        <Animatable.View animation="fadeInUp" duration={1000} delay={400}>
          <View style={styles.documentsSection}>
            <Text style={styles.sectionTitle}>📄 Your Documents</Text>
            <Text style={styles.sectionSubtitle}>Tap any document to view details</Text>
            
            {documents.map((document, index) => renderDocument(document, index))}
          </View>
        </Animatable.View>

        {/* Add Document Button */}
        <Animatable.View animation="fadeInUp" duration={1000} delay={600}>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => Alert.alert('Add Document', 'Document upload feature coming soon!')}
          >
            <LinearGradient
              colors={['#00D4FF', '#0099CC']}
              style={styles.addButtonGradient}
            >
              <Text style={styles.addButtonIcon}>➕</Text>
              <Text style={styles.addButtonText}>Add New Document</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animatable.View>
      </View>
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
  content: {
    paddingHorizontal: 20,
  },
  overviewSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 15,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#888',
    marginBottom: 15,
  },
  overviewStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: '#333',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#00FF88',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#888',
  },
  documentsSection: {
    marginBottom: 30,
  },
  documentCard: {
    marginBottom: 15,
  },
  documentButton: {
    borderRadius: 15,
    borderWidth: 2,
    overflow: 'hidden',
  },
  documentGradient: {
    padding: 20,
  },
  documentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  documentIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#2d2d2d',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  iconText: {
    fontSize: 24,
  },
  documentInfo: {
    flex: 1,
  },
  documentTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 5,
  },
  documentDescription: {
    fontSize: 12,
    color: '#888',
    marginBottom: 3,
  },
  documentNumber: {
    fontSize: 10,
    color: '#666',
  },
  documentStatus: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#000',
  },
  documentDates: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  dateInfo: {
    alignItems: 'center',
  },
  dateLabel: {
    fontSize: 10,
    color: '#888',
    marginBottom: 3,
  },
  dateValue: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  addButton: {
    marginBottom: 30,
    borderRadius: 15,
    overflow: 'hidden',
  },
  addButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  addButtonIcon: {
    fontSize: 24,
    color: 'white',
    marginRight: 10,
  },
  addButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default DocumentsScreen;
