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
import { Plus, Users, Calendar, Edit2, Trash2 } from "lucide-react-native";

export default function KidsScreen() {
  const { user } = useAuth();
  const { kids, addKid, updateKid, deleteKid, getTeamRoster } = useApp();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingKid, setEditingKid] = useState<string | null>(null);
  const [kidName, setKidName] = useState("");
  const [yearOfBirth, setYearOfBirth] = useState("");

  const myKids = kids.filter(k => k.parentId === user?.id);
  const teamARoster = getTeamRoster('A');
  const teamBRoster = getTeamRoster('B');

  const handleAddKid = async () => {
    if (!kidName || !yearOfBirth) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    const year = parseInt(yearOfBirth);
    if (isNaN(year) || year < 1990 || year > new Date().getFullYear()) {
      Alert.alert("Error", "Please enter a valid year of birth");
      return;
    }

    if (editingKid) {
      await updateKid(editingKid, { name: kidName, yearOfBirth: year });
    } else {
      await addKid(kidName, year);
    }

    setModalVisible(false);
    setKidName("");
    setYearOfBirth("");
    setEditingKid(null);
  };

  const handleEditKid = (kid: typeof myKids[0]) => {
    setEditingKid(kid.id);
    setKidName(kid.name);
    setYearOfBirth(kid.yearOfBirth.toString());
    setModalVisible(true);
  };

  const handleDeleteKid = (kidId: string) => {
    Alert.alert(
      "Delete Kid",
      "Are you sure you want to remove this child?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: () => deleteKid(kidId) }
      ]
    );
  };

  const currentYear = new Date().getFullYear();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Kids</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setModalVisible(true)}
        >
          <Plus color="#fff" size={20} />
          <Text style={styles.addButtonText}>Add Kid</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.kidsContainer}>
        {myKids.length > 0 ? (
          myKids.map(kid => (
            <View key={kid.id} style={styles.kidCard}>
              <View style={styles.kidInfo}>
                <Text style={styles.kidName}>{kid.name}</Text>
                <View style={styles.kidDetails}>
                  <View style={styles.detailRow}>
                    <Calendar color="#666" size={16} />
                    <Text style={styles.detailText}>
                      Born {kid.yearOfBirth} ({currentYear - kid.yearOfBirth} years old)
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Users color="#666" size={16} />
                    <Text style={styles.detailText}>Team {kid.team}</Text>
                  </View>
                </View>
              </View>
              <View style={styles.kidActions}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleEditKid(kid)}
                >
                  <Edit2 color="#1B5E20" size={18} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleDeleteKid(kid.id)}
                >
                  <Trash2 color="#FF0000" size={18} />
                </TouchableOpacity>
              </View>
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No kids registered yet</Text>
            <Text style={styles.emptySubtext}>Tap the Add Kid button to get started</Text>
          </View>
        )}
      </View>

      <View style={styles.teamsSection}>
        <Text style={styles.sectionTitle}>Team Rosters</Text>
        
        <View style={styles.teamCard}>
          <Text style={styles.teamTitle}>Team A (10+ years)</Text>
          {teamARoster.length > 0 ? (
            teamARoster.map(kid => (
              <View key={kid.id} style={styles.rosterItem}>
                <Text style={styles.rosterName}>{kid.name}</Text>
                <Text style={styles.rosterAge}>{currentYear - kid.yearOfBirth} years</Text>
              </View>
            ))
          ) : (
            <Text style={styles.emptyRoster}>No players yet</Text>
          )}
        </View>

        <View style={styles.teamCard}>
          <Text style={styles.teamTitle}>Team B (Under 10)</Text>
          {teamBRoster.length > 0 ? (
            teamBRoster.map(kid => (
              <View key={kid.id} style={styles.rosterItem}>
                <Text style={styles.rosterName}>{kid.name}</Text>
                <Text style={styles.rosterAge}>{currentYear - kid.yearOfBirth} years</Text>
              </View>
            ))
          ) : (
            <Text style={styles.emptyRoster}>No players yet</Text>
          )}
        </View>
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
            <Text style={styles.modalTitle}>
              {editingKid ? 'Edit Kid' : 'Add New Kid'}
            </Text>
            
            <TextInput
              style={styles.modalInput}
              placeholder="Child's Name"
              value={kidName}
              onChangeText={setKidName}
            />
            
            <TextInput
              style={styles.modalInput}
              placeholder="Year of Birth (e.g., 2015)"
              value={yearOfBirth}
              onChangeText={setYearOfBirth}
              keyboardType="numeric"
              maxLength={4}
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setModalVisible(false);
                  setKidName("");
                  setYearOfBirth("");
                  setEditingKid(null);
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleAddKid}
              >
                <Text style={styles.saveButtonText}>
                  {editingKid ? 'Update' : 'Add'}
                </Text>
              </TouchableOpacity>
            </View>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1B5E20',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 8,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  kidsContainer: {
    padding: 20,
  },
  kidCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  kidInfo: {
    flex: 1,
  },
  kidName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  kidDetails: {
    gap: 4,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
  },
  kidActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    padding: 8,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
  },
  teamsSection: {
    padding: 20,
    paddingTop: 0,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  teamCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  teamTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1B5E20',
    marginBottom: 12,
  },
  rosterItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  rosterName: {
    fontSize: 14,
    color: '#333',
  },
  rosterAge: {
    fontSize: 14,
    color: '#666',
  },
  emptyRoster: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
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
  modalInput: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  modalButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F5F5F5',
  },
  cancelButtonText: {
    color: '#666',
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#1B5E20',
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});