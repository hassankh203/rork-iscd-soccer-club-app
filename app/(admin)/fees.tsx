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
import { useApp } from "@/hooks/app-context";
import { DollarSign, Edit2, Save, Check, Clock, X } from "lucide-react-native";

export default function FeesScreen() {
  const { feeStructure, updateFeeStructure, payments, verifyPayment } = useApp();
  const [isEditing, setIsEditing] = useState(false);
  const [yearlyFirstKid, setYearlyFirstKid] = useState(feeStructure.yearlyFirstKid.toString());
  const [yearlyAdditional, setYearlyAdditional] = useState(feeStructure.yearlyAdditional.toString());
  const [monthlyFirstKid, setMonthlyFirstKid] = useState(feeStructure.monthlyFirstKid.toString());
  const [monthlyAdditional, setMonthlyAdditional] = useState(feeStructure.monthlyAdditional.toString());

  const pendingPayments = payments.filter(p => p.status === 'pending');

  const handleSaveFees = async () => {
    const newFees = {
      yearlyFirstKid: parseInt(yearlyFirstKid) || 0,
      yearlyAdditional: parseInt(yearlyAdditional) || 0,
      monthlyFirstKid: parseInt(monthlyFirstKid) || 0,
      monthlyAdditional: parseInt(monthlyAdditional) || 0,
    };

    await updateFeeStructure(newFees);
    setIsEditing(false);
    Alert.alert("Success", "Fee structure updated successfully");
  };

  const handleVerifyPayment = async (paymentId: string) => {
    await verifyPayment(paymentId);
    Alert.alert("Success", "Payment verified successfully");
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
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Fee Structure</Text>
          {!isEditing ? (
            <TouchableOpacity onPress={() => setIsEditing(true)}>
              <Edit2 color="#D4AF37" size={20} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={handleSaveFees}>
              <Save color="#D4AF37" size={20} />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.feeCard}>
          <Text style={styles.feeCategory}>Yearly Fees</Text>
          <View style={styles.feeRow}>
            <Text style={styles.feeLabel}>First Kid:</Text>
            {isEditing ? (
              <View style={styles.inputWrapper}>
                <Text style={styles.currency}>$</Text>
                <TextInput
                  style={styles.feeInput}
                  value={yearlyFirstKid}
                  onChangeText={setYearlyFirstKid}
                  keyboardType="numeric"
                />
              </View>
            ) : (
              <Text style={styles.feeAmount}>${feeStructure.yearlyFirstKid}</Text>
            )}
          </View>
          <View style={styles.feeRow}>
            <Text style={styles.feeLabel}>Additional Kids:</Text>
            {isEditing ? (
              <View style={styles.inputWrapper}>
                <Text style={styles.currency}>$</Text>
                <TextInput
                  style={styles.feeInput}
                  value={yearlyAdditional}
                  onChangeText={setYearlyAdditional}
                  keyboardType="numeric"
                />
              </View>
            ) : (
              <Text style={styles.feeAmount}>${feeStructure.yearlyAdditional}</Text>
            )}
          </View>
        </View>

        <View style={styles.feeCard}>
          <Text style={styles.feeCategory}>Monthly Fees</Text>
          <View style={styles.feeRow}>
            <Text style={styles.feeLabel}>First Kid:</Text>
            {isEditing ? (
              <View style={styles.inputWrapper}>
                <Text style={styles.currency}>$</Text>
                <TextInput
                  style={styles.feeInput}
                  value={monthlyFirstKid}
                  onChangeText={setMonthlyFirstKid}
                  keyboardType="numeric"
                />
              </View>
            ) : (
              <Text style={styles.feeAmount}>${feeStructure.monthlyFirstKid}</Text>
            )}
          </View>
          <View style={styles.feeRow}>
            <Text style={styles.feeLabel}>Additional Kids:</Text>
            {isEditing ? (
              <View style={styles.inputWrapper}>
                <Text style={styles.currency}>$</Text>
                <TextInput
                  style={styles.feeInput}
                  value={monthlyAdditional}
                  onChangeText={setMonthlyAdditional}
                  keyboardType="numeric"
                />
              </View>
            ) : (
              <Text style={styles.feeAmount}>${feeStructure.monthlyAdditional}</Text>
            )}
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Pending Payments ({pendingPayments.length})</Text>
        {pendingPayments.length > 0 ? (
          pendingPayments.map(payment => (
            <View key={payment.id} style={styles.paymentCard}>
              <View style={styles.paymentHeader}>
                <View>
                  <Text style={styles.paymentType}>
                    {payment.feeType === 'yearly' ? 'Yearly' : 'Monthly'} Fee
                  </Text>
                  <Text style={styles.paymentPeriod}>{payment.period}</Text>
                </View>
                <Text style={styles.paymentAmount}>${payment.amount}</Text>
              </View>
              
              <View style={styles.paymentActions}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.verifyButton]}
                  onPress={() => handleVerifyPayment(payment.id)}
                >
                  <Check color="#fff" size={16} />
                  <Text style={styles.actionButtonText}>Verify</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.actionButton, styles.rejectButton]}
                >
                  <X color="#fff" size={16} />
                  <Text style={styles.actionButtonText}>Reject</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>No pending payments</Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>All Payments</Text>
        {payments.map(payment => (
          <View key={payment.id} style={styles.paymentHistoryCard}>
            <View style={styles.paymentHistoryHeader}>
              <View>
                <Text style={styles.paymentType}>
                  {payment.feeType === 'yearly' ? 'Yearly' : 'Monthly'} - {payment.period}
                </Text>
                <Text style={styles.paymentDate}>
                  {new Date(payment.submittedAt).toLocaleDateString()}
                </Text>
              </View>
              <View style={styles.paymentStatus}>
                {getStatusIcon(payment.status)}
                <Text style={[styles.statusText, { color: getStatusColor(payment.status) }]}>
                  {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                </Text>
              </View>
            </View>
            <Text style={styles.paymentHistoryAmount}>${payment.amount}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  section: {
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  feeCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  feeCategory: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1B5E20',
    marginBottom: 12,
  },
  feeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  feeLabel: {
    fontSize: 14,
    color: '#666',
  },
  feeAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currency: {
    fontSize: 16,
    color: '#333',
    marginRight: 4,
  },
  feeInput: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    borderBottomWidth: 1,
    borderBottomColor: '#D4AF37',
    paddingVertical: 4,
    paddingHorizontal: 8,
    minWidth: 60,
  },
  paymentCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#FF9800',
  },
  paymentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
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
  paymentAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1B5E20',
  },
  paymentActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  verifyButton: {
    backgroundColor: '#4CAF50',
  },
  rejectButton: {
    backgroundColor: '#F44336',
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  paymentHistoryCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  paymentHistoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  paymentDate: {
    fontSize: 12,
    color: '#999',
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
  paymentHistoryAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1B5E20',
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    padding: 40,
  },
});