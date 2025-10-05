import { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  Pressable,
  Platform,
  KeyboardAvoidingView
} from "react-native";
import { useApp } from "@/hooks/app-context";
import { useLocalAuth } from "@/hooks/local-auth-context";
import { useLocalData } from "@/hooks/local-data-context";
import { Bell, MessageSquare, Calendar, Send, Upload, Plus, ChevronDown, Trash2 } from "lucide-react-native";
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { User } from "@/lib/database";

export default function AdminCommunicationScreen() {
  const { user } = useLocalAuth();
  const { getUsers } = useLocalData();
  const { 
    createTrainingPoll, 
    createAnnouncement, 
    sendMessage,
    messages,
    uploadMedia,
    trainingPolls,
    announcements,
    kids,
    unreadCounts,
    markCommunicationTabOpened,
    deletePoll
  } = useApp();
  
  const [users, setUsers] = useState<User[]>([]);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  
  const [activeTab, setActiveTab] = useState<'polls' | 'announcements' | 'messages' | 'media'>('polls');
  
  useEffect(() => {
    loadUsers();
  }, []);
  
  const loadUsers = async () => {
    try {
      const allUsers = await getUsers();
      const parentUsers = allUsers.filter(u => u.role === 'parent' && u.status === 'active');
      setUsers(parentUsers);
    } catch (error) {
      console.error('Failed to load users:', error);
    }
  };
  
  const handleTabChange = async (tab: 'polls' | 'announcements' | 'messages' | 'media') => {
    setActiveTab(tab);
    if (tab === 'messages') {
      await markCommunicationTabOpened('messages');
    } else if (tab === 'announcements') {
      await markCommunicationTabOpened('announcements');
    } else if (tab === 'polls') {
      await markCommunicationTabOpened('polls');
    }
  };
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<'poll' | 'announcement' | 'message' | 'media'>('poll');
  
  // Form states
  const [pollTitle, setPollTitle] = useState("");
  const [pollDate, setPollDate] = useState("");
  const [pollDescription, setPollDescription] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  const [announcementTitle, setAnnouncementTitle] = useState("");
  const [announcementContent, setAnnouncementContent] = useState("");
  
  const [messageContent, setMessageContent] = useState("");
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedUserName, setSelectedUserName] = useState("");
  
  const [mediaUrl, setMediaUrl] = useState("");
  const [mediaCaption, setMediaCaption] = useState("");

  const handleDateChange = (event: any, date?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    
    if (date) {
      setSelectedDate(date);
      const formattedDate = date.toISOString().split('T')[0];
      setPollDate(formattedDate);
    }
  };

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
    setSelectedDate(new Date());
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
    setSelectedUserName("");
    setMessageContent("");
    setPollTitle("");
    setPollDate("");
    setPollDescription("");
    setAnnouncementTitle("");
    setAnnouncementContent("");
    setMediaCaption("");
    setShowDatePicker(false);
    setSelectedDate(new Date());
    setShowUserDropdown(false);
  };

  // Calculate poll statistics
  const getPollStats = (pollId: string) => {
    const poll = trainingPolls.find(p => p.id === pollId);
    if (!poll) return { yes: 0, no: 0, total: 0 };
    
    const yes = poll.responses.filter(r => r.attending).length;
    const no = poll.responses.filter(r => !r.attending).length;
    return { yes, no, total: yes + no };
  };

  const handleDeletePoll = (pollId: string, pollTitle: string) => {
    Alert.alert(
      'Delete Poll',
      `Are you sure you want to delete "${pollTitle}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deletePoll(pollId);
              Alert.alert('Success', 'Poll deleted successfully');
            } catch (error) {
              console.error('Failed to delete poll:', error);
              Alert.alert('Error', 'Failed to delete poll');
            }
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'polls' && styles.activeTab]}
          onPress={() => handleTabChange('polls')}
        >
          <View style={styles.tabIconContainer}>
            <Calendar color={activeTab === 'polls' ? '#D4AF37' : '#fff'} size={20} />
            {unreadCounts.polls > 0 && <View style={styles.tabUnreadDot} />}
          </View>
          <Text style={[styles.tabText, activeTab === 'polls' && styles.activeTabText]}>
            Polls
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'announcements' && styles.activeTab]}
          onPress={() => handleTabChange('announcements')}
        >
          <View style={styles.tabIconContainer}>
            <Bell color={activeTab === 'announcements' ? '#D4AF37' : '#fff'} size={20} />
            {unreadCounts.announcements > 0 && <View style={styles.tabUnreadDot} />}
          </View>
          <Text style={[styles.tabText, activeTab === 'announcements' && styles.activeTabText]}>
            Announce
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'messages' && styles.activeTab]}
          onPress={() => handleTabChange('messages')}
        >
          <View style={styles.tabIconContainer}>
            <MessageSquare color={activeTab === 'messages' ? '#D4AF37' : '#fff'} size={20} />
            {unreadCounts.messages > 0 && <View style={styles.tabUnreadDot} />}
          </View>
          <Text style={[styles.tabText, activeTab === 'messages' && styles.activeTabText]}>
            Messages
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'media' && styles.activeTab]}
          onPress={() => handleTabChange('media')}
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
              const pollDate = new Date(poll.date);
              const isExpired = pollDate < new Date();
              
              return (
                <View key={poll.id} style={styles.pollCard}>
                  <View style={styles.pollHeader}>
                    <View style={styles.pollHeaderLeft}>
                      <Text style={styles.pollTitle}>{poll.title}</Text>
                      {isExpired && (
                        <View style={styles.expiredBadge}>
                          <Text style={styles.expiredBadgeText}>Expired</Text>
                        </View>
                      )}
                    </View>
                    <TouchableOpacity
                      style={styles.deletePollButton}
                      onPress={() => handleDeletePoll(poll.id, poll.title)}
                    >
                      <Trash2 size={18} color="#F44336" />
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.pollDate}>
                    {new Date(poll.date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </Text>
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
            
            <Text style={styles.sectionTitle}>All Announcements</Text>
            {announcements.length > 0 ? (
              announcements.map(announcement => (
                <View key={announcement.id} style={styles.announcementCard}>
                  <Text style={styles.announcementTitle}>{announcement.title}</Text>
                  <Text style={styles.announcementContent}>{announcement.content}</Text>
                  <Text style={styles.announcementDate}>
                    {new Date(announcement.createdAt).toLocaleString()}
                  </Text>
                  <Text style={styles.announcementReadCount}>
                    Read by: {announcement.readBy.length} users
                  </Text>
                </View>
              ))
            ) : (
              <Text style={styles.emptyText}>No announcements yet</Text>
            )}
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
                    {!message.read && message.toUserId === user?.id && (
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
                        const replyUser = users.find(u => u.id === message.fromUserId);
                        setSelectedUserName(replyUser?.name || message.fromUserId);
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
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <Pressable 
            style={styles.modalOverlay}
            onPress={closeModal}
          >
            <ScrollView 
              contentContainerStyle={styles.modalScrollContent}
              keyboardShouldPersistTaps="handled"
            >
              <Pressable onPress={(e) => e.stopPropagation()}>
                <View style={styles.modalContent}>
            {modalType === 'poll' && (
              <>
                <Text style={styles.modalTitle}>Create Training Poll</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Poll Title"
                  value={pollTitle}
                  onChangeText={setPollTitle}
                />
                
                <TouchableOpacity 
                  style={styles.datePickerButton}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Calendar color="#1B5E20" size={20} />
                  <Text style={styles.datePickerButtonText}>
                    {pollDate || 'Select Date'}
                  </Text>
                </TouchableOpacity>
                
                {showDatePicker && (
                  <DateTimePicker
                    value={selectedDate}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={handleDateChange}
                    minimumDate={new Date()}
                  />
                )}
                
                {Platform.OS === 'ios' && showDatePicker && (
                  <TouchableOpacity 
                    style={styles.datePickerDoneButton}
                    onPress={() => setShowDatePicker(false)}
                  >
                    <Text style={styles.datePickerDoneText}>Done</Text>
                  </TouchableOpacity>
                )}
                
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
                {!selectedUserId ? (
                  <View>
                    <TouchableOpacity
                      style={styles.dropdownButton}
                      onPress={() => setShowUserDropdown(!showUserDropdown)}
                    >
                      <Text style={styles.dropdownButtonText}>
                        {selectedUserName || 'Select a user'}
                      </Text>
                      <ChevronDown color="#666" size={20} />
                    </TouchableOpacity>
                    
                    {showUserDropdown && (
                      <View style={styles.dropdownList}>
                        <ScrollView style={styles.dropdownScrollView} nestedScrollEnabled>
                          {users.length > 0 ? (
                            users.map((u) => (
                              <TouchableOpacity
                                key={u.id}
                                style={styles.dropdownItem}
                                onPress={() => {
                                  setSelectedUserId(u.id);
                                  setSelectedUserName(u.name);
                                  setShowUserDropdown(false);
                                }}
                              >
                                <Text style={styles.dropdownItemName}>{u.name}</Text>
                                <Text style={styles.dropdownItemEmail}>{u.email}</Text>
                              </TouchableOpacity>
                            ))
                          ) : (
                            <View style={styles.dropdownItem}>
                              <Text style={styles.dropdownItemEmail}>No users available</Text>
                            </View>
                          )}
                        </ScrollView>
                      </View>
                    )}
                  </View>
                ) : (
                  <View style={styles.recipientInfo}>
                    <Text style={styles.recipientLabel}>To: {selectedUserName}</Text>
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
            </ScrollView>
          </Pressable>
        </KeyboardAvoidingView>
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
  pollHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  pollHeaderLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  pollTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  deletePollButton: {
    padding: 4,
  },
  expiredBadge: {
    backgroundColor: '#F44336',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  expiredBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
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
  },
  modalScrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
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
  tabIconContainer: {
    position: 'relative',
  },
  tabUnreadDot: {
    position: 'absolute',
    top: -2,
    right: -6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF0000',
  },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    gap: 12,
  },
  datePickerButtonText: {
    fontSize: 16,
    color: '#333',
  },
  datePickerDoneButton: {
    backgroundColor: '#1B5E20',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  datePickerDoneText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  announcementCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  announcementTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  announcementContent: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    lineHeight: 20,
  },
  announcementDate: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  announcementReadCount: {
    fontSize: 12,
    color: '#1B5E20',
    fontWeight: '500',
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  dropdownButtonText: {
    fontSize: 16,
    color: '#333',
  },
  dropdownList: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginBottom: 16,
    maxHeight: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dropdownScrollView: {
    maxHeight: 200,
  },
  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  dropdownItemName: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
    marginBottom: 4,
  },
  dropdownItemEmail: {
    fontSize: 14,
    color: '#666',
  },
});