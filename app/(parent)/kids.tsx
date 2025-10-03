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
  Pressable
} from "react-native";
import { useLocalAuth } from "@/hooks/local-auth-context";
import { useLocalData } from "@/hooks/local-data-context";
import { Plus, Users, Calendar, Edit2, Trash2 } from "lucide-react-native";

export default function KidsScreen() {
  const { user } = useLocalAuth();
  const { getKids } = useLocalData();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingKid, setEditingKid] = useState<string | null>(null);
  const [kidName, setKidName] = useState("");
  const [age, setAge] = useState("");
  const [position, setPosition] = useState("");
  const [kids, setKids] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const loadKids = async () => {
    try {
      setLoading(true);
      const kidsData = await getKids();
      setKids(kidsData);
    } catch (error) {
      console.error('Failed to load kids:', error);
      Alert.alert('Error', 'Failed to load kids');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadKids();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const myKids = kids.filter(k => k.parentId === user?.id);
  
  const teamARoster = kids.filter(k => k.age && k.age >= 10);
  const teamBRoster = kids.filter(k => k.age && k.age < 10);

  const handleAddKid = async () => {
    if (!kidName || !age) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    const ageNum = parseInt(age);
    if (isNaN(ageNum) || ageNum < 4 || ageNum > 18) {
      Alert.alert("Error", "Please enter a valid age (4-18)");
      return;
    }

    const autoTeam = ageNum >= 10 ? 'A' : 'B';

    try {
      setLoading(true);
      const { createKid, updateKid } = await import('@/lib/database');
      
      if (editingKid) {
        await updateKid(editingKid, {
          name: kidName,
          age: ageNum,
          team: autoTeam,
          position: position || undefined
        });
      } else {
        await createKid({
          parentId: user!.id,
          name: kidName,
          age: ageNum,
          team: autoTeam,
          position: position || undefined
        });
      }
      
      await loadKids();
      setModalVisible(false);
      setKidName("");
      setAge("");
      setPosition("");
      setEditingKid(null);
      Alert.alert('Success', editingKid ? 'Kid updated successfully' : 'Kid added successfully');
    } catch (error) {
      console.error('Failed to save kid:', error);
      Alert.alert('Error', 'Failed to save kid');
    } finally {
      setLoading(false);
    }
  };

  const handleEditKid = (kid: typeof myKids[0]) => {
    setEditingKid(kid.id);
    setKidName(kid.name);
    setAge(kid.age?.toString() || "");
    setPosition(kid.position || "");
    setModalVisible(true);
  };

  const handleDeleteKid = (kidId: string) => {
    Alert.alert(
      "Delete Kid",
      "Are you sure you want to remove this child?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive", 
          onPress: async () => {
            try {
              setLoading(true);
              const { deleteKid } = await import('@/lib/database');
              await deleteKid(kidId);
              await loadKids();
              Alert.alert('Success', 'Kid deleted successfully');
            } catch (error) {
              console.error('Failed to delete kid:', error);
              Alert.alert('Error', 'Failed to delete kid');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyText}>Loading...</Text>
      </View>
    );
  }

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
                      {kid.age} years old
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Users color="#666" size={16} />
                    <Text style={styles.detailText}>Team: {kid.team || 'Not assigned'}</Text>
                  </View>
                  {kid.position && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailText}>Position: {kid.position}</Text>
                    </View>
                  )}
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
          <View style={styles.teamHeader}>
            <Text style={styles.teamTitle}>Team A Roster</Text>
            <Text style={styles.teamSubtitle}>Ages 10+</Text>
          </View>
          {teamARoster.length > 0 ? (
            teamARoster.map(kid => (
              <View key={kid.id} style={styles.rosterItem}>
                <Text style={styles.rosterName}>{kid.name}</Text>
                <Text style={styles.rosterAge}>{kid.age} years</Text>
              </View>
            ))
          ) : (
            <Text style={styles.emptyRoster}>No players yet</Text>
          )}
        </View>

        <View style={styles.teamCard}>
          <View style={styles.teamHeader}>
            <Text style={styles.teamTitle}>Team B Roster</Text>
            <Text style={styles.teamSubtitle}>Under 10</Text>
          </View>
          {teamBRoster.length > 0 ? (
            teamBRoster.map(kid => (
              <View key={kid.id} style={styles.rosterItem}>
                <Text style={styles.rosterName}>{kid.name}</Text>
                <Text style={styles.rosterAge}>{kid.age} years</Text>
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
              placeholder="Age (e.g., 8)"
              value={age}
              onChangeText={setAge}
              keyboardType="numeric"
              maxLength={2}
            />
            
            <View style={styles.infoBox}>
              <Text style={styles.infoText}>
                Team will be automatically assigned based on age:
                {"\n"}• Team A: 10+ years old
                {"\n"}• Team B: Under 10 years old
              </Text>
            </View>
            
            <TextInput
              style={styles.modalInput}
              placeholder="Position (optional)"
              value={position}
              onChangeText={setPosition}
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setModalVisible(false);
                  setKidName("");
                  setAge("");
                  setPosition("");
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
  teamHeader: {
    marginBottom: 12,
  },
  teamTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1B5E20',
  },
  teamSubtitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  infoBox: {
    backgroundColor: '#E8F5E9',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  infoText: {
    fontSize: 13,
    color: '#1B5E20',
    lineHeight: 18,
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