import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StatusBar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import { sharedStyles } from './HomeScreen';

const BILLS_STORAGE_KEY = 'recurring_bills';

// Add formatCurrency helper function
const formatCurrency = (amount) => {
  // Convert to float and fix to 2 decimal places
  const fixedAmount = parseFloat(amount).toFixed(2);
  // Format with commas for thousands
  return parseFloat(fixedAmount).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

const BillsScreen = () => {
  const [bills, setBills] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [intervalModalVisible, setIntervalModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [newBill, setNewBill] = useState({
    id: '',
    name: '',
    amount: '',
    dueDate: '',
    interval: 'monthly',
    duration: 'indefinite',
    occurrences: '1',
    category: 'utilities',
    notes: ''
  });
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);

  // Intervals configuration
  const intervals = [
    { id: 'monthly', label: 'Monthly', description: 'Every month' },
    { id: 'bimonthly', label: 'Bimonthly', description: 'Every 2 months' },
    { id: 'quarterly', label: 'Quarterly', description: 'Every 3 months' },
    { id: 'semiannual', label: 'Semi-annual', description: 'Every 6 months' },
    { id: 'annual', label: 'Annual', description: 'Every year' }
  ];

  // Validate if form is complete
  const isFormValid = () => {
    return (
      newBill.name.trim() !== '' &&
      parseFloat(newBill.amount) > 0 &&
      newBill.dueDate !== ''
    );
  };

  // Categories with icons and colors
  const categories = [
    { id: 'utilities', icon: 'flash', label: 'Utilities', color: '#FF9500' },
    { id: 'rent', icon: 'home', label: 'Rent', color: '#5856D6' },
    { id: 'internet', icon: 'wifi', label: 'Internet', color: '#007AFF' },
    { id: 'phone', icon: 'phone-portrait', label: 'Phone', color: '#34C759' },
    { id: 'insurance', icon: 'shield-checkmark', label: 'Insurance', color: '#5F9EA0' },
    { id: 'subscription', icon: 'repeat', label: 'Subscription', color: '#FF2D55' },
    { id: 'education', icon: 'school', label: 'Education', color: '#AF52DE' },
    { id: 'healthcare', icon: 'medical', label: 'Healthcare', color: '#32ADE6' },
    { id: 'others', icon: 'ellipsis-horizontal', label: 'Others', color: '#8E8E93' }
  ];

  // Load bills from storage
  useEffect(() => {
    loadBills();
  }, []);

  const loadBills = async () => {
    try {
      const savedBills = await AsyncStorage.getItem(BILLS_STORAGE_KEY);
      if (savedBills) {
        setBills(JSON.parse(savedBills));
      } else {
        setBills([]); // Set default empty array if no bills exist
      }
    } catch (error) {
      console.error('Error loading bills:', error);
      setBills([]); // Set default empty array on error
    }
  };

  const saveBills = async (updatedBills) => {
    try {
      await AsyncStorage.setItem(BILLS_STORAGE_KEY, JSON.stringify(updatedBills));
    } catch (error) {
      console.error('Error saving bills:', error);
    }
  };

  const editBill = (bill) => {
    setIsEditing(true);
    setNewBill({
      ...bill,
      amount: bill.amount.toString()
    });
    setModalVisible(true);
  };

  const updateBill = () => {
    if (!isFormValid()) {
      Alert.alert('Missing Information', 'Please fill in all required fields');
      return;
    }

    const amountValue = parseFloat(newBill.amount);
    if (isNaN(amountValue) || amountValue <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount');
      return;
    }

    const dueDateValue = parseInt(newBill.dueDate);
    if (isNaN(dueDateValue) || dueDateValue < 1 || dueDateValue > 31) {
      Alert.alert('Invalid Due Date', 'Please enter a day between 1 and 31');
      return;
    }

    const updatedBills = bills.map(bill => 
      bill.id === newBill.id 
        ? { ...newBill, amount: amountValue, dueDate: dueDateValue }
        : bill
    );

    setBills(updatedBills);
    saveBills(updatedBills);
    setModalVisible(false);
    resetNewBill();
    setIsEditing(false);
  };

  const addBill = () => {
    if (!isFormValid()) {
      Alert.alert('Missing Information', 'Please fill in all required fields');
      return;
    }

    const amountValue = parseFloat(newBill.amount);
    if (isNaN(amountValue) || amountValue <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount');
      return;
    }

    const dueDateValue = parseInt(newBill.dueDate);
    if (isNaN(dueDateValue) || dueDateValue < 1 || dueDateValue > 31) {
      Alert.alert('Invalid Due Date', 'Please enter a day between 1 and 31');
      return;
    }

    const bill = {
      id: Date.now().toString(),
      ...newBill,
      amount: amountValue,
      dueDate: dueDateValue,
      createdAt: new Date().toISOString()
    };

    const updatedBills = [...bills, bill];
    setBills(updatedBills);
    saveBills(updatedBills);
    setModalVisible(false);
    resetNewBill();
  };

  const confirmDeleteExpense = (bill) => {
    setSelectedExpense(bill);
    setDeleteModalVisible(true);
  };

  const deleteBill = () => {
    if (selectedExpense) {
      const updatedBills = bills.filter(bill => bill.id !== selectedExpense.id);
      setBills(updatedBills);
      saveBills(updatedBills);
      setSelectedExpense(null);
      setDeleteModalVisible(false);
    }
  };

  const resetNewBill = () => {
    setNewBill({
      id: '',
      name: '',
      amount: '0',
      dueDate: '',
      interval: 'monthly',
      duration: 'indefinite',
      occurrences: '1',
      category: 'utilities',
      notes: ''
    });
    setIsEditing(false);
  };

  const handleAmountChange = (text) => {
    // Remove any non-numeric characters except decimal point
    const cleanedText = text.replace(/[^0-9.]/g, '');
    
    // Ensure only one decimal point
    const parts = cleanedText.split('.');
    if (parts.length > 2) {
      return;
    }
    
    // Limit decimal places to 2
    if (parts[1] && parts[1].length > 2) {
      return;
    }
    
    setNewBill(prev => ({
      ...prev,
      amount: cleanedText
    }));
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const day = selectedDate.getDate();
      setNewBill({ ...newBill, dueDate: day.toString() });
    }
  };

  const getCategoryDetails = (categoryId) => {
    return categories.find(cat => cat.id === categoryId) || categories[0];
  };

  const getBillIcon = (category) => {
    const categoryDetails = categories.find(cat => cat.id === category);
    return {
      name: categoryDetails?.icon || 'document',
      color: categoryDetails?.color || '#5F9EA0'
    };
  };

  const getDueDateText = (dueDate) => {
    return `Due on the ${dueDate}${getDayOfMonthSuffix(dueDate)}`;
  };

  const getDayOfMonthSuffix = (day) => {
    if (day >= 11 && day <= 13) return 'th';
    switch (day % 10) {
      case 1: return 'st';
      case 2: return 'nd';
      case 3: return 'rd';
      default: return 'th';
    }
  };

  const getNextDueDate = (dueDate, duration) => {
    const today = new Date();
    const thisMonth = today.getMonth();
    const thisYear = today.getFullYear();
    
    let nextDue = new Date(thisYear, thisMonth, dueDate);
    
    // If the due date has passed this month, move to next occurrence
    if (nextDue < today) {
      switch (duration) {
        case 'monthly':
          nextDue.setMonth(thisMonth + 1);
          break;
        case 'quarterly':
          nextDue.setMonth(thisMonth + 3);
          break;
        case 'annually':
          nextDue.setFullYear(thisYear + 1);
          break;
      }
    }
    
    return nextDue;
  };

  const renderDatePicker = () => {
    if (Platform.OS === 'web') {
      return (
        <View style={styles.webDatePickerContainer}>
          <label htmlFor="webDatePicker" style={{
            position: 'relative',
            width: '100%',
            cursor: 'pointer',
            display: 'block'
          }}>
            <View style={styles.datePickerButton}>
              <Text style={styles.datePickerButtonText}>
                {newBill.dueDate ? getDueDateText(parseInt(newBill.dueDate)) : 'Select due date'}
              </Text>
              <Ionicons name="calendar" size={20} color="#5F9EA0" />
            </View>
            <input
              id="webDatePicker"
              type="date"
              style={{
                position: 'absolute',
                opacity: 0,
                width: '100%',
                height: '100%',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                cursor: 'pointer',
                zIndex: 1,
                margin: 0,
                padding: 0
              }}
              onChange={(e) => {
                const selectedDate = new Date(e.target.value);
                const day = selectedDate.getDate();
                setNewBill({ ...newBill, dueDate: day.toString() });
              }}
            />
          </label>
        </View>
      );
    }

    return (
      <>
        <TouchableOpacity
          style={styles.datePickerButton}
          onPress={() => setShowDatePicker(true)}
        >
          <Text style={styles.datePickerButtonText}>
            {newBill.dueDate ? getDueDateText(parseInt(newBill.dueDate)) : 'Select due date'}
          </Text>
          <Ionicons name="calendar" size={20} color="#5F9EA0" />
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={new Date()}
            mode="date"
            display="default"
            onChange={handleDateChange}
          />
        )}
      </>
    );
  };

  const getIntervalDetails = (intervalId) => {
    return intervals.find(int => int.id === intervalId) || intervals[0];
  };

  const handleDurationChange = (text) => {
    // Only allow numbers and ensure it's positive
    const sanitizedText = text.replace(/[^0-9]/g, '');
    if (sanitizedText === '' || parseInt(sanitizedText) > 0) {
      setNewBill({ ...newBill, occurrences: sanitizedText });
    }
  };

  const renderBillsList = () => {
    const filteredBills = bills.filter(bill =>
      bill.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bill.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
      <ScrollView style={styles.billsList}>
        {filteredBills.map(bill => {
          const nextDueDate = getNextDueDate(bill.dueDate, bill.duration);
          const daysUntilDue = Math.ceil((nextDueDate - new Date()) / (1000 * 60 * 60 * 24));
          const billIcon = getBillIcon(bill.category);
          
          return (
            <View key={bill.id} style={styles.billItem}>
              <View style={styles.billContent}>
                <View style={[styles.billIcon, { backgroundColor: billIcon.color }]}>
                  <Ionicons name={billIcon.name} size={24} color="white" />
                </View>
                <View style={styles.billDetails}>
                  <Text style={styles.billName}>{bill.name}</Text>
                  <Text style={styles.billCategory}>
                    {bill.category.charAt(0).toUpperCase() + bill.category.slice(1)} • {bill.duration}
                  </Text>
                  <Text style={styles.dueDate}>{getDueDateText(bill.dueDate)}</Text>
                  {daysUntilDue <= 7 && (
                    <Text style={[styles.dueSoon, { color: daysUntilDue <= 3 ? '#FF3B30' : '#FF9500' }]}>
                      Due in {daysUntilDue} days
                    </Text>
                  )}
                </View>
                <View style={styles.billAmount}>
                  <Text style={styles.amount}>₱{formatCurrency(bill.amount)}</Text>
                  <View style={styles.actionButtons}>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.editButton]}
                      onPress={() => editBill(bill)}
                    >
                      <Ionicons name="pencil" size={18} color="#5F9EA0" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.deleteButton]}
                      onPress={() => confirmDeleteExpense(bill)}
                    >
                      <Ionicons name="trash-outline" size={18} color="#FF3B30" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          );
        })}
      </ScrollView>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar 
        barStyle="dark-content"
        backgroundColor="#ffffff"
        translucent={true}
      />
      <View style={[styles.mainContainer, { paddingTop: StatusBar.currentHeight }]}>
        <View style={sharedStyles.screenHeader}>
          <View style={sharedStyles.headerContent}>
            <View style={styles.headerIconPlaceholder} />
            <Text style={sharedStyles.screenTitle}>Recurring Bills</Text>
            <View style={styles.headerIconPlaceholder} />
          </View>
        </View>

        <ScrollView style={styles.container}>
          <View style={styles.header}>
            <View style={styles.searchContainer}>
              <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search bills..."
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Ionicons name="close-circle" size={20} color="#999" />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {bills.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="document-outline" size={48} color="#999" />
              <Text style={styles.emptyStateText}>No recurring bills added yet</Text>
              <Text style={styles.emptyStateSubtext}>Add your first bill to start tracking</Text>
            </View>
          ) : (
            renderBillsList()
          )}
        </ScrollView>

        {/* Add Floating Action Button */}
        <TouchableOpacity 
          style={styles.addButton} 
          onPress={() => setModalVisible(true)}
        >
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(false);
          resetNewBill();
        }}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalContainer}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {isEditing ? 'Edit Bill' : 'Add Recurring Bill'}
              </Text>
              <TouchableOpacity 
                onPress={() => {
                  setModalVisible(false);
                  resetNewBill();
                }}
              >
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScroll}>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Bill Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter bill name"
                  value={newBill.name}
                  onChangeText={(text) => setNewBill({...newBill, name: text})}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Amount (₱)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="0.00"
                  keyboardType="numeric"
                  value={newBill.amount}
                  onChangeText={handleAmountChange}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Due Date (Day of month)</Text>
                {renderDatePicker()}
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Billing Interval</Text>
                <TouchableOpacity
                  style={styles.categorySelector}
                  onPress={() => setIntervalModalVisible(true)}
                >
                  <View style={styles.selectedCategory}>
                    <Text style={styles.selectedCategoryText}>
                      {getIntervalDetails(newBill.interval).label}
                    </Text>
                  </View>
                  <Ionicons name="chevron-down" size={20} color="#666" />
                </TouchableOpacity>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Duration</Text>
                <View style={styles.durationContainer}>
                  <TouchableOpacity
                    style={[
                      styles.durationOption,
                      newBill.duration === 'indefinite' && styles.durationSelected
                    ]}
                    onPress={() => setNewBill({...newBill, duration: 'indefinite'})}
                  >
                    <Text style={[
                      styles.durationText,
                      newBill.duration === 'indefinite' && styles.durationTextSelected
                    ]}>
                      Indefinite
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.durationOption,
                      newBill.duration !== 'indefinite' && styles.durationSelected
                    ]}
                    onPress={() => setNewBill({...newBill, duration: 'fixed'})}
                  >
                    <Text style={[
                      styles.durationText,
                      newBill.duration !== 'indefinite' && styles.durationTextSelected
                    ]}>
                      Fixed Duration
                    </Text>
                  </TouchableOpacity>
                </View>
                {newBill.duration !== 'indefinite' && (
                  <View style={styles.occurrencesContainer}>
                    <TextInput
                      style={styles.occurrencesInput}
                      placeholder="Number of times"
                      keyboardType="numeric"
                      value={newBill.occurrences}
                      onChangeText={handleDurationChange}
                    />
                    <Text style={styles.occurrencesLabel}>
                      {getIntervalDetails(newBill.interval).label.toLowerCase()} payments
                    </Text>
                  </View>
                )}
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Category</Text>
                <TouchableOpacity
                  style={styles.categorySelector}
                  onPress={() => setCategoryModalVisible(true)}
                >
                  <View style={styles.selectedCategory}>
                    <View style={[styles.categoryIcon, { backgroundColor: getCategoryDetails(newBill.category).color }]}>
                      <Ionicons name={getCategoryDetails(newBill.category).icon} size={20} color="white" />
                    </View>
                    <Text style={styles.selectedCategoryText}>
                      {getCategoryDetails(newBill.category).label}
                    </Text>
                  </View>
                  <Ionicons name="chevron-down" size={20} color="#666" />
                </TouchableOpacity>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Notes (Optional)</Text>
                <TextInput
                  style={[styles.input, styles.notesInput]}
                  placeholder="Add any additional notes"
                  multiline
                  value={newBill.notes}
                  onChangeText={(text) => setNewBill({...newBill, notes: text})}
                />
              </View>
            </ScrollView>

            <TouchableOpacity 
              style={[
                styles.saveButton,
                !isFormValid() && styles.saveButtonDisabled
              ]} 
              onPress={isEditing ? updateBill : addBill}
              disabled={!isFormValid()}
            >
              <Text style={[
                styles.saveButtonText,
                !isFormValid() && styles.saveButtonTextDisabled
              ]}>
                {isEditing ? 'Update Bill' : 'Add Bill'}
              </Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Category Selection Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={categoryModalVisible}
        onRequestClose={() => setCategoryModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Category</Text>
              <TouchableOpacity onPress={() => setCategoryModalVisible(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
           
            <ScrollView style={styles.categoryList}>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={styles.categoryOption}
                  onPress={() => {
                    setNewBill({...newBill, category: category.id});
                    setCategoryModalVisible(false);
                  }}
                >
                  <View style={[styles.categoryIcon, { backgroundColor: category.color }]}>
                    <Ionicons name={category.icon} size={22} color="white" />
                  </View>
                  <Text style={styles.categoryOptionText}>
                    {category.label}
                  </Text>
                  {newBill.category === category.id && (
                    <Ionicons name="checkmark" size={22} color="#5F9EA0" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Interval Selection Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={intervalModalVisible}
        onRequestClose={() => setIntervalModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Interval</Text>
              <TouchableOpacity onPress={() => setIntervalModalVisible(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
           
            <ScrollView style={styles.categoryList}>
              {intervals.map((interval) => (
                <TouchableOpacity
                  key={interval.id}
                  style={styles.categoryOption}
                  onPress={() => {
                    setNewBill({...newBill, interval: interval.id});
                    setIntervalModalVisible(false);
                  }}
                >
                  <View style={styles.intervalOptionContent}>
                    <Text style={styles.categoryOptionText}>
                      {interval.label}
                    </Text>
                    <Text style={styles.intervalDescription}>
                      {interval.description}
                    </Text>
                  </View>
                  {newBill.interval === interval.id && (
                    <Ionicons name="checkmark" size={22} color="#5F9EA0" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="slide"
        transparent={true}
        visible={deleteModalVisible}
        onRequestClose={() => setDeleteModalVisible(false)}
      >
        <View style={styles.deleteModalContainer}>
          <View style={styles.deleteModalContent}>
            <View style={styles.deleteModalHeader}>
              <Text style={styles.deleteModalTitle}>Delete Bill</Text>
              <TouchableOpacity onPress={() => setDeleteModalVisible(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            <Text style={styles.deleteModalText}>
              Are you sure you want to delete this bill?
            </Text>
            <View style={styles.deleteModalButtons}>
              <TouchableOpacity
                style={styles.deleteModalButton}
                onPress={deleteBill}
              >
                <Text style={styles.deleteModalButtonText}>Delete</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteModalButton}
                onPress={() => setDeleteModalVisible(false)}
              >
                <Text style={styles.deleteModalButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  mainContainer: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eaeaea',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  billsList: {
    flex: 1,
  },
  billItem: {
    backgroundColor: 'white',
    marginHorizontal: 15,
    marginTop: 15,
    borderRadius: 12,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  billContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  billIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  billDetails: {
    flex: 1,
  },
  billName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  billCategory: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  dueDate: {
    fontSize: 14,
    color: '#5F9EA0',
    fontWeight: '500',
  },
  dueSoon: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  billAmount: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
    borderRadius: 6,
    borderWidth: 1,
    cursor: 'pointer',
  },
  editButton: {
    borderColor: '#5F9EA0',
  },
  deleteButton: {
    borderColor: '#FF3B30',
  },
  addButton: {
    position: 'absolute',
    bottom: 25,
    right: 25,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#5F9EA0',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    minHeight: 400,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  modalScroll: {
    maxHeight: '70%',
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#333',
  },
  notesInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  webDatePickerContainer: {
    position: 'relative',
    width: '100%',
  },
  datePickerButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: 'white',
  },
  datePickerButtonText: {
    fontSize: 16,
    color: '#333',
  },
  durationContainer: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  durationOption: {
    flex: 1,
    padding: 10,
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    alignItems: 'center',
  },
  durationSelected: {
    backgroundColor: '#5F9EA0',
    borderColor: '#5F9EA0',
  },
  durationText: {
    color: '#666',
    fontSize: 14,
  },
  durationTextSelected: {
    color: 'white',
    fontWeight: '600',
  },
  occurrencesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  occurrencesInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    width: 120,
    marginRight: 10,
  },
  occurrencesLabel: {
    flex: 1,
    fontSize: 14,
    color: '#666',
  },
  intervalOptionContent: {
    flex: 1,
  },
  intervalDescription: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  categorySelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  selectedCategory: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  selectedCategoryText: {
    fontSize: 16,
    color: '#333',
  },
  categoryList: {
    maxHeight: 400,
  },
  categoryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eaeaea',
  },
  categoryOptionText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
    marginLeft: 12,
  },
  saveButton: {
    backgroundColor: '#5F9EA0',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  saveButtonDisabled: {
    backgroundColor: '#cccccc',
  },
  saveButtonTextDisabled: {
    color: '#ffffff80',
  },
  headerIconPlaceholder: {
    width: 40,
    height: 40,
  },
  deleteModalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  deleteModalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    maxWidth: '80%',
    width: '100%',
  },
  deleteModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  deleteModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  deleteModalText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  deleteModalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  deleteModalButton: {
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#5F9EA0',
    alignItems: 'center',
  },
  deleteModalButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default BillsScreen; 