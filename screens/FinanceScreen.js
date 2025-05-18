import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Modal, KeyboardAvoidingView, Platform, Alert, SafeAreaView, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useBudget } from './BudgetContext';
import { useNavigation } from '@react-navigation/native';
import { sharedStyles } from './HomeScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

const ExpenseTrackerScreen = () => {
  const { 
    monthlyData, 
    selectedMonth,
    currentBudget,
    updateMonthlyExpenses,
    switchMonth,
    resetToCurrentMonth,
    getSelectedMonthData,
    getPreviousMonthData,
    updateBudget,
    updateCategoryBudgets
  } = useBudget();

  const navigation = useNavigation();

  const isCurrentMonth = selectedMonth === new Date().toISOString().slice(0, 7);

  const [searchQuery, setSearchQuery] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [budgetModalVisible, setBudgetModalVisible] = useState(false);
  const [savingsModalVisible, setSavingsModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [budget, setBudget] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [currentSavings, setCurrentSavings] = useState(0);
  const [spendingByCategory, setSpendingByCategory] = useState({});
  const [newExpense, setNewExpense] = useState({
    name: '',
    amount: '0',
    category: 'groceries',
    date: new Date().toISOString().split('T')[0]
  });
 
  const [tempBudget, setTempBudget] = useState(budget.toString());
  const [previewBudget, setPreviewBudget] = useState(budget);
 
  const [savingsGoal, setSavingsGoal] = useState(0);
  const [tempSavingsGoal, setTempSavingsGoal] = useState(savingsGoal.toString());
 
  const [categoryBudgets, setCategoryBudgets] = useState({
    groceries: 0,
    utilities: 0,
    transportation: 0,
    food: 0,
    entertainment: 0,
    shopping: 0
  });
 
  const [tempCategoryBudgets, setTempCategoryBudgets] = useState({...categoryBudgets});
 
  const remainingBudget = budget - totalExpenses;
 
  const savingsProgress = (currentSavings / savingsGoal) * 100;
 
  const formatDate = (dateString) => {
    const options = { month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };
 
  const getCategoryIcon = (category) => {
    switch(category) {
      case 'groceries': return 'cart';
      case 'utilities': return 'flash';
      case 'transportation': return 'bus';
      case 'food': return 'restaurant';
      case 'entertainment': return 'film';
      case 'shopping': return 'shirt';
      default: return 'cash';
    }
  };
 
  const getCategoryColor = (category) => {
    switch(category) {
      case 'groceries': return '#5F9EA0';
      case 'utilities': return '#FF9500';
      case 'transportation': return '#007AFF';
      case 'food': return '#FFD700';
      case 'entertainment': return '#FF2D55';
      case 'shopping': return '#4CD964';
      default: return '#888888';
    }
  };
 
  const getCategoryName = (category) => {
    return category.charAt(0).toUpperCase() + category.slice(1);
  };
 
  useEffect(() => {
    // Load initial data without resetting the month
    const currentData = getSelectedMonthData();
    if (currentData) {
      setBudget(currentData.budget || 0);
      const safeExpenses = Array.isArray(currentData.expenses) ? currentData.expenses : [];
      setExpenses(safeExpenses);
      setCategoryBudgets(currentData.categoryBudgets || {
        groceries: 0,
        utilities: 0,
        transportation: 0,
        food: 0,
        entertainment: 0,
        shopping: 0
      });
      setSavingsGoal(currentData.savingsGoal || 0);
    } else {
      // Set default values if no data exists
      setBudget(0);
      setExpenses([]);
      setCategoryBudgets({
        groceries: 0,
        utilities: 0,
        transportation: 0,
        food: 0,
        entertainment: 0,
        shopping: 0
      });
      setSavingsGoal(0);
    }
  }, [selectedMonth, getSelectedMonthData]);

  // Add a cleanup effect for when the component unmounts
  useEffect(() => {
    return () => {
      // Only reset when completely leaving the finance screen
      if (navigation.getState().index === 0) {
        resetToCurrentMonth();
      }
    };
  }, [navigation, resetToCurrentMonth]);

  // Calculate total expenses and spending by category
  useEffect(() => {
    const total = Array.isArray(expenses) ? expenses.reduce((sum, expense) => sum + (expense?.amount || 0), 0) : 0;
    setTotalExpenses(total);
    setCurrentSavings(Math.max(0, budget - total));

    // Calculate spending by category
    const categorySpending = {};
    if (Array.isArray(expenses)) {
      expenses.forEach(expense => {
        if (expense?.category && expense?.amount) {
          if (!categorySpending[expense.category]) {
            categorySpending[expense.category] = 0;
          }
          categorySpending[expense.category] += expense.amount;
        }
      });
    }
    setSpendingByCategory(categorySpending);
  }, [expenses, budget]);

  const addExpense = () => {
    if (!newExpense.name || !newExpense.amount) {
      Alert.alert('Missing Information', 'Please fill in all required fields');
      return;
    }
   
    const amountValue = parseFloat(newExpense.amount);
    if (isNaN(amountValue)) {
      Alert.alert('Invalid Amount', 'Please enter a valid number');
      return;
    }
   
    const expense = {
      id: Array.isArray(expenses) ? expenses.length + 1 : 1,
      name: newExpense.name,
      amount: amountValue,
      category: newExpense.category,
      date: newExpense.date,
      month: selectedMonth
    };
   
    const updatedExpenses = Array.isArray(expenses) ? [expense, ...expenses] : [expense];
    setExpenses(updatedExpenses);
    updateMonthlyExpenses(updatedExpenses);
   
    setNewExpense({
      name: '',
      amount: '',
      category: 'groceries',
      date: new Date().toISOString().split('T')[0]
    });
    setModalVisible(false);
  };

  const deleteExpense = () => {
    if (!isCurrentMonth) {
      Alert.alert('Error', 'Cannot modify expenses from past months');
      return;
    }
    
    if (selectedExpense) {
      const updatedExpenses = expenses.filter(expense => expense.id !== selectedExpense.id);
      setExpenses(updatedExpenses);
      updateMonthlyExpenses(updatedExpenses);
      setSelectedExpense(null);
      setDeleteModalVisible(false);
    }
  };
 
  useEffect(() => {
    if (budgetModalVisible) {
      setPreviewBudget(budget);
      setTempBudget(budget.toString());
    }
  }, [budgetModalVisible, budget]); // Add budget to dependencies

  const calculateRemainingCategoryBudget = () => {
    const totalAllocated = Object.values(tempCategoryBudgets).reduce((sum, value) => {
      const budgetValue = parseFloat(value);
      return sum + (isNaN(budgetValue) ? 0 : budgetValue);
    }, 0);
    return previewBudget - totalAllocated;
  };

  const handleBudgetInputChange = (value) => {
    // Remove any non-numeric characters except decimal point
    const cleanedText = value.replace(/[^0-9.]/g, '');
    
    // Ensure only one decimal point
    const parts = cleanedText.split('.');
    if (parts.length > 2) {
      return;
    }
    
    // Limit decimal places to 2
    if (parts[1] && parts[1].length > 2) {
      return;
    }

    setTempBudget(cleanedText);
    const numValue = parseFloat(cleanedText);
    if (!isNaN(numValue)) {
      setPreviewBudget(numValue);
    }
  };

  const handleBudgetUpdate = () => {
    const budgetValue = parseFloat(tempBudget);
    if (isNaN(budgetValue) || budgetValue <= 0) {
      Alert.alert('Invalid Budget', 'Please enter a valid budget amount');
      return;
    }

    const remainingAllocation = calculateRemainingCategoryBudget();
    if (remainingAllocation < 0) {
      Alert.alert(
        'Invalid Budget',
        'Category allocations exceed the new budget. Please adjust category budgets first.'
      );
      return;
    }
    
    updateBudget(budgetValue);
    setBudget(budgetValue);
  };
 
  const updateSavingsGoal = () => {
    const savingsValue = parseFloat(tempSavingsGoal);
    if (isNaN(savingsValue) || savingsValue < 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid savings goal');
      return;
    }
   
    setSavingsGoal(savingsValue);
    setSavingsModalVisible(false);
  };
 
  const handleSaveChanges = () => {
    // Validate budget first
    const budgetValue = parseFloat(tempBudget);
    if (isNaN(budgetValue) || budgetValue <= 0) {
      Alert.alert('Invalid Budget', 'Please enter a valid budget amount');
      return;
    }

    const remainingAllocation = calculateRemainingCategoryBudget();
    if (remainingAllocation < 0) {
      Alert.alert(
        'Invalid Budget',
        'Category allocations exceed the new budget. Please adjust category budgets first.'
      );
      return;
    }

    // Validate category budgets
    const updatedBudgets = {};
    let totalCategoryBudget = 0;
    
    for (const [category, value] of Object.entries(tempCategoryBudgets)) {
      const budgetValue = parseFloat(value);
      if (isNaN(budgetValue) || budgetValue < 0) {
        Alert.alert('Invalid Budget', `Please enter a valid budget for ${getCategoryName(category)}`);
        return;
      }
      totalCategoryBudget += budgetValue;
      updatedBudgets[category] = budgetValue;
    }

    // If all validations pass, update everything and close modal
    handleBudgetUpdate();
    setCategoryBudgets(updatedBudgets);
    updateCategoryBudgets(updatedBudgets);
    setBudgetModalVisible(false);
  };

  const handleCategoryBudgetChange = (category, value) => {
    // Remove any non-numeric characters except decimal point
    const cleanedText = value.replace(/[^0-9.]/g, '');
    
    // Ensure only one decimal point
    const parts = cleanedText.split('.');
    if (parts.length > 2) {
      return;
    }
    
    // Limit decimal places to 2
    if (parts[1] && parts[1].length > 2) {
      return;
    }

    setTempCategoryBudgets(prev => ({
      ...prev,
      [category]: cleanedText
    }));
  };

  const getCategoryPercentage = (category) => {
    const spent = spendingByCategory[category] || 0;
    const categoryBudget = categoryBudgets[category] || 0;
    if (categoryBudget === 0) return 0;
    return Math.min(100, (spent / categoryBudget) * 100);
  };
 
  const confirmDeleteExpense = (expense) => {
    setSelectedExpense(expense);
    setDeleteModalVisible(true);
  };

  const [monthSelectorVisible, setMonthSelectorVisible] = useState(false);

  const renderMonthSelector = () => (
    <View style={styles.monthSelectorContainer}>
      <TouchableOpacity 
        style={styles.monthSelector}
        onPress={() => setMonthSelectorVisible(true)}
      >
        <Text style={styles.monthSelectorText}>
          {new Date(selectedMonth + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </Text>
        <Ionicons name="calendar-outline" size={24} color="#5F9EA0" />
      </TouchableOpacity>
    </View>
  );

  const renderMonthSelectorModal = () => {
    // Get all available months and sort them in descending order
    const availableMonths = Object.keys(monthlyData)
      .sort((a, b) => b.localeCompare(a));

    // If current month is not in the list, add it
    const currentMonth = new Date().toISOString().slice(0, 7);
    if (!availableMonths.includes(currentMonth)) {
      availableMonths.unshift(currentMonth);
    }

    const handleMonthSelect = (monthKey) => {
      switchMonth(monthKey);
      setMonthSelectorVisible(false);
    };

    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={monthSelectorVisible}
        onRequestClose={() => setMonthSelectorVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.monthSelectorModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Month</Text>
              <TouchableOpacity onPress={() => setMonthSelectorVisible(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.monthList}>
              {availableMonths.map((monthKey) => {
                const date = new Date(monthKey + '-01');
                const isSelected = monthKey === selectedMonth;
                return (
                  <TouchableOpacity
                    key={monthKey}
                    style={[
                      styles.monthOption,
                      isSelected && styles.selectedMonthOption
                    ]}
                    onPress={() => handleMonthSelect(monthKey)}
                  >
                    <Text style={[
                      styles.monthOptionText,
                      isSelected && styles.selectedMonthOptionText
                    ]}>
                      {date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </Text>
                    {isSelected && (
                      <Ionicons name="checkmark" size={24} color="#5F9EA0" />
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  };

  const isValidExpense = () => {
    const amountValue = parseFloat(newExpense.amount);
    return newExpense.name.trim() !== '' && !isNaN(amountValue) && amountValue > 0;
  };

  const renderAddExpenseButton = () => {
    if (!isCurrentMonth) return null;
    
    return (
      <TouchableOpacity 
        style={styles.addButton} 
        onPress={() => setModalVisible(true)}
      >
        <Ionicons name="add" size={24} color="white" />
      </TouchableOpacity>
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
        {/* Header */}
        <View style={sharedStyles.screenHeader}>
          <View style={sharedStyles.headerContent}>
            <View style={styles.headerIconPlaceholder} />
            <Text style={[sharedStyles.screenTitle, { textAlign: 'center' }]}>
              {new Date(selectedMonth + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </Text>
            <TouchableOpacity onPress={() => setMonthSelectorVisible(true)} style={styles.headerButton}>
              <Ionicons name="calendar-outline" size={24} color="#5F9EA0" />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView style={styles.container}>
          {/* Budget Summary */}
          <View style={styles.budgetContainer}>
            <View style={styles.budgetHeader}>
              <Text style={sharedStyles.sectionTitle}>Monthly Budget</Text>
              {isCurrentMonth && (
                <TouchableOpacity onPress={() => {
                  setTempBudget(budget.toString());
                  setTempCategoryBudgets({...categoryBudgets});
                  setBudgetModalVisible(true);
                }}>
                  <Ionicons name="create-outline" size={22} color="#5F9EA0" />
                </TouchableOpacity>
              )}
            </View>
           
            <View style={styles.budgetAmounts}>
              <View style={styles.budgetValue}>
                <Text style={styles.budgetLabel}>Budget</Text>
                <Text style={styles.totalBudget}>₱{formatCurrency(budget)}</Text>
              </View>
             
              <View style={styles.budgetValue}>
                <Text style={styles.budgetLabel}>Spent</Text>
                <Text style={styles.spentAmount}>₱{formatCurrency(totalExpenses)}</Text>
              </View>
             
              <View style={styles.budgetValue}>
                <Text style={styles.budgetLabel}>Remaining</Text>
                <Text style={[
                  styles.remainingAmount,
                  {color: remainingBudget >= 0 ? '#4CD964' : '#FF2D55'}
                ]}>₱{formatCurrency(remainingBudget)}</Text>
              </View>
            </View>
           
            <View style={styles.progressContainer}>
              <View style={styles.progressBarBackground}>
                <View
                  style={[
                    styles.progressBar,
                    {width: `${Math.min(100, (totalExpenses / budget) * 100)}%`},
                    totalExpenses > budget ? {backgroundColor: '#FF2D55'} : {}
                  ]}
                />
              </View>
              <Text style={styles.progressText}>
                {Math.round((totalExpenses / budget) * 100)}% of budget used
              </Text>
            </View>
          </View>
         
          <View style={styles.savingsContainer}>
            <View style={styles.savingsHeader}>
              <Text style={sharedStyles.sectionTitle}>Savings Goal</Text>
              {isCurrentMonth && (
                <TouchableOpacity onPress={() => {
                  setTempSavingsGoal(savingsGoal.toString());
                  setSavingsModalVisible(true);
                }}>
                  <Ionicons name="create-outline" size={22} color="#5F9EA0" />
                </TouchableOpacity>
              )}
            </View>
           
            <View style={styles.savingsInfo}>
              <Text style={styles.savingsAmount}>₱{formatCurrency(currentSavings)} </Text>
              <Text style={styles.savingsOf}>of </Text>
              <Text style={styles.savingsGoal}>₱{formatCurrency(savingsGoal)}</Text>
            </View>
           
            <View style={styles.savingsProgressBar}>
              <View
                style={[
                  styles.savingsProgress,
                  {
                    width: `${Math.min(100, savingsProgress)}%`,
                    backgroundColor: savingsProgress >= 100 ? '#4CD964' : '#5F9EA0'
                  }
                ]}
              />
            </View>
            <Text style={styles.savingsProgressText}>
              {Math.round(savingsProgress)}% of goal achieved
            </Text>
          </View>
         
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={Platform.OS === 'web'}
            style={styles.categoryContainer}
            contentContainerStyle={styles.categoryContent}
          >
            {Object.keys(categoryBudgets).map((category) => (
              <View key={category} style={styles.categoryCard}>
                <View style={styles.categoryHeader}>
                  <View style={[styles.categoryIcon, {backgroundColor: getCategoryColor(category)}]}>
                    <Ionicons name={getCategoryIcon(category)} size={20} color="white" />
                  </View>
                  <Text style={styles.categoryName}>{getCategoryName(category)}</Text>
                </View>
               
                <View style={styles.categoryBudgetInfo}>
                  <Text style={styles.categorySpent}>
                    ₱{formatCurrency(spendingByCategory[category] || 0)}
                  </Text>
                  <Text style={styles.categoryOf}>of</Text>
                  <Text style={styles.categoryTotal}>
                    ₱{formatCurrency(categoryBudgets[category])}
                  </Text>
                </View>
               
                <View style={styles.categoryProgressBar}>
                  <View
                    style={[
                      styles.categoryProgress,
                      {width: `${getCategoryPercentage(category)}%`},
                      getCategoryPercentage(category) >= 100 ? {backgroundColor: '#FF2D55'} : {backgroundColor: getCategoryColor(category)}
                    ]}
                  />
                </View>
              </View>
            ))}
          </ScrollView>
          
          {/* Expenses List Section */}
          <View style={styles.expensesSection}>
            <View style={styles.listHeaderContainer}>
              <Text style={sharedStyles.sectionTitle}>Recent Expenses</Text>
              <View style={styles.searchBar}>
                <Ionicons name="search" size={20} color="#888" style={styles.searchIcon} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search expenses"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity onPress={() => setSearchQuery('')}>
                    <Ionicons name="close-circle" size={18} color="#888" />
                  </TouchableOpacity>
                )}
              </View>
            </View>
            
            {expenses.length === 0 ? (
              <View style={styles.noExpensesContainer}>
                <Text style={styles.noExpensesText}>No expenses found</Text>
              </View>
            ) : (
              <View style={styles.expensesList}>
                {expenses
                  .filter(expense =>
                    expense.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    expense.category.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map(expense => (
                    <View key={expense.id} style={styles.expenseItemContainer}>
                      <TouchableOpacity style={styles.expenseItem}>
                        <View style={[styles.expenseIcon, {backgroundColor: getCategoryColor(expense.category)}]}>
                          <Ionicons name={getCategoryIcon(expense.category)} size={22} color="white" />
                        </View>
                        
                        <View style={styles.expenseDetails}>
                          <Text style={styles.expenseName}>{expense.name}</Text>
                          <Text style={styles.expenseCategory}>
                            {getCategoryName(expense.category)} • {formatDate(expense.date)}
                          </Text>
                        </View>
                        
                        <Text style={styles.expenseAmount}>₱{formatCurrency(expense.amount)}</Text>
                      </TouchableOpacity>
                      
                      {isCurrentMonth && (
                        <TouchableOpacity
                          style={styles.deleteButton}
                          onPress={() => confirmDeleteExpense(expense)}
                        >
                          <Ionicons name="trash-outline" size={20} color="#FF3B30" />
                        </TouchableOpacity>
                      )}
                    </View>
                  ))
                }
              </View>
            )}
          </View>
        </ScrollView>
      </View>
      
      {renderAddExpenseButton()}
     
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalContainer}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Expense</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
           
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Description</Text>
              <TextInput
                style={styles.input}
                placeholder="What did you spend on?"
                value={newExpense.name}
                onChangeText={(text) => setNewExpense({...newExpense, name: text})}
              />
            </View>
           
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Amount (₱)</Text>
              <TextInput
                style={styles.input}
                placeholder="0.00"
                keyboardType="numeric"
                value={newExpense.amount}
                onChangeText={(text) => {
                  // Remove non-numeric characters except decimal point
                  const sanitizedText = text.replace(/[^0-9.]/g, '');
                  // Ensure only one decimal point
                  const parts = sanitizedText.split('.');
                  const finalText = parts[0] + (parts.length > 1 ? '.' + parts[1] : '');
                  setNewExpense({...newExpense, amount: finalText});
                }}
              />
            </View>
           
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Category</Text>
              <TouchableOpacity
                style={styles.categorySelector}
                onPress={() => setCategoryModalVisible(true)}
              >
                <View style={styles.selectedCategory}>
                  <View style={[styles.selectedCategoryIcon, {backgroundColor: getCategoryColor(newExpense.category)}]}>
                    <Ionicons name={getCategoryIcon(newExpense.category)} size={20} color="white" />
                  </View>
                  <Text style={styles.selectedCategoryText}>
                    {getCategoryName(newExpense.category)}
                  </Text>
                </View>
                <Ionicons name="chevron-down" size={20} color="#666" />
              </TouchableOpacity>
            </View>
           
            <TouchableOpacity 
              style={[
                styles.saveButton,
                !isValidExpense() && styles.saveButtonDisabled
              ]} 
              onPress={addExpense}
              disabled={!isValidExpense()}
            >
              <Text style={[
                styles.saveButtonText,
                !isValidExpense() && styles.saveButtonTextDisabled
              ]}>
                {!newExpense.name.trim() 
                  ? 'Enter Description'
                  : !newExpense.amount || parseFloat(newExpense.amount) <= 0 
                    ? 'Enter Valid Amount'
                    : 'Add Expense'
                }
              </Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
     
      <Modal
        animationType="slide"
        transparent={true}
        visible={budgetModalVisible}
        onRequestClose={() => setBudgetModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalContainer}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Budget</Text>
              <TouchableOpacity onPress={() => setBudgetModalVisible(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
           
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Monthly Budget (₱)</Text>
              <TextInput
                style={styles.input}
                placeholder="0.00"
                keyboardType="numeric"
                value={tempBudget}
                onChangeText={handleBudgetInputChange}
              />
            </View>
           
            <View style={[
              styles.remainingBudgetContainer,
              calculateRemainingCategoryBudget() < 0 && styles.remainingBudgetContainerNegative
            ]}>
              <Text style={styles.remainingBudgetLabel}>
                {calculateRemainingCategoryBudget() >= 0 
                  ? 'Available for Categories:'
                  : 'Category Budgets Exceed Total:'}
              </Text>
              <Text style={[
                styles.remainingBudgetValue,
                calculateRemainingCategoryBudget() < 0 ? styles.remainingBudgetNegative : {}
              ]}>
                ₱{formatCurrency(Math.abs(calculateRemainingCategoryBudget()))}
              </Text>
            </View>
           
            <Text style={styles.sectionTitle}>Category Budgets</Text>
            
            <ScrollView style={styles.categoryBudgetsList}>
              {Object.keys(tempCategoryBudgets).map((category) => (
                <View key={category} style={styles.categoryBudgetItem}>
                  <View style={styles.categoryBudgetHeader}>
                    <View style={[styles.categoryBudgetIcon, {backgroundColor: getCategoryColor(category)}]}>
                      <Ionicons name={getCategoryIcon(category)} size={18} color="white" />
                    </View>
                    <Text style={styles.categoryBudgetName}>{getCategoryName(category)}</Text>
                  </View>
                 
                  <TextInput
                    style={styles.categoryBudgetInput}
                    keyboardType="numeric"
                    value={tempCategoryBudgets[category].toString()}
                    onChangeText={(text) => handleCategoryBudgetChange(category, text)}
                  />
                </View>
              ))}
            </ScrollView>
           
            <TouchableOpacity 
              style={[
                styles.saveButton,
                calculateRemainingCategoryBudget() < 0 && styles.saveButtonDisabled
              ]} 
              onPress={handleSaveChanges}
            >
              <Text style={styles.saveButtonText}>
                {calculateRemainingCategoryBudget() < 0 
                  ? 'Adjust Budgets to Save'
                  : 'Save Changes'
                }
              </Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
     
      <Modal
        animationType="slide"
        transparent={true}
        visible={savingsModalVisible}
        onRequestClose={() => setSavingsModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalContainer}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Savings Goal</Text>
              <TouchableOpacity onPress={() => setSavingsModalVisible(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
           
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Savings Goal (₱)</Text>
              <TextInput
                style={styles.input}
                placeholder="0.00"
                keyboardType="numeric"
                value={tempSavingsGoal}
                onChangeText={setTempSavingsGoal}
              />
            </View>
           
            {/* Save Button */}
            <TouchableOpacity style={styles.saveButton} onPress={updateSavingsGoal}>
              <Text style={styles.saveButtonText}>Save Goal</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
     
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
              {Object.keys(categoryBudgets).map((category) => (
                <TouchableOpacity
                  key={category}
                  style={styles.categoryOption}
                  onPress={() => {
                    setNewExpense({...newExpense, category});
                    setCategoryModalVisible(false);
                  }}
                >
                  <View style={[styles.categoryOptionIcon, {backgroundColor: getCategoryColor(category)}]}>
                    <Ionicons name={getCategoryIcon(category)} size={22} color="white" />
                  </View>
                  <Text style={styles.categoryOptionText}>
                    {getCategoryName(category)}
                  </Text>
                  {newExpense.category === category && (
                    <Ionicons name="checkmark" size={22} color="#5F9EA0" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
     
      <Modal
        animationType="fade"
        transparent={true}
        visible={deleteModalVisible}
        onRequestClose={() => setDeleteModalVisible(false)}
      >
        <View style={styles.alertModalContainer}>
          <View style={styles.alertModalContent}>
            <Text style={styles.alertTitle}>Delete Expense</Text>
            <Text style={styles.alertMessage}>
              Are you sure you want to delete "{selectedExpense?.name}"?
            </Text>
           
            <View style={styles.alertButtons}>
              <TouchableOpacity
                style={[styles.alertButton, styles.cancelButton]}
                onPress={() => setDeleteModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
             
              <TouchableOpacity
                style={[styles.alertButton, styles.deleteConfirmButton]}
                onPress={deleteExpense}
              >
                <Text style={styles.deleteButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      {renderMonthSelectorModal()}
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
  budgetContainer: {
    backgroundColor: 'white',
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eaeaea',
  },
  budgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  budgetTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
 
  budgetAmounts: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  budgetValue: {
    alignItems: 'center',
  },
  budgetLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  totalBudget: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  spentAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF9500',
  },
  remainingAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  progressContainer: {
    marginTop: 5,
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 5,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#5F9EA0',
  },
  progressText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'right',
  },
  savingsContainer: {
    backgroundColor: 'white',
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eaeaea',
  },
  savingsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  savingsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  savingsInfo: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 10,
  },
  savingsAmount: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#5F9EA0',
  },
  savingsOf: {
    fontSize: 16,
    color: '#666',
  },
  savingsGoal: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  savingsProgressBar: {
    height: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 5,
  },
  savingsProgress: {
    height: '100%',
    backgroundColor: '#5F9EA0',
  },
  savingsProgressText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'right',
  },
  categoryContainer: {
    marginBottom: 15,
    minHeight: 140,
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
      scrollbarWidth: 'thin',
      scrollbarColor: '#5F9EA0 #f0f0f0',
    }),
  },
  categoryContent: {
    paddingHorizontal: 15,
    paddingVertical: 5,
    ...(Platform.OS === 'web' && {
      paddingBottom: 20, // Extra padding for scrollbar
    }),
  },
  categoryCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginRight: 10,
    width: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    minHeight: 120,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    flexShrink: 0,
  },
  categoryIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  categoryBudgetInfo: {
    marginBottom: 10,
  },
  categorySpent: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  categoryOf: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  categoryTotal: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  categoryProgressBar: {
    height: 6,
    backgroundColor: '#f0f0f0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  categoryProgress: {
    height: '100%',
  },
  expensesSection: {
    backgroundColor: 'white',
    marginTop: 15,
  },
  listHeaderContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eaeaea',
    backgroundColor: 'white',
  },
  listTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 40,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    height: '100%',
    paddingVertical: 8,
  },
  expensesList: {
    backgroundColor: 'white',
  },
  expenseItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eaeaea',
    backgroundColor: 'white',
  },
  expenseItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: 'white',
  },
  expenseDetails: {
    flex: 1,
    marginRight: 10,
  },
  expenseName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  expenseCategory: {
    fontSize: 13,
    color: '#666',
  },
  expenseAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'right',
    minWidth: 80,
  },
  expenseIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  deleteButton: {
    paddingHorizontal: 15,
    paddingVertical: 12,
    justifyContent: 'center',
  },
  noExpensesContainer: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: 'white',
  },
  noExpensesText: {
    fontSize: 16,
    color: '#666',
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
    maxHeight: '80%',
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
  inputContainer: {
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
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
  selectedCategoryIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  selectedCategoryText: {
    fontSize: 16,
    color: '#333',
  },
  saveButton: {
    backgroundColor: '#5F9EA0',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  categoryBudgetsList: {
    maxHeight: 200,
    marginBottom: 15,
  },
  categoryBudgetItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eaeaea',
  },
  categoryBudgetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryBudgetIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  categoryBudgetName: {
    fontSize: 14,
    color: '#333',
  },
  categoryBudgetInput: {
    width: 100,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 6,
    fontSize: 14,
    textAlign: 'right',
  },
  categoryList: {
    maxHeight: 300,
  },
  categoryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eaeaea',
  },
  categoryOptionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  categoryOptionText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  alertModalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  alertModalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    width: '80%',
    maxWidth: 400,
  },
  alertTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  alertMessage: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  alertButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  alertButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 5,
    marginLeft: 10,
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  cancelButtonText: {
    color: '#333',
    fontWeight: '600',
  },
  deleteConfirmButton: {
    backgroundColor: '#FF3B30',
  },
  deleteButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  monthSelectorContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eaeaea',
  },
  monthSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 5,
  },
  monthSelectorText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  monthSelectorModal: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  monthList: {
    maxHeight: 400,
  },
  monthOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eaeaea',
  },
  selectedMonthOption: {
    backgroundColor: '#f8f8f8',
  },
  monthOptionText: {
    fontSize: 16,
    color: '#333',
  },
  selectedMonthOptionText: {
    color: '#5F9EA0',
    fontWeight: 'bold',
  },
  remainingBudgetContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
  },
  remainingBudgetLabel: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  remainingBudgetValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CD964',
  },
  remainingBudgetNegative: {
    color: '#FF3B30',
  },
  remainingBudgetContainerNegative: {
    backgroundColor: '#FFE5E5',
  },
  saveButtonDisabled: {
    backgroundColor: '#cccccc',
  },
  saveButtonTextDisabled: {
    color: '#999999',
  },
  headerIconPlaceholder: {
    width: 40,
    height: 40,
  },
  headerButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ExpenseTrackerScreen;