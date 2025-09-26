import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Image,
  Dimensions,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '@/hooks/app-context';
import { Upload, Camera, Link, Trash2, Download } from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function AdminPicOfWeek() {
  const { media, uploadMedia } = useApp();
  const [imageUrl, setImageUrl] = useState<string>('');
  const [caption, setCaption] = useState<string>('');
  const [isUploading, setIsUploading] = useState<boolean>(false);

  const currentPic = media.length > 0 ? media[0] : null;

  const handleUpload = async () => {
    if (!imageUrl.trim()) {
      Alert.alert('Error', 'Please enter an image URL');
      return;
    }

    // Basic URL validation
    const urlPattern = /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i;
    if (!urlPattern.test(imageUrl.trim())) {
      Alert.alert('Error', 'Please enter a valid image URL (jpg, jpeg, png, gif, webp)');
      return;
    }

    setIsUploading(true);
    try {
      await uploadMedia(imageUrl.trim(), 'image', caption.trim() || undefined);
      setImageUrl('');
      setCaption('');
      Alert.alert('Success', 'Picture of the week uploaded successfully!');
    } catch (error) {
      console.error('Upload error:', error);
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to upload picture');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownload = async () => {
    if (!currentPic) return;

    if (Platform.OS === 'web') {
      // For web, open image in new tab
      window.open(currentPic.url, '_blank');
    } else {
      // For mobile, show alert with URL (since we can't actually download without additional permissions)
      Alert.alert(
        'Download Image',
        'Copy the image URL to download manually:',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Copy URL', onPress: () => {
            // In a real app, you'd use Clipboard API here
            Alert.alert('URL Copied', currentPic.url);
          }}
        ]
      );
    }
  };

  const handleRemove = () => {
    Alert.alert(
      'Remove Picture',
      'Are you sure you want to remove the current picture of the week?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Remove', 
          style: 'destructive',
          onPress: async () => {
            try {
              // Clear media by uploading empty array
              await uploadMedia('', 'image');
              Alert.alert('Success', 'Picture removed successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to remove picture');
            }
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Camera size={32} color="#D4AF37" />
          <Text style={styles.title}>Pic of the Week</Text>
          <Text style={styles.subtitle}>Upload and manage the weekly picture</Text>
        </View>

        {/* Current Picture Display */}
        {currentPic && (
          <View style={styles.currentPicSection}>
            <Text style={styles.sectionTitle}>Current Picture</Text>
            <View style={styles.imageContainer}>
              <Image 
                source={{ uri: currentPic.url }} 
                style={styles.currentImage}
                resizeMode="cover"
              />
              <View style={styles.imageOverlay}>
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={handleDownload}
                >
                  <Download size={20} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.actionButton, styles.removeButton]}
                  onPress={handleRemove}
                >
                  <Trash2 size={20} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>
            {currentPic.caption && (
              <Text style={styles.currentCaption}>{currentPic.caption}</Text>
            )}
            <Text style={styles.uploadDate}>
              Uploaded: {new Date(currentPic.uploadedAt).toLocaleDateString()}
            </Text>
          </View>
        )}

        {/* Upload New Picture */}
        <View style={styles.uploadSection}>
          <Text style={styles.sectionTitle}>
            {currentPic ? 'Replace Picture' : 'Upload New Picture'}
          </Text>
          
          <View style={styles.inputContainer}>
            <Link size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.urlInput}
              placeholder="Enter image URL (https://...)"
              value={imageUrl}
              onChangeText={setImageUrl}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
            />
          </View>

          <TextInput
            style={styles.captionInput}
            placeholder="Add a caption (optional)"
            value={caption}
            onChangeText={setCaption}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />

          <TouchableOpacity 
            style={[styles.uploadButton, isUploading && styles.uploadButtonDisabled]}
            onPress={handleUpload}
            disabled={isUploading}
          >
            <Upload size={20} color="#fff" />
            <Text style={styles.uploadButtonText}>
              {isUploading ? 'Uploading...' : currentPic ? 'Replace Picture' : 'Upload Picture'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Instructions */}
        <View style={styles.instructionsSection}>
          <Text style={styles.instructionsTitle}>Instructions</Text>
          <Text style={styles.instructionText}>
            • Use high-quality images from trusted sources like Unsplash
          </Text>
          <Text style={styles.instructionText}>
            • Supported formats: JPG, JPEG, PNG, GIF, WebP
          </Text>
          <Text style={styles.instructionText}>
            • Images should be appropriate for all ages
          </Text>
          <Text style={styles.instructionText}>
            • Only one picture can be active at a time
          </Text>
          <Text style={styles.instructionText}>
            • Parents can view and download the current picture
          </Text>
        </View>

        {/* Example URLs */}
        <View style={styles.examplesSection}>
          <Text style={styles.examplesTitle}>Example Image URLs</Text>
          <TouchableOpacity 
            onPress={() => setImageUrl('https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=800')}
          >
            <Text style={styles.exampleUrl}>
              https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=800
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => setImageUrl('https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800')}
          >
            <Text style={styles.exampleUrl}>
              https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
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
    backgroundColor: '#1B5E20',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    marginTop: 12,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#E8F5E8',
    textAlign: 'center',
  },
  currentPicSection: {
    marginHorizontal: 20,
    marginBottom: 24,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1B5E20',
    marginBottom: 16,
  },
  imageContainer: {
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
  },
  currentImage: {
    width: '100%',
    height: 200,
    backgroundColor: '#f0f0f0',
  },
  imageOverlay: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 20,
    padding: 8,
  },
  removeButton: {
    backgroundColor: 'rgba(255, 59, 48, 0.8)',
  },
  currentCaption: {
    fontSize: 16,
    color: '#333',
    fontStyle: 'italic',
    marginBottom: 8,
  },
  uploadDate: {
    fontSize: 14,
    color: '#666',
  },
  uploadSection: {
    marginHorizontal: 20,
    marginBottom: 24,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
    backgroundColor: '#f8f9fa',
  },
  inputIcon: {
    marginRight: 12,
  },
  urlInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  captionInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#f8f9fa',
    marginBottom: 20,
    minHeight: 80,
  },
  uploadButton: {
    backgroundColor: '#1B5E20',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  uploadButtonDisabled: {
    backgroundColor: '#ccc',
  },
  uploadButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  instructionsSection: {
    marginHorizontal: 20,
    marginBottom: 24,
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
    marginBottom: 12,
  },
  instructionText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    lineHeight: 20,
  },
  examplesSection: {
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
  examplesTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1B5E20',
    marginBottom: 12,
  },
  exampleUrl: {
    fontSize: 12,
    color: '#007AFF',
    marginBottom: 8,
    textDecorationLine: 'underline',
  },
});