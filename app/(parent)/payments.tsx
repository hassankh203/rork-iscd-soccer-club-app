import { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  Pressable,
  Image
} from "react-native";
import { useAuth } from "@/hooks/auth-context";
import { useApp } from "@/hooks/app-context";
import { DollarSign, Upload, Check, Clock, X } from "lucide-react-native";
import * as ImagePicker from 'expo-image-picker';

export default function PaymentsScreen() {
  const { user } = useAuth();
  const { kids, payments, feeStructure, submitPayment } = useApp();
  const [modalVisible, setModalVisible] = useState(false);
  const [feeType, setFeeType] = useState<'yearly' | 'monthly'>('yearly');
  const [period, setPeriod] = useState(new Date().getFullYear().toString());
  const [receiptImage, setReceiptImage] = useState<string | null>(null);

  const myKids = kids.filter(k => k.parentId === user?.id);
  const myPayments = payments.filter(p => p.userId === user?.id);

  const calculateFee = () => {
    if (myKids.length === 0) return 0;
    
    const firstKidFee = feeType === 'yearly' 
      ? feeStructure.yearlyFirstKid 
      : feeStructure.monthlyFirstKid;
    
    const additionalFee = feeType === 'yearly'
      ? feeStructure.yearlyAdditional
      : feeStructure.monthlyAdditional;
    
    return firstKidFee + (additionalFee * (myKids.length - 1));
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      setReceiptImage(result.assets[0].uri);
    }
  };

  const handleSubmitPayment = async () => {
    if (!receiptImage) {
      Alert.alert("Error", "Please upload a payment receipt");
      return;
    }

    await submitPayment({
      userId: user?.id || '',
      kidIds: myKids.map(k => k.id),
      amount: calculateFee(),
      feeType,
      period,
      receiptUrl: receiptImage,
    });

    Alert.alert("Success", "Payment submitted for verification");
    setModalVisible(false);
    setReceiptImage(null);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return <Check color="#4CAF50" size={20} />;
      case 'pending':
        return <Clock color="#FF9800" size={20} />;
      case 'rejected':
        return <X color="#F44336" size={20} />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified':
        return '#4CAF50';
      case 'pending':
        return '#FF9800';
      case 'rejected':
        return '#F44336';
      default:
        return '#666';
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.feeStructure}>
        <Text style={styles.sectionTitle}>Current Fee Structure</Text>
        <View style={styles.feeCard}>
          <View style={styles.feeRow}>
            <Text style={styles.feeLabel}>Yearly - First Kid:</Text>
            <Text style={styles.feeAmount}>${feeStructure.yearlyFirstKid}</Text>
          </View>
          <View style={styles.feeRow}>
            <Text style={styles.feeLabel}>Yearly - Additional Kids:</Text>
            <Text style={styles.feeAmount}>${feeStructure.yearlyAdditional}</Text>
          </View>
          <View style={styles.feeRow}>
            <Text style={styles.feeLabel}>Monthly - First Kid:</Text>
            <Text style={styles.feeAmount}>${feeStructure.monthlyFirstKid}</Text>
          </View>
          <View style={styles.feeRow}>
            <Text style={styles.feeLabel}>Monthly - Additional Kids:</Text>
            <Text style={styles.feeAmount}>${feeStructure.monthlyAdditional}</Text>
          </View>
        </View>
      </View>

      <View style={styles.yourFees}>
        <Text style={styles.sectionTitle}>Your Fees ({myKids.length} kids)</Text>
        <View style={styles.feeCalculation}>
          <View style={styles.calculationRow}>
            <Text style={styles.calculationLabel}>Yearly Total:</Text>
            <Text style={styles.calculationAmount}>
              ${myKids.length > 0 
                ? feeStructure.yearlyFirstKid + (feeStructure.yearlyAdditional * (myKids.length - 1))
                : 0}
            </Text>
          </View>
          <View style={styles.calculationRow}>
            <Text style={styles.calculationLabel}>Monthly Total:</Text>
            <Text style={styles.calculationAmount}>
              ${myKids.length > 0
                ? feeStructure.monthlyFirstKid + (feeStructure.monthlyAdditional * (myKids.length - 1))
                : 0}
            </Text>
          </View>
        </View>
      </View>

      <TouchableOpacity
        style={styles.submitButton}
        onPress={() => setModalVisible(true)}
        disabled={myKids.length === 0}
      >
        <Upload color="#fff" size={20} />
        <Text style={styles.submitButtonText}>Submit Payment</Text>
      </TouchableOpacity>

      <View style={styles.paymentHistory}>
        <Text style={styles.sectionTitle}>Payment History</Text>
        {myPayments.length > 0 ? (
          myPayments.map(payment => (
            <View key={payment.id} style={styles.paymentCard}>
              <View style={styles.paymentHeader}>
                <View style={styles.paymentInfo}>
                  <Text style={styles.paymentType}>
                    {payment.feeType === 'yearly' ? 'Yearly' : 'Monthly'} Fee
                  </Text>
                  <Text style={styles.paymentPeriod}>{payment.period}</Text>
                </View>
                <View style={styles.paymentStatus}>
                  {getStatusIcon(payment.status)}
                  <Text style={[styles.statusText, { color: getStatusColor(payment.status) }]}>
                    {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                  </Text>
                </View>
              </View>
              <View style={styles.paymentDetails}>
                <Text style={styles.paymentAmount}>${payment.amount}</Text>
                <Text style={styles.paymentDate}>
                  Submitted: {new Date(payment.submittedAt).toLocaleDateString()}
                </Text>
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>No payment history yet</Text>
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
            <Text style={styles.modalTitle}>Submit Payment</Text>
            
            <View style={styles.feeTypeSelector}>
              <TouchableOpacity
                style={[styles.feeTypeButton, feeType === 'yearly' && styles.selectedFeeType]}
                onPress={() => setFeeType('yearly')}
              >
                <Text style={[styles.feeTypeText, feeType === 'yearly' && styles.selectedFeeTypeText]}>
                  Yearly
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.feeTypeButton, feeType === 'monthly' && styles.selectedFeeType]}
                onPress={() => setFeeType('monthly')}
              >
                <Text style={[styles.feeTypeText, feeType === 'monthly' && styles.selectedFeeTypeText]}>
                  Monthly
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.modalLabel}>Period: {period}</Text>
            
            <View style={styles.totalAmount}>
              <Text style={styles.totalLabel}>Total Amount:</Text>
              <Text style={styles.totalValue}>${calculateFee()}</Text>
            </View>

            <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
              <Upload color="#1B5E20" size={24} />
              <Text style={styles.uploadText}>Upload Receipt</Text>
            </TouchableOpacity>

            {receiptImage && (
              <Image source={{ uri: receiptImage }} style={styles.receiptPreview} />
            )}

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setModalVisible(false);
                  setReceiptImage(null);
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleSubmitPayment}
              >
                <Text style={styles.confirmButtonText}>Submit</Text>
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
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  feeStructure: {
    padding: 20,
  },
  feeCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
  },
  feeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  feeLabel: {
    fontSize: 14,
    color: '#666',
  },
  feeAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1B5E20',
  },
  yourFees: {
    padding: 20,
    paddingTop: 0,
  },
  feeCalculation: {
    backgroundColor: '#E8F5E9',
    padding: 16,
    borderRadius: 12,
  },
  calculationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  calculationLabel: {
    fontSize: 16,
    color: '#333',
  },
  calculationAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1B5E20',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1B5E20',
    margin: 20,
    marginTop: 0,
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  paymentHistory: {
    padding: 20,
    paddingTop: 0,
  },
  paymentCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  paymentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  paymentInfo: {
    flex: 1,
  },
  paymentType: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  paymentPeriod: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  paymentStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  paymentDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  paymentAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1B5E20',
  },
  paymentDate: {
    fontSize: 12,
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
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  feeTypeSelector: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  feeTypeButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
  },
  selectedFeeType: {
    backgroundColor: '#1B5E20',
  },
  feeTypeText: {
    fontSize: 16,
    color: '#666',
  },
  selectedFeeTypeText: {
    color: '#fff',
    fontWeight: '600',
  },
  modalLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  totalAmount: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#E8F5E9',
    borderRadius: 8,
    marginBottom: 20,
  },
  totalLabel: {
    fontSize: 16,
    color: '#333',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1B5E20',
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderWidth: 2,
    borderColor: '#1B5E20',
    borderRadius: 8,
    borderStyle: 'dashed',
    gap: 8,
    marginBottom: 16,
  },
  uploadText: {
    color: '#1B5E20',
    fontSize: 16,
    fontWeight: '600',
  },
  receiptPreview: {
    width: '100%',
    height: 200,
    borderRadius: 8,
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
  },
  cancelButton: {
    backgroundColor: '#F5F5F5',
  },
  cancelButtonText: {
    color: '#666',
    fontWeight: '600',
  },
  confirmButton: {
    backgroundColor: '#1B5E20',
  },
  confirmButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});