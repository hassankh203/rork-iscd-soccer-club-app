import { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  Pressable
} from "react-native";
import { useApp } from "@/hooks/app-context";
import { Bell, MessageSquare, Calendar, Send, Upload, Plus } from "lucide-react-native";
import * as ImagePicker from 'expo-image-picker';

export default function AdminCommunicationScreen() {
  const { 
    createTrainingPoll, 
    createAnnouncement, 
    sendMessage,
    messages,
    uploadMedia,
    trainingPolls,
    kids
  } = useApp();
  
  const [activeTab, setActiveTab] = useState<'polls' | 'announcements' | 'messages' | 'media'>('polls');
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<'poll' | 'announcement' | 'message' | 'media'>('poll');
  
  // Form states
  const [pollTitle, setPollTitle] = useState("");
  const [pollDate, setPollDate] = useState("");
  const [pollDescription, setPollDescription] = useState("");
  
  const [announcementTitle, setAnnouncementTitle] = useState("");
  const [announcementContent, setAnnouncementContent] = useState("");
  
  const [messageContent, setMessageContent] = useState("");
  const [selectedUserId, setSelectedUserId] = useState("");
  
  const [mediaUrl, setMediaUrl] = useState("");
  const [mediaCaption, setMediaCaption] = useState("");

  const handleCreatePoll = async () => {
    if (!pollTitle || !pollDate || !pollDescription) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    await createTrainingPoll({
      title: pollTitle,
      date: pollDate,
      description: pollDescription
    });

    Alert.alert("Success", "Training poll created");
    setModalVisible(false);
    setPollTitle("");
    setPollDate("");
    setPollDescription("");
  };

  const handleCreateAnnouncement = async () => {
    if (!announcementTitle || !announcementContent) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    await createAnnouncement(announcementTitle, announcementContent);
    Alert.alert("Success", "Announcement created");
    setModalVisible(false);
    setAnnouncementTitle("");
    setAnnouncementContent("");
  };

  const handleSendMessage = async () => {
    if (!messageContent || !selectedUserId) {
      Alert.alert("Error", "Please select a user and enter a message");
      return;
    }

    await sendMessage(selectedUserId, messageContent);
    Alert.alert("Success", "Message sent");
    setModalVisible(false);
    setMessageContent("");
    setSelectedUserId("");
  };

  const handleUploadMedia = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      // In production, you would upload to a server
      // For now, we'll use a placeholder URL
      const placeholderUrl = "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800";
      await uploadMedia(placeholderUrl, 'image', mediaCaption);
      Alert.alert("Success", "Media uploaded");
      setModalVisible(false);
      setMediaCaption("");
    }
  };

  const openModal = (type: typeof modalType) => {
    setModalType(type);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedUserId("");
    setMessageContent("");
    setPollTitle("");
    setPollDate("");
    setPollDescription("");
    setAnnouncementTitle("");
    setAnnouncementContent("");
    setMediaCaption("");
  };

  // Calculate poll statistics
  const getPollStats = (pollId: string) => {
    const poll = trainingPolls.find(p => p.id === pollId);
    if (!poll) return { yes: 0, no: 0, total: 0 };
    
    const yes = poll.responses.filter(r => r.attending).length;
    const no = poll.responses.filter(r => !r.attending).length;
    return { yes, no, total: yes + no };
  };

  return (
    <View style={styles.container}>
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'polls' && styles.activeTab]}
          onPress={() => setActiveTab('polls')}
        >
          <Calendar color={activeTab === 'polls' ? '#D4AF37' : '#fff'} size={20} />
          <Text style={[styles.tabText, activeTab === 'polls' && styles.activeTabText]}>
            Polls
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'announcements' && styles.activeTab]}
          onPress={() => setActiveTab('announcements')}
        >
          <Bell color={activeTab === 'announcements' ? '#D4AF37' : '#fff'} size={20} />
          <Text style={[styles.tabText, activeTab === 'announcements' && styles.activeTabText]}>
            Announce
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'messages' && styles.activeTab]}
          onPress={() => setActiveTab('messages')}
        >
          <MessageSquare color={activeTab === 'messages' ? '#D4AF37' : '#fff'} size={20} />
          <Text style={[styles.tabText, activeTab === 'messages' && styles.activeTabText]}>
            Messages
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'media' && styles.activeTab]}
          onPress={() => setActiveTab('media')}
        >
          <Upload color={activeTab === 'media' ? '#D4AF37' : '#fff'} size={20} />
          <Text style={[styles.tabText, activeTab === 'media' && styles.activeTabText]}>
            Media
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {activeTab === 'polls' && (
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.createButton}
              onPress={() => openModal('poll')}
            >
              <Plus color="#fff" size={20} />
              <Text style={styles.createButtonText}>Create Training Poll</Text>
            </TouchableOpacity>
            
            {trainingPolls.map(poll => {
              const stats = getPollStats(poll.id);
              return (
                <View key={poll.id} style={styles.pollCard}>
                  <Text style={styles.pollTitle}>{poll.title}</Text>
                  <Text style={styles.pollDate}>{poll.date}</Text>
                  <Text style={styles.pollDescription}>{poll.description}</Text>
                  <View style={styles.pollStats}>
                    <Text style={styles.statText}>✓ Yes: {stats.yes}</Text>
                    <Text style={styles.statText}>✗ No: {stats.no}</Text>
                    <Text style={styles.statText}>Total: {stats.total}/{kids.length}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {activeTab === 'announcements' && (
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.createButton}
              onPress={() => openModal('announcement')}
            >
              <Plus color="#fff" size={20} />
              <Text style={styles.createButtonText}>Create Announcement</Text>
            </TouchableOpacity>
          </View>
        )}

        {activeTab === 'messages' && (
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.createButton}
              onPress={() => openModal('message')}
            >
              <Plus color="#fff" size={20} />
              <Text style={styles.createButtonText}>Send New Message</Text>
            </TouchableOpacity>
            
            <Text style={styles.sectionTitle}>All Messages</Text>
            {messages.length > 0 ? (
              messages.map(message => (
                <View key={message.id} style={styles.messageCard}>
                  <View style={styles.messageHeader}>
                    <Text style={styles.messageFrom}>
                      {message.fromUserId === 'admin' ? 'You → User' : 'User → You'}
                    </Text>
                    {!message.read && message.toUserId === 'admin' && (
                      <View style={styles.unreadDot} />
                    )}
                  </View>
                  <Text style={styles.messageContent}>{message.content}</Text>
                  <Text style={styles.messageDate}>
                    {new Date(message.createdAt).toLocaleString()}
                  </Text>
                  {message.fromUserId !== 'admin' && (
                    <TouchableOpacity 
                      style={styles.replyButton}
                      onPress={() => {
                        setSelectedUserId(message.fromUserId);
                        openModal('message');
                      }}
                    >
                      <MessageSquare color="#1B5E20" size={16} />
                      <Text style={styles.replyButtonText}>Reply</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ))
            ) : (
              <Text style={styles.emptyText}>No messages yet</Text>
            )}
          </View>
        )}

        {activeTab === 'media' && (
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.createButton}
              onPress={() => openModal('media')}
            >
              <Plus color="#fff" size={20} />
              <Text style={styles.createButtonText}>Upload Pic of the Week</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable 
          style={styles.modalOverlay}
          onPress={closeModal}
        >
          <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
            {modalType === 'poll' && (
              <>
                <Text style={styles.modalTitle}>Create Training Poll</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Poll Title"
                  value={pollTitle}
                  onChangeText={setPollTitle}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Date (e.g., 2024-01-15)"
                  value={pollDate}
                  onChangeText={setPollDate}
                />
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Description"
                  value={pollDescription}
                  onChangeText={setPollDescription}
                  multiline
                  numberOfLines={4}
                />
                <TouchableOpacity style={styles.submitButton} onPress={handleCreatePoll}>
                  <Text style={styles.submitButtonText}>Create Poll</Text>
                </TouchableOpacity>
              </>
            )}

            {modalType === 'announcement' && (
              <>
                <Text style={styles.modalTitle}>Create Announcement</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Announcement Title"
                  value={announcementTitle}
                  onChangeText={setAnnouncementTitle}
                />
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Content"
                  value={announcementContent}
                  onChangeText={setAnnouncementContent}
                  multiline
                  numberOfLines={6}
                />
                <TouchableOpacity style={styles.submitButton} onPress={handleCreateAnnouncement}>
                  <Text style={styles.submitButtonText}>Create Announcement</Text>
                </TouchableOpacity>
              </>
            )}

            {modalType === 'message' && (
              <>
                <Text style={styles.modalTitle}>
                  {selectedUserId ? 'Reply to User' : 'Send New Message'}
                </Text>
                {!selectedUserId && (
                  <TextInput
                    style={styles.input}
                    placeholder="User ID (e.g., demo-parent)"
                    value={selectedUserId}
                    onChangeText={setSelectedUserId}
                  />
                )}
                {selectedUserId && (
                  <View style={styles.recipientInfo}>
                    <Text style={styles.recipientLabel}>To: {selectedUserId}</Text>
                  </View>
                )}
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Message"
                  value={messageContent}
                  onChangeText={setMessageContent}
                  multiline
                  numberOfLines={4}
                />
                <TouchableOpacity style={styles.submitButton} onPress={handleSendMessage}>
                  <Send color="#fff" size={18} />
                  <Text style={styles.submitButtonText}>Send Message</Text>
                </TouchableOpacity>
              </>
            )}

            {modalType === 'media' && (
              <>
                <Text style={styles.modalTitle}>Upload Media</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Caption (optional)"
                  value={mediaCaption}
                  onChangeText={setMediaCaption}
                  multiline
                  numberOfLines={3}
                />
                <TouchableOpacity style={styles.submitButton} onPress={handleUploadMedia}>
                  <Upload color="#fff" size={20} />
                  <Text style={styles.submitButtonText}>Select & Upload Image</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#1B5E20',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  activeTab: {
    borderBottomWidth: 3,
    borderBottomColor: '#D4AF37',
  },
  tabText: {
    fontSize: 12,
    color: '#fff',
  },
  activeTabText: {
    color: '#D4AF37',
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 20,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#D4AF37',
    padding: 16,
    borderRadius: 12,
    gap: 8,
    marginBottom: 20,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  pollCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  pollTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  pollDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  pollDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  pollStats: {
    flexDirection: 'row',
    gap: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  statText: {
    fontSize: 14,
    color: '#1B5E20',
    fontWeight: '500',
  },
  messageCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  messageTo: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1B5E20',
    marginBottom: 8,
  },
  messageContent: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
  },
  messageDate: {
    fontSize: 12,
    color: '#999',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    marginBottom: 16,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1B5E20',
    padding: 16,
    borderRadius: 8,
    gap: 8,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  messageFrom: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1B5E20',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF0000',
  },
  replyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F5F5',
    padding: 8,
    borderRadius: 6,
    gap: 4,
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  replyButtonText: {
    color: '#1B5E20',
    fontSize: 12,
    fontWeight: '500',
  },
  recipientInfo: {
    backgroundColor: '#E8F5E8',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  recipientLabel: {
    fontSize: 14,
    color: '#1B5E20',
    fontWeight: '500',
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    padding: 40,
  },
});