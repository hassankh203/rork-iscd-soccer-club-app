import { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Pressable
} from "react-native";
import { useApp } from "@/hooks/app-context";
import { Search, Users, User, Calendar } from "lucide-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { User as UserType } from "@/types";
import React from "react";

export default function UsersScreen() {
  const { kids, getTeamRoster } = useApp();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [users, setUsers] = useState<UserType[]>([]);
  const [modalVisible, setModalVisible] = useState(false);

  // Load users from storage
  React.useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    const usersData = await AsyncStorage.getItem('users');
    if (usersData) {
      setUsers(JSON.parse(usersData));
    }
  };

  const teamARoster = getTeamRoster('A');
  const teamBRoster = getTeamRoster('B');

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getUserKids = (userId: string) => {
    return kids.filter(k => k.parentId === userId);
  };

  const currentYear = new Date().getFullYear();

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
        <Text style={styles.sectionTitle}>Parents ({users.length})</Text>
        {filteredUsers.map(user => {
          const userKids = getUserKids(user.id);
          return (
            <TouchableOpacity
              key={user.id}
              style={styles.userCard}
              onPress={() => {
                setSelectedUser(user);
                setModalVisible(true);
              }}
            >
              <View style={styles.userHeader}>
                <View style={styles.userAvatar}>
                  <User color="#1B5E20" size={20} />
                </View>
                <View style={styles.userInfo}>
                  <Text style={styles.userName}>{user.name}</Text>
                  <Text style={styles.userEmail}>{user.email}</Text>
                  <Text style={styles.userPhone}>{user.phone}</Text>
                </View>
              </View>
              <View style={styles.userStats}>
                <Text style={styles.kidCount}>{userKids.length} kids registered</Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Team A Roster (10+ years)</Text>
        {teamARoster.length > 0 ? (
          teamARoster.map(kid => {
            const parent = users.find(u => u.id === kid.parentId);
            return (
              <View key={kid.id} style={styles.rosterCard}>
                <View style={styles.rosterInfo}>
                  <Text style={styles.kidName}>{kid.name}</Text>
                  <Text style={styles.kidAge}>{currentYear - kid.yearOfBirth} years old</Text>
                  {parent && (
                    <Text style={styles.parentName}>Parent: {parent.name}</Text>
                  )}
                </View>
              </View>
            );
          })
        ) : (
          <Text style={styles.emptyText}>No players in Team A</Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Team B Roster (Under 10)</Text>
        {teamBRoster.length > 0 ? (
          teamBRoster.map(kid => {
            const parent = users.find(u => u.id === kid.parentId);
            return (
              <View key={kid.id} style={styles.rosterCard}>
                <View style={styles.rosterInfo}>
                  <Text style={styles.kidName}>{kid.name}</Text>
                  <Text style={styles.kidAge}>{currentYear - kid.yearOfBirth} years old</Text>
                  {parent && (
                    <Text style={styles.parentName}>Parent: {parent.name}</Text>
                  )}
                </View>
              </View>
            );
          })
        ) : (
          <Text style={styles.emptyText}>No players in Team B</Text>
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
                      Born {kid.yearOfBirth} • Team {kid.team}
                    </Text>
                  </View>
                ))}
                
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.closeButtonText}>Close</Text>
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
});