import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '@/hooks/app-context';
import { Camera, Download, Calendar, ImageIcon } from 'lucide-react-native';

export default function ParentPicOfWeek() {
  const { media } = useApp();
  const insets = useSafeAreaInsets();
  const currentPic = media.length > 0 ? media[0] : null;

  const handleDownload = async () => {
    if (!currentPic) return;

    if (Platform.OS === 'web') {
      // For web, open image in new tab for download
      const link = document.createElement('a');
      link.href = currentPic.url;
      link.download = `pic-of-week-${new Date(currentPic.uploadedAt).toISOString().split('T')[0]}.jpg`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      // For mobile, open in browser (user can save from there)
      // In a real app, you'd implement proper download functionality
      console.log('Opening image for download:', currentPic.url);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Camera size={32} color="#1B5E20" />
          <Text style={styles.title}>Pic of the Week</Text>
          <Text style={styles.subtitle}>Latest picture from ISCD</Text>
        </View>

        {currentPic ? (
          <View style={styles.picContainer}>
            <View style={styles.imageWrapper}>
              <Image 
                source={{ uri: currentPic.url }} 
                style={styles.image}
                resizeMode="cover"
              />
              <TouchableOpacity 
                style={styles.downloadButton}
                onPress={handleDownload}
              >
                <Download size={20} color="#fff" />
                <Text style={styles.downloadButtonText}>Download</Text>
              </TouchableOpacity>
            </View>

            {currentPic.caption && (
              <View style={styles.captionContainer}>
                <Text style={styles.caption}>{currentPic.caption}</Text>
              </View>
            )}

            <View style={styles.dateContainer}>
              <Calendar size={16} color="#666" />
              <Text style={styles.dateText}>
                Uploaded: {formatDate(currentPic.uploadedAt)}
              </Text>
            </View>

            <View style={styles.infoContainer}>
              <Text style={styles.infoTitle}>About This Picture</Text>
              <Text style={styles.infoText}>
                This is the current picture of the week shared by the ISCD administration. 
                You can download it to save to your device or share with family and friends.
              </Text>
            </View>
          </View>
        ) : (
          <View style={styles.noPicContainer}>
            <ImageIcon size={64} color="#ccc" />
            <Text style={styles.noPicTitle}>No Picture Available</Text>
            <Text style={styles.noPicText}>
              The administration hasn&apos;t uploaded a picture of the week yet. 
              Check back later for updates!
            </Text>
          </View>
        )}

        <View style={styles.instructionsContainer}>
          <Text style={styles.instructionsTitle}>How to Use</Text>
          <View style={styles.instructionItem}>
            <Text style={styles.instructionNumber}>1</Text>
            <Text style={styles.instructionText}>
              View the latest picture shared by the club administration
            </Text>
          </View>
          <View style={styles.instructionItem}>
            <Text style={styles.instructionNumber}>2</Text>
            <Text style={styles.instructionText}>
              Tap the download button to save the image to your device
            </Text>
          </View>
          <View style={styles.instructionItem}>
            <Text style={styles.instructionNumber}>3</Text>
            <Text style={styles.instructionText}>
              Share memorable moments with your family and friends
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1B5E20',
    marginTop: 12,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  picContainer: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  imageWrapper: {
    position: 'relative',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  image: {
    width: '100%',
    height: 250,
    backgroundColor: '#f0f0f0',
  },
  downloadButton: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    backgroundColor: 'rgba(27, 94, 32, 0.9)',
    borderRadius: 25,
    paddingVertical: 10,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  downloadButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  captionContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  caption: {
    fontSize: 16,
    color: '#333',
    fontStyle: 'italic',
    lineHeight: 22,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  dateText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  infoContainer: {
    backgroundColor: '#E8F5E8',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#1B5E20',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1B5E20',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#2E7D32',
    lineHeight: 20,
  },
  noPicContainer: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
    marginHorizontal: 20,
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  noPicTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
    marginBottom: 12,
  },
  noPicText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    lineHeight: 22,
  },
  instructionsContainer: {
    marginHorizontal: 20,
    marginBottom: 40,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1B5E20',
    marginBottom: 16,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  instructionNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#1B5E20',
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 24,
    marginRight: 12,
  },
  instructionText: {
    flex: 1,
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});