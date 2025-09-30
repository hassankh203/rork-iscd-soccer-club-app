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
  Platform,
} from 'react-native';
import { useApp } from '@/hooks/app-context';
import { Media } from '@/types';
import { Upload, Camera, Link, Trash2, Download, ImagePlus } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';



export default function AdminPicOfWeek() {
  const { media, uploadMedia, removeMedia, refreshData } = useApp();
  const [imageUrl, setImageUrl] = useState<string>('');
  const [caption, setCaption] = useState<string>('');
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const allMedia = media || [];

  console.log('🖼️ Admin Pic of Week - Media count:', allMedia.length);
  console.log('🖼️ Media items:', JSON.stringify(allMedia, null, 2));

  const pickImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert('Permission Required', 'Please allow access to your photo library to upload images.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedImage(result.assets[0].uri);
        setImageUrl('');
      }
    } catch (error) {
      console.error('❌ Image picker error:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const takePhoto = async () => {
    try {
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert('Permission Required', 'Please allow access to your camera to take photos.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedImage(result.assets[0].uri);
        setImageUrl('');
      }
    } catch (error) {
      console.error('❌ Camera error:', error);
      Alert.alert('Error', 'Failed to take photo');
    }
  };

  const handleUpload = async () => {
    const imageSource = selectedImage || imageUrl.trim();
    
    if (!imageSource) {
      Alert.alert('Error', 'Please select an image or enter an image URL');
      return;
    }

    if (!selectedImage && imageUrl.trim()) {
      const urlPattern = /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i;
      if (!urlPattern.test(imageUrl.trim())) {
        Alert.alert('Error', 'Please enter a valid image URL (jpg, jpeg, png, gif, webp)');
        return;
      }
    }

    setIsUploading(true);
    try {
      console.log('📤 Uploading media:', imageSource);
      console.log('📝 Caption:', caption.trim() || 'No caption');
      
      await uploadMedia(imageSource, 'image', caption.trim() || undefined);
      
      console.log('✅ Media uploaded successfully');
      console.log('📊 Current media count:', media?.length || 0);
      
      setImageUrl('');
      setCaption('');
      setSelectedImage(null);
      
      await refreshData();
      
      Alert.alert('Success', 'Picture uploaded successfully!');
    } catch (error) {
      console.error('❌ Upload error:', error);
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to upload picture');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownload = async (mediaItem: Media) => {
    if (Platform.OS === 'web') {
      // For web, open image in new tab
      window.open(mediaItem.url, '_blank');
    } else {
      // For mobile, show alert with URL (since we can't actually download without additional permissions)
      Alert.alert(
        'Download Image',
        'Copy the image URL to download manually:',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Copy URL', onPress: () => {
            // In a real app, you'd use Clipboard API here
            Alert.alert('URL Copied', mediaItem.url);
          }}
        ]
      );
    }
  };

  const handleRemove = (mediaItem: Media) => {
    Alert.alert(
      'Remove Picture',
      'Are you sure you want to remove this picture?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Remove', 
          style: 'destructive',
          onPress: async () => {
            try {
              await removeMedia(mediaItem.id);
              Alert.alert('Success', 'Picture removed successfully');
            } catch (error) {
              console.error('Remove error:', error);
              Alert.alert('Error', 'Failed to remove picture');
            }
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Camera size={32} color="#D4AF37" />
          <Text style={styles.title}>Pic of the Week</Text>
          <Text style={styles.subtitle}>Upload and manage the weekly picture</Text>
        </View>

        {/* All Uploaded Pictures */}
        {allMedia.length > 0 && (
          <View style={styles.currentPicSection}>
            <Text style={styles.sectionTitle}>Uploaded Pictures ({allMedia.length})</Text>
            {allMedia.map((mediaItem, index) => (
              <View key={mediaItem.id} style={styles.mediaItem}>
                <View style={styles.imageContainer}>
                  <Image 
                    source={{ uri: mediaItem.url }} 
                    style={styles.currentImage}
                    resizeMode="cover"
                  />
                  <View style={styles.imageOverlay}>
                    <TouchableOpacity 
                      style={styles.actionButton}
                      onPress={() => handleDownload(mediaItem)}
                    >
                      <Download size={20} color="#fff" />
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.actionButton, styles.removeButton]}
                      onPress={() => handleRemove(mediaItem)}
                    >
                      <Trash2 size={20} color="#fff" />
                    </TouchableOpacity>
                  </View>
                </View>
                {mediaItem.caption && (
                  <Text style={styles.currentCaption}>{mediaItem.caption}</Text>
                )}
                <Text style={styles.uploadDate}>
                  Uploaded: {new Date(mediaItem.uploadedAt).toLocaleDateString()}
                </Text>
                {index < allMedia.length - 1 && <View style={styles.mediaSeparator} />}
              </View>
            ))}
          </View>
        )}

        {/* Upload New Picture */}
        <View style={styles.uploadSection}>
          <Text style={styles.sectionTitle}>
            Upload New Picture
          </Text>
          
          {/* Image Selection Buttons */}
          <View style={styles.imageSelectionContainer}>
            <TouchableOpacity 
              style={styles.imagePickerButton}
              onPress={pickImage}
            >
              <ImagePlus size={24} color="#1B5E20" />
              <Text style={styles.imagePickerButtonText}>Choose from Gallery</Text>
            </TouchableOpacity>
            
            {Platform.OS !== 'web' && (
              <TouchableOpacity 
                style={styles.imagePickerButton}
                onPress={takePhoto}
              >
                <Camera size={24} color="#1B5E20" />
                <Text style={styles.imagePickerButtonText}>Take Photo</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Preview Selected Image */}
          {selectedImage && (
            <View style={styles.previewContainer}>
              <Text style={styles.previewLabel}>Selected Image:</Text>
              <Image 
                source={{ uri: selectedImage }} 
                style={styles.previewImage}
                resizeMode="cover"
              />
              <TouchableOpacity 
                style={styles.clearImageButton}
                onPress={() => setSelectedImage(null)}
              >
                <Trash2 size={16} color="#fff" />
                <Text style={styles.clearImageButtonText}>Remove</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* OR Divider */}
          {!selectedImage && (
            <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.dividerLine} />
            </View>
          )}
          
          {/* URL Input */}
          {!selectedImage && (
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
          )}

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
              {isUploading ? 'Uploading...' : 'Upload Picture'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Instructions */}
        <View style={styles.instructionsSection}>
          <Text style={styles.instructionsTitle}>Instructions</Text>
          <Text style={styles.instructionText}>
            • Choose images from your device gallery or take a new photo
          </Text>
          <Text style={styles.instructionText}>
            • Alternatively, paste an image URL from trusted sources
          </Text>
          <Text style={styles.instructionText}>
            • Supported formats: JPG, JPEG, PNG, GIF, WebP
          </Text>
          <Text style={styles.instructionText}>
            • Images should be appropriate for all ages
          </Text>
          <Text style={styles.instructionText}>
            • Multiple pictures can be uploaded and managed
          </Text>
          <Text style={styles.instructionText}>
            • Parents can view and download all uploaded pictures
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
  mediaItem: {
    marginBottom: 16,
  },
  mediaSeparator: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginTop: 16,
  },
  imageSelectionContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  imagePickerButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#E8F5E8',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderWidth: 2,
    borderColor: '#1B5E20',
  },
  imagePickerButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1B5E20',
  },
  previewContainer: {
    marginBottom: 20,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#f8f9fa',
    padding: 12,
  },
  previewLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1B5E20',
    marginBottom: 8,
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    marginBottom: 12,
  },
  clearImageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#ff3b30',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  clearImageButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#ddd',
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    fontWeight: '600',
    color: '#999',
  },
});