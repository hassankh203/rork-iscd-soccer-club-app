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
import { useAuth } from "@/hooks/auth-context";
import { useApp } from "@/hooks/app-context";
import { Bell, MessageSquare, Calendar, Send, Check, X } from "lucide-react-native";

export default function CommunicationScreen() {
  const { user } = useAuth();
  const { 
    kids, 
    trainingPolls, 
    announcements, 
    messages,
    respondToPoll,
    markAnnouncementRead,
    sendMessage,
    markMessageRead,
    deleteMessage
  } = useApp();
  
  const [activeTab, setActiveTab] = useState<'polls' | 'announcements' | 'messages'>('polls');
  const [replyModalVisible, setReplyModalVisible] = useState(false);
  const [newMessageModalVisible, setNewMessageModalVisible] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [newMessageContent, setNewMessageContent] = useState("");
  const [selectedMessage, setSelectedMessage] = useState<typeof messages[0] | null>(null);

  const myKids = kids.filter(k => k.parentId === user?.id);
  const myMessages = messages.filter(m => m.toUserId === user?.id || m.fromUserId === user?.id);

  const handlePollResponse = async (pollId: string, kidId: string, attending: boolean) => {
    await respondToPoll(pollId, kidId, attending);
    Alert.alert("Success", "Response recorded");
  };

  const handleReplyMessage = async () => {
    if (!replyContent.trim()) {
      Alert.alert("Error", "Please enter a message");
      return;
    }

    await sendMessage('admin', replyContent);
    setReplyModalVisible(false);
    setReplyContent("");
    setSelectedMessage(null);
    Alert.alert("Success", "Reply sent");
  };

  const handleSendNewMessage = async () => {
    if (!newMessageContent.trim()) {
      Alert.alert("Error", "Please enter a message");
      return;
    }

    await sendMessage('admin', newMessageContent);
    setNewMessageModalVisible(false);
    setNewMessageContent("");
    Alert.alert("Success", "Message sent to admin");
  };

  const handleOpenAnnouncement = async (announcement: typeof announcements[0]) => {
    await markAnnouncementRead(announcement.id);
  };

  const handleOpenMessage = async (message: typeof messages[0]) => {
    if (!message.read && message.toUserId === user?.id) {
      await markMessageRead(message.id);
    }
    setSelectedMessage(message);
    setReplyModalVisible(true);
  };

  const handleDeleteMessage = async (messageId: string) => {
    Alert.alert(
      "Delete Message",
      "Are you sure you want to delete this message?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive", 
          onPress: async () => {
            await deleteMessage(messageId);
            Alert.alert("Success", "Message deleted");
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
          onPress={() => setActiveTab('polls')}
        >
          <Calendar color={activeTab === 'polls' ? '#1B5E20' : '#666'} size={20} />
          <Text style={[styles.tabText, activeTab === 'polls' && styles.activeTabText]}>
            Training
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'announcements' && styles.activeTab]}
          onPress={() => setActiveTab('announcements')}
        >
          <Bell color={activeTab === 'announcements' ? '#1B5E20' : '#666'} size={20} />
          <Text style={[styles.tabText, activeTab === 'announcements' && styles.activeTabText]}>
            Announcements
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'messages' && styles.activeTab]}
          onPress={() => setActiveTab('messages')}
        >
          <MessageSquare color={activeTab === 'messages' ? '#1B5E20' : '#666'} size={20} />
          <Text style={[styles.tabText, activeTab === 'messages' && styles.activeTabText]}>
            Messages
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {activeTab === 'polls' && (
          <View style={styles.section}>
            {trainingPolls.length > 0 ? (
              trainingPolls.map(poll => {
                const myKidResponses = poll.responses.filter(r => 
                  myKids.some(k => k.id === r.kidId)
                );
                const hasUnresponded = myKids.some(kid => 
                  !poll.responses.some(r => r.kidId === kid.id)
                );
                
                return (
                  <View key={poll.id} style={styles.pollCard}>
                    <View style={styles.pollHeader}>
                      <Text style={styles.pollTitle}>{poll.title}</Text>
                      {hasUnresponded && <View style={styles.unreadDot} />}
                    </View>
                    <Text style={styles.pollDate}>
                      {new Date(poll.date).toLocaleDateString()}
                    </Text>
                    <Text style={styles.pollDescription}>{poll.description}</Text>
                    
                    <View style={styles.kidResponses}>
                      {myKids.map(kid => {
                        const response = poll.responses.find(r => r.kidId === kid.id);
                        return (
                          <View key={kid.id} style={styles.kidResponse}>
                            <Text style={styles.kidName}>{kid.name}</Text>
                            <View style={styles.responseButtons}>
                              <TouchableOpacity
                                style={[
                                  styles.responseButton,
                                  response?.attending === true && styles.activeYes
                                ]}
                                onPress={() => handlePollResponse(poll.id, kid.id, true)}
                              >
                                <Check color={response?.attending === true ? '#fff' : '#4CAF50'} size={16} />
                                <Text style={[
                                  styles.responseText,
                                  response?.attending === true && styles.activeResponseText
                                ]}>Yes</Text>
                              </TouchableOpacity>
                              
                              <TouchableOpacity
                                style={[
                                  styles.responseButton,
                                  response?.attending === false && styles.activeNo
                                ]}
                                onPress={() => handlePollResponse(poll.id, kid.id, false)}
                              >
                                <X color={response?.attending === false ? '#fff' : '#F44336'} size={16} />
                                <Text style={[
                                  styles.responseText,
                                  response?.attending === false && styles.activeResponseText
                                ]}>No</Text>
                              </TouchableOpacity>
                            </View>
                          </View>
                        );
                      })}
                    </View>
                  </View>
                );
              })
            ) : (
              <Text style={styles.emptyText}>No training polls yet</Text>
            )}
          </View>
        )}

        {activeTab === 'announcements' && (
          <View style={styles.section}>
            {announcements.length > 0 ? (
              announcements.map(announcement => (
                <TouchableOpacity
                  key={announcement.id}
                  style={styles.announcementCard}
                  onPress={() => handleOpenAnnouncement(announcement)}
                >
                  <View style={styles.announcementHeader}>
                    <Text style={styles.announcementTitle}>{announcement.title}</Text>
                    {!announcement.readBy.includes(user?.id || '') && (
                      <View style={styles.unreadDot} />
                    )}
                  </View>
                  <Text style={styles.announcementContent}>{announcement.content}</Text>
                  <Text style={styles.announcementDate}>
                    {new Date(announcement.createdAt).toLocaleDateString()}
                  </Text>
                </TouchableOpacity>
              ))
            ) : (
              <Text style={styles.emptyText}>No announcements yet</Text>
            )}
          </View>
        )}

        {activeTab === 'messages' && (
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.newMessageButton}
              onPress={() => setNewMessageModalVisible(true)}
            >
              <Send color="#fff" size={20} />
              <Text style={styles.newMessageButtonText}>Send New Message to Admin</Text>
            </TouchableOpacity>
            
            {myMessages.length > 0 ? (
              myMessages.map(message => (
                <TouchableOpacity
                  key={message.id}
                  style={styles.messageCard}
                  onPress={() => handleOpenMessage(message)}
                  onLongPress={() => handleDeleteMessage(message.id)}
                >
                  <View style={styles.messageHeader}>
                    <Text style={styles.messageFrom}>
                      {message.fromUserId === user?.id ? 'You' : 'Admin'}
                    </Text>
                    {!message.read && message.toUserId === user?.id && (
                      <View style={styles.unreadDot} />
                    )}
                  </View>
                  <Text style={styles.messageContent}>{message.content}</Text>
                  <Text style={styles.messageDate}>
                    {new Date(message.createdAt).toLocaleString()}
                  </Text>
                </TouchableOpacity>
              ))
            ) : (
              <View>
                <Text style={styles.emptyText}>No messages yet</Text>
                <Text style={styles.emptySubText}>Tap the button above to send your first message to the admin</Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>

      <Modal
        animationType="slide"
        transparent={true}
        visible={replyModalVisible}
        onRequestClose={() => setReplyModalVisible(false)}
      >
        <Pressable 
          style={styles.modalOverlay}
          onPress={() => setReplyModalVisible(false)}
        >
          <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
            <Text style={styles.modalTitle}>Reply to Admin</Text>
            
            {selectedMessage && (
              <View style={styles.originalMessage}>
                <Text style={styles.originalLabel}>Original Message:</Text>
                <Text style={styles.originalContent}>{selectedMessage.content}</Text>
              </View>
            )}
            
            <TextInput
              style={styles.replyInput}
              placeholder="Type your reply..."
              value={replyContent}
              onChangeText={setReplyContent}
              multiline
              numberOfLines={4}
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setReplyModalVisible(false);
                  setReplyContent("");
                  setSelectedMessage(null);
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.sendButton]}
                onPress={handleReplyMessage}
              >
                <Send color="#fff" size={18} />
                <Text style={styles.sendButtonText}>Send</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Pressable>
      </Modal>

      <Modal
        animationType="slide"
        transparent={true}
        visible={newMessageModalVisible}
        onRequestClose={() => setNewMessageModalVisible(false)}
      >
        <Pressable 
          style={styles.modalOverlay}
          onPress={() => setNewMessageModalVisible(false)}
        >
          <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
            <Text style={styles.modalTitle}>Send Message to Admin</Text>
            
            <TextInput
              style={styles.replyInput}
              placeholder="Type your message..."
              value={newMessageContent}
              onChangeText={setNewMessageContent}
              multiline
              numberOfLines={4}
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setNewMessageModalVisible(false);
                  setNewMessageContent("");
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.sendButton]}
                onPress={handleSendNewMessage}
              >
                <Send color="#fff" size={18} />
                <Text style={styles.sendButtonText}>Send</Text>
              </TouchableOpacity>
            </View>
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
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
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
    borderBottomWidth: 2,
    borderBottomColor: '#1B5E20',
  },
  tabText: {
    fontSize: 14,
    color: '#666',
  },
  activeTabText: {
    color: '#1B5E20',
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 20,
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
    alignItems: 'center',
    marginBottom: 8,
  },
  pollTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  pollDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  pollDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  kidResponses: {
    gap: 12,
  },
  kidResponse: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  kidName: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  responseButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  responseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    gap: 4,
  },
  activeYes: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  activeNo: {
    backgroundColor: '#F44336',
    borderColor: '#F44336',
  },
  responseText: {
    fontSize: 12,
    color: '#666',
  },
  activeResponseText: {
    color: '#fff',
  },
  announcementCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  announcementHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  announcementTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  announcementContent: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 8,
  },
  announcementDate: {
    fontSize: 12,
    color: '#999',
  },
  messageCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
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
  messageContent: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    marginBottom: 8,
  },
  messageDate: {
    fontSize: 12,
    color: '#999',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF0000',
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    padding: 40,
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
  originalMessage: {
    backgroundColor: '#F5F5F5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  originalLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  originalContent: {
    fontSize: 14,
    color: '#333',
  },
  replyInput: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  cancelButton: {
    backgroundColor: '#F5F5F5',
  },
  cancelButtonText: {
    color: '#666',
    fontWeight: '600',
  },
  sendButton: {
    backgroundColor: '#1B5E20',
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  newMessageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1B5E20',
    padding: 16,
    borderRadius: 12,
    gap: 8,
    marginBottom: 20,
  },
  newMessageButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  emptySubText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginTop: 8,
  },
});