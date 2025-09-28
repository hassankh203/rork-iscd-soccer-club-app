import { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Pressable,
  Alert
} from "react-native";
import { useLocalData } from "@/hooks/local-data-context";
import { Search, User, MoreVertical, UserCheck, UserX, Trash2 } from "lucide-react-native";
import { User as DbUser, Kid as DbKid } from "@/lib/database";
import React from "react";

export default function UsersScreen() {
  const { getUsers, getKids, updateUserStatusById, deleteUserById } = useLocalData();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<DbUser | null>(null);
  const [users, setUsers] = useState<DbUser[]>([]);
  const [allKids, setAllKids] = useState<DbKid[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [actionModalVisible, setActionModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  // Load users and kids data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      console.log('🔄 Loading users data...');
      const [usersData, kidsData] = await Promise.all([
        getUsers(),
        getKids()
      ]);
      console.log('📊 Users loaded:', usersData.length, 'users');
      console.log('👶 Kids loaded:', kidsData.length, 'kids');
      console.log('👥 Users data:', usersData);
      setUsers(usersData);
      setAllKids(kidsData);
    } catch (error) {
      console.error('❌ Failed to load data:', error);
      Alert.alert('Error', `Failed to load users data: ${error}`);
    } finally {
      setLoading(false);
    }
  };



  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getUserKids = (userId: string) => {
    return allKids.filter(k => k.parentId === userId);
  };

  const handleUpdateUserStatus = async (userId: string, newStatus: 'active' | 'inactive') => {
    try {
      setLoading(true);
      await updateUserStatusById(userId, newStatus);
      await loadData();
      setActionModalVisible(false);
      Alert.alert('Success', `User status updated to ${newStatus}`);
    } catch (error) {
      console.error('Failed to update user status:', error);
      Alert.alert('Error', 'Failed to update user status');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    Alert.alert(
      'Delete User',
      'Are you sure you want to delete this user? This will also delete all their kids, payments, and communications. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await deleteUserById(userId);
              await loadData();
              setActionModalVisible(false);
              setModalVisible(false);
              Alert.alert('Success', 'User deleted successfully');
            } catch (error) {
              console.error('Failed to delete user:', error);
              Alert.alert('Error', 'Failed to delete user');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };



  return (
    <ScrollView style={styles.container}>
      <View style={styles.searchContainer}>
        <Search color="#666" size={20} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search users..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>All Users ({users.length})</Text>
        {loading ? (
          <Text style={styles.loadingText}>Loading users...</Text>
        ) : filteredUsers.length === 0 ? (
          <Text style={styles.emptyText}>
            {users.length === 0 ? 'No users found in the database.' : 'No users match your search.'}
          </Text>
        ) : (
          filteredUsers.map(user => {
            const userKids = getUserKids(user.id);
            const isActive = user.status === 'active';
            return (
              <TouchableOpacity
                key={user.id}
                style={[
                  styles.userCard,
                  !isActive && styles.inactiveUserCard
                ]}
                onPress={() => {
                  setSelectedUser(user);
                  setModalVisible(true);
                }}
              >
                <View style={styles.userHeader}>
                  <View style={[
                    styles.userAvatar,
                    !isActive && styles.inactiveUserAvatar
                  ]}>
                    <User color={isActive ? "#1B5E20" : "#999"} size={20} />
                  </View>
                  <View style={styles.userInfo}>
                    <View style={styles.userNameRow}>
                      <Text style={[
                        styles.userName,
                        !isActive && styles.inactiveText
                      ]}>{user.name}</Text>
                      <View style={[
                        styles.statusBadge,
                        isActive ? styles.activeBadge : styles.inactiveBadge
                      ]}>
                        <Text style={[
                          styles.statusText,
                          isActive ? styles.activeStatusText : styles.inactiveStatusText
                        ]}>
                          {user.status || 'active'}
                        </Text>
                      </View>
                    </View>
                    <Text style={[
                      styles.userEmail,
                      !isActive && styles.inactiveText
                    ]}>{user.email}</Text>
                    <Text style={[
                      styles.userPhone,
                      !isActive && styles.inactiveText
                    ]}>{user.phone}</Text>
                    <Text style={[
                      styles.userRole,
                      !isActive && styles.inactiveText
                    ]}>Role: {user.role}</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => {
                      setSelectedUser(user);
                      setActionModalVisible(true);
                    }}
                  >
                    <MoreVertical color="#666" size={20} />
                  </TouchableOpacity>
                </View>
                <View style={styles.userStats}>
                  <Text style={[
                    styles.kidCount,
                    !isActive && styles.inactiveText
                  ]}>{userKids.length} kids registered</Text>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </View>



      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable 
          style={styles.modalOverlay}
          onPress={() => setModalVisible(false)}
        >
          <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
            {selectedUser && (
              <>
                <Text style={styles.modalTitle}>{selectedUser.name}</Text>
                <View style={styles.modalInfo}>
                  <Text style={styles.modalLabel}>Email:</Text>
                  <Text style={styles.modalValue}>{selectedUser.email}</Text>
                </View>
                <View style={styles.modalInfo}>
                  <Text style={styles.modalLabel}>Phone:</Text>
                  <Text style={styles.modalValue}>{selectedUser.phone}</Text>
                </View>
                <View style={styles.modalInfo}>
                  <Text style={styles.modalLabel}>Member Since:</Text>
                  <Text style={styles.modalValue}>
                    {new Date(selectedUser.createdAt).toLocaleDateString()}
                  </Text>
                </View>
                
                <Text style={styles.modalSectionTitle}>Registered Kids</Text>
                {getUserKids(selectedUser.id).map(kid => (
                  <View key={kid.id} style={styles.modalKidCard}>
                    <Text style={styles.modalKidName}>{kid.name}</Text>
                    <Text style={styles.modalKidInfo}>
                      Age: {kid.age} • Team: {kid.team}
                    </Text>
                  </View>
                ))}
                
                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => {
                      setActionModalVisible(true);
                    }}
                  >
                    <Text style={styles.actionButtonText}>Manage User</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => setModalVisible(false)}
                  >
                    <Text style={styles.closeButtonText}>Close</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </Pressable>
      </Modal>

      {/* Action Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={actionModalVisible}
        onRequestClose={() => setActionModalVisible(false)}
      >
        <Pressable 
          style={styles.modalOverlay}
          onPress={() => setActionModalVisible(false)}
        >
          <View style={styles.actionModalContent} onStartShouldSetResponder={() => true}>
            {selectedUser && (
              <>
                <Text style={styles.actionModalTitle}>Manage {selectedUser.name}</Text>
                
                <TouchableOpacity
                  style={[
                    styles.actionOption,
                    selectedUser.status === 'active' ? styles.deactivateOption : styles.activateOption
                  ]}
                  onPress={() => {
                    const newStatus = selectedUser.status === 'active' ? 'inactive' : 'active';
                    handleUpdateUserStatus(selectedUser.id, newStatus);
                  }}
                  disabled={loading}
                >
                  {selectedUser.status === 'active' ? (
                    <UserX color="#FF6B35" size={20} />
                  ) : (
                    <UserCheck color="#1B5E20" size={20} />
                  )}
                  <Text style={[
                    styles.actionOptionText,
                    selectedUser.status === 'active' ? styles.deactivateText : styles.activateText
                  ]}>
                    {selectedUser.status === 'active' ? 'Deactivate User' : 'Activate User'}
                  </Text>
                </TouchableOpacity>

                {selectedUser.role !== 'admin' && (
                  <TouchableOpacity
                    style={[styles.actionOption, styles.deleteOption]}
                    onPress={() => handleDeleteUser(selectedUser.id)}
                    disabled={loading}
                  >
                    <Trash2 color="#DC2626" size={20} />
                    <Text style={[styles.actionOptionText, styles.deleteText]}>Delete User</Text>
                  </TouchableOpacity>
                )}
                
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setActionModalVisible(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </Pressable>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    margin: 20,
    marginBottom: 0,
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 16,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  userCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  userHeader: {
    flexDirection: 'row',
    gap: 12,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E8F5E9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  userPhone: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  userStats: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  kidCount: {
    fontSize: 14,
    color: '#1B5E20',
    fontWeight: '500',
  },
  rosterCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  rosterInfo: {
    gap: 4,
  },
  kidName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  kidAge: {
    fontSize: 14,
    color: '#666',
  },
  parentName: {
    fontSize: 14,
    color: '#999',
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    padding: 20,
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
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalInfo: {
    marginBottom: 16,
  },
  modalLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  modalValue: {
    fontSize: 16,
    color: '#333',
  },
  modalSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 20,
    marginBottom: 12,
  },
  modalKidCard: {
    backgroundColor: '#F5F5F5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  modalKidName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  modalKidInfo: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  closeButton: {
    backgroundColor: '#1B5E20',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  closeButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    padding: 20,
  },
  inactiveUserCard: {
    opacity: 0.7,
    borderLeftWidth: 4,
    borderLeftColor: '#FF6B35',
  },
  inactiveUserAvatar: {
    backgroundColor: '#FFF3F0',
  },
  userNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  inactiveText: {
    color: '#999',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    minWidth: 60,
    alignItems: 'center',
  },
  activeBadge: {
    backgroundColor: '#E8F5E9',
  },
  inactiveBadge: {
    backgroundColor: '#FFF3F0',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  activeStatusText: {
    color: '#1B5E20',
  },
  inactiveStatusText: {
    color: '#FF6B35',
  },
  userRole: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
    fontStyle: 'italic',
  },
  actionButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  actionButtonText: {
    color: '#1B5E20',
    fontWeight: '600',
    textAlign: 'center',
  },
  actionModalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    width: '90%',
    maxWidth: 350,
  },
  actionModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 24,
    textAlign: 'center',
  },
  actionOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    gap: 12,
  },
  activateOption: {
    backgroundColor: '#E8F5E9',
  },
  deactivateOption: {
    backgroundColor: '#FFF3F0',
  },
  deleteOption: {
    backgroundColor: '#FEF2F2',
  },
  actionOptionText: {
    fontSize: 16,
    fontWeight: '600',
  },
  activateText: {
    color: '#1B5E20',
  },
  deactivateText: {
    color: '#FF6B35',
  },
  deleteText: {
    color: '#DC2626',
  },
  cancelButton: {
    backgroundColor: '#F5F5F5',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  cancelButtonText: {
    color: '#666',
    fontWeight: '600',
  },
});