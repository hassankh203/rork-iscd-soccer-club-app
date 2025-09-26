import { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert
} from "react-native";
import { useAuth } from "@/hooks/auth-context";
import { User, Mail, Phone, Save } from "lucide-react-native";

export default function ProfileScreen() {
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(user?.phone || "");

  const handleSave = async () => {
    if (!name || !email || !phone) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    await updateProfile({ name, email, phone });
    setIsEditing(false);
    Alert.alert("Success", "Profile updated successfully");
  };

  const handleCancel = () => {
    setName(user?.name || "");
    setEmail(user?.email || "");
    setPhone(user?.phone || "");
    setIsEditing(false);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <User color="#fff" size={40} />
        </View>
        <Text style={styles.headerName}>{user?.name}</Text>
        <Text style={styles.headerRole}>Parent Account</Text>
      </View>

      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Full Name</Text>
          <View style={styles.inputContainer}>
            <User color="#666" size={20} />
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              editable={isEditing}
              placeholder="Enter your name"
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email</Text>
          <View style={styles.inputContainer}>
            <Mail color="#666" size={20} />
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              editable={isEditing}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholder="Enter your email"
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Phone Number</Text>
          <View style={styles.inputContainer}>
            <Phone color="#666" size={20} />
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              editable={isEditing}
              keyboardType="phone-pad"
              placeholder="Enter your phone number"
            />
          </View>
        </View>

        {isEditing ? (
          <View style={styles.buttonGroup}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={handleCancel}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.button, styles.saveButton]}
              onPress={handleSave}
            >
              <Save color="#fff" size={20} />
              <Text style={styles.saveButtonText}>Save Changes</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={[styles.button, styles.editButton]}
            onPress={() => setIsEditing(true)}
          >
            <Text style={styles.editButtonText}>Edit Profile</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.info}>
        <Text style={styles.infoTitle}>Account Information</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Account Type:</Text>
          <Text style={styles.infoValue}>Parent</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Member Since:</Text>
          <Text style={styles.infoValue}>
            {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#1B5E20',
    padding: 30,
    alignItems: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  headerName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  headerRole: {
    fontSize: 14,
    color: '#E8F5E9',
  },
  form: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 4,
    gap: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 16,
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  button: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  editButton: {
    backgroundColor: '#1B5E20',
    marginTop: 20,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: '#F5F5F5',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#1B5E20',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  info: {
    padding: 20,
    paddingTop: 0,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
  },
  infoValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
});