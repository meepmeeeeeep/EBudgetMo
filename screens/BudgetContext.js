import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const BudgetContext = createContext();

const STORAGE_KEY = 'budget_data';

// Helper function to get current month in YYYY-MM format
const getCurrentMonthKey = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
};

// Helper function to get default month structure
const getDefaultMonthData = () => ({
  budget: 15000,
  expenses: [],
  categoryBudgets: {
    groceries: 5000,
    utilities: 3000,
    transportation: 2000,
    food: 3000,
    entertainment: 1000,
    shopping: 1000
  },
  savingsGoal: 3000
});

// Helper function to validate month data structure
const validateMonthData = (data) => {
  if (!data) return false;
  
  const requiredFields = ['budget', 'expenses', 'categoryBudgets', 'savingsGoal'];
  const requiredCategories = ['groceries', 'utilities', 'transportation', 'food', 'entertainment', 'shopping'];
  
  // Check required fields
  const hasAllFields = requiredFields.every(field => field in data);
  if (!hasAllFields) return false;
  
  // Validate budget
  if (typeof data.budget !== 'number' || data.budget <= 0) return false;
  
  // Validate expenses array
  if (!Array.isArray(data.expenses)) return false;
  
  // Validate category budgets
  if (typeof data.categoryBudgets !== 'object') return false;
  const hasAllCategories = requiredCategories.every(category => 
    category in data.categoryBudgets && 
    typeof data.categoryBudgets[category] === 'number' && 
    data.categoryBudgets[category] >= 0
  );
  if (!hasAllCategories) return false;
  
  // Validate savings goal
  if (typeof data.savingsGoal !== 'number' || data.savingsGoal < 0) return false;
  
  return true;
};

// Initial data for new installations
const DEFAULT_DATA = {
  '2025-05': {
    budget: 15000,
    expenses: [],
    categoryBudgets: {
      groceries: 5000,
      utilities: 3000,
      transportation: 2000,
      food: 3000,
      entertainment: 1000,
      shopping: 1000
    },
    savingsGoal: 3000
  },
  '2025-04': {
    budget: 15000,
    expenses: [
      {
        id: 1,
        name: 'Weekly Groceries',
        amount: 4500,
        category: 'groceries',
        date: '2025-04-15',
        month: '2025-04'
      },
      {
        id: 2,
        name: 'Electricity Bill',
        amount: 2800,
        category: 'utilities',
        date: '2025-04-10',
        month: '2025-04'
      },
      {
        id: 3,
        name: 'Bus Fare',
        amount: 1500,
        category: 'transportation',
        date: '2025-04-20',
        month: '2025-04'
      },
      {
        id: 4,
        name: 'Restaurant Dinner',
        amount: 2500,
        category: 'food',
        date: '2025-04-25',
        month: '2025-04'
      },
      {
        id: 5,
        name: 'Movie Night',
        amount: 800,
        category: 'entertainment',
        date: '2025-04-18',
        month: '2025-04'
      },
      {
        id: 6,
        name: 'New Clothes',
        amount: 1200,
        category: 'shopping',
        date: '2025-04-05',
        month: '2025-04'
      }
    ],
    categoryBudgets: {
      groceries: 5000,
      utilities: 3000,
      transportation: 2000,
      food: 3000,
      entertainment: 1000,
      shopping: 1000
    },
    savingsGoal: 3000
  }
};

export const BudgetProvider = ({ children }) => {
  const [monthlyData, setMonthlyData] = useState({});
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonthKey());
  const [currentBudget, setCurrentBudget] = useState(15000);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize AsyncStorage for web platform
  useEffect(() => {
    const initializeStorage = async () => {
      if (Platform.OS === 'web') {
        setMonthlyData(DEFAULT_DATA);
        const currentMonth = getCurrentMonthKey();
        setSelectedMonth(currentMonth);
        setCurrentBudget(DEFAULT_DATA[currentMonth]?.budget || 15000);
        setIsLoading(false);
        return;
      }
      
      await loadSavedData();
    };

    initializeStorage();
  }, []); // Keep empty dependency array

  // Update currentBudget whenever selectedMonth changes
  useEffect(() => {
    if (!isLoading && monthlyData[selectedMonth]) {
      const monthData = monthlyData[selectedMonth];
      if (monthData.budget !== currentBudget) {
        setCurrentBudget(monthData.budget);
      }
    }
  }, [selectedMonth, monthlyData, isLoading, currentBudget]);

  // Save data whenever it changes
  useEffect(() => {
    if (!isLoading) {
      saveData();
    }
  }, [monthlyData, isLoading]);

  const loadSavedData = useCallback(async () => {
    try {
      const savedData = await AsyncStorage.getItem(STORAGE_KEY);
      
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        
        // Validate each month's data
        let isDataValid = true;
        Object.entries(parsedData).forEach(([month, monthData]) => {
          if (!validateMonthData(monthData)) {
            console.error(`Invalid data structure for month: ${month}`);
            isDataValid = false;
          }
        });
        
        if (isDataValid) {
          setMonthlyData(parsedData);
          if (parsedData[selectedMonth]) {
            setCurrentBudget(parsedData[selectedMonth].budget);
          } else {
            // Initialize data for current month if it doesn't exist
            const defaultMonthData = getDefaultMonthData();
            const updatedData = {
              ...parsedData,
              [selectedMonth]: defaultMonthData
            };
            setMonthlyData(updatedData);
            setCurrentBudget(defaultMonthData.budget);
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedData));
          }
        } else {
          // If data is invalid, fall back to default data
          setMonthlyData(DEFAULT_DATA);
          setCurrentBudget(DEFAULT_DATA[selectedMonth].budget);
          await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_DATA));
        }
      } else {
        // Initialize with default data
        setMonthlyData(DEFAULT_DATA);
        setCurrentBudget(DEFAULT_DATA[selectedMonth].budget);
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_DATA));
      }
    } catch (error) {
      console.error('Error loading data:', error);
      setMonthlyData(DEFAULT_DATA);
      setCurrentBudget(DEFAULT_DATA[selectedMonth].budget);
    } finally {
      setIsLoading(false);
    }
  }, [selectedMonth]);

  const saveData = useCallback(async () => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(monthlyData));
    } catch (error) {
      console.error('Error saving data:', error);
    }
  }, [monthlyData]);

  // Modify switchMonth to prevent double updates
  const switchMonth = useCallback(async (newMonth) => {
    try {
      if (newMonth === selectedMonth) return; // Prevent unnecessary updates

      let updatedData = { ...monthlyData };
      if (!monthlyData[newMonth]) {
        // Initialize new month with default data
        updatedData = {
          ...monthlyData,
          [newMonth]: getDefaultMonthData()
        };
        setMonthlyData(updatedData);
        
        // Persist the new month data
        if (Platform.OS !== 'web') {
          await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedData));
        }
      }
      
      setSelectedMonth(newMonth);
      const newBudget = updatedData[newMonth]?.budget || getDefaultMonthData().budget;
      if (newBudget !== currentBudget) {
        setCurrentBudget(newBudget);
      }
    } catch (error) {
      console.error('Error switching month:', error);
    }
  }, [monthlyData, selectedMonth, currentBudget]);

  // Modify updateBudget to prevent unnecessary updates
  const updateBudget = useCallback(async (newBudget) => {
    if (typeof newBudget !== 'number' || newBudget <= 0) {
      console.error('Invalid budget value');
      return;
    }

    if (newBudget === currentBudget) return; // Prevent unnecessary updates

    try {
      const updatedData = {
        ...monthlyData,
        [selectedMonth]: {
          ...(monthlyData[selectedMonth] || getDefaultMonthData()),
          budget: newBudget
        }
      };

      // Update state first
      setMonthlyData(updatedData);
      setCurrentBudget(newBudget);

      // Then persist to storage
      if (Platform.OS !== 'web') {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedData));
      }
    } catch (error) {
      console.error('Error updating budget:', error);
    }
  }, [monthlyData, selectedMonth, currentBudget]);

  const updateSavingsGoal = useCallback(async (newSavingsGoal) => {
    if (typeof newSavingsGoal !== 'number' || newSavingsGoal < 0) {
      console.error('Invalid savings goal value');
      return;
    }

    try {
      const updatedData = {
        ...monthlyData,
        [selectedMonth]: {
          ...(monthlyData[selectedMonth] || getDefaultMonthData()),
          savingsGoal: newSavingsGoal
        }
      };

      // Update state
      setMonthlyData(updatedData);

      // Persist to storage
      if (Platform.OS !== 'web') {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedData));
      }
    } catch (error) {
      console.error('Error updating savings goal:', error);
    }
  }, [monthlyData, selectedMonth]);

  const updateMonthlyExpenses = (expenses) => {
    const currentMonthKey = selectedMonth;
    setMonthlyData(prev => {
      const updatedData = {
        ...prev,
        [currentMonthKey]: {
          ...prev[currentMonthKey],
          expenses
        }
      };
      // Save immediately after updating
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedData))
        .catch(error => console.error('Error saving expenses:', error));
      return updatedData;
    });
  };

  const resetToCurrentMonth = useCallback(async () => {
    try {
      const currentMonth = getCurrentMonthKey();
      console.log('Resetting to current month:', currentMonth); // Debug log
      
      // Don't reset if we're already on current month
      if (currentMonth === selectedMonth) {
        console.log('Already on current month, skipping reset'); // Debug log
        return;
      }

      let updatedData = { ...monthlyData };
      if (!updatedData[currentMonth]) {
        // Initialize current month with default data
        updatedData = {
          ...monthlyData,
          [currentMonth]: getDefaultMonthData()
        };
        setMonthlyData(updatedData);
        
        // Persist the new month data
        if (Platform.OS !== 'web') {
          await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedData));
        }
      }

      console.log('Setting selected month to:', currentMonth); // Debug log
      setSelectedMonth(currentMonth);
      
      const newBudget = updatedData[currentMonth]?.budget || getDefaultMonthData().budget;
      if (newBudget !== currentBudget) {
        setCurrentBudget(newBudget);
      }
    } catch (error) {
      console.error('Error resetting to current month:', error);
    }
  }, [monthlyData, selectedMonth, currentBudget]);

  // Update the useEffect for initial mount to use async
  useEffect(() => {
    const initializeMonth = async () => {
      // Reset to current month on initial mount
      await resetToCurrentMonth();
      // Initial bills refresh
      refreshBills();
    };

    initializeMonth();
  }, []); // Keep empty dependency array for mount only

  const getCurrentMonthData = useCallback(() => {
    // Always use the actual current month, completely independent of selectedMonth
    const currentMonthKey = getCurrentMonthKey();
    
    // Get current month data
    const currentData = monthlyData[currentMonthKey];
    
    if (!currentData) {
      // Initialize current month data if it doesn't exist
      const newMonthData = getDefaultMonthData();

      // Update monthlyData with the new month
      setMonthlyData(prev => {
        const updatedData = {
          ...prev,
          [currentMonthKey]: newMonthData
        };
        // Save the new data
        AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedData))
          .catch(error => console.error('Error saving new month data:', error));
        return updatedData;
      });

      return newMonthData;
    }

    return currentData;
  }, [monthlyData]); // Only depend on monthlyData

  const getSelectedMonthData = useCallback(() => {
    // For FinanceScreen: Return data based on selected month
    return monthlyData[selectedMonth] || getDefaultMonthData();
  }, [monthlyData, selectedMonth]);

  const getPreviousMonthData = () => {
    const currentDate = new Date(selectedMonth + '-01');
    currentDate.setMonth(currentDate.getMonth() - 1);
    const previousMonth = currentDate.toISOString().slice(0, 7);
    return monthlyData[previousMonth] || null;
  };

  const updateCategoryBudgets = (newCategoryBudgets) => {
    // Validate category budgets structure
    const requiredCategories = ['groceries', 'utilities', 'transportation', 'food', 'entertainment', 'shopping'];
    const isValid = requiredCategories.every(category => 
      category in newCategoryBudgets && 
      typeof newCategoryBudgets[category] === 'number' && 
      newCategoryBudgets[category] >= 0
    );
    
    if (!isValid) {
      console.error('Invalid category budgets structure:', newCategoryBudgets);
      return;
    }
    
    setMonthlyData(prev => {
      const updatedMonthData = {
        ...(prev[selectedMonth] || {
          budget: currentBudget,
          expenses: [],
          savingsGoal: 3000
        }),
        categoryBudgets: newCategoryBudgets
      };
      
      // Validate the complete updated data
      if (!validateMonthData(updatedMonthData)) {
        console.error('Invalid data structure after category budgets update');
        return prev;
      }
      
      const updatedData = {
        ...prev,
        [selectedMonth]: updatedMonthData
      };
      
      // Save immediately after updating
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedData))
        .catch(error => console.error('Error saving category budgets:', error));
      return updatedData;
    });
  };

  if (isLoading) {
    return null;
  }

  return (
    <BudgetContext.Provider
      value={{
        monthlyData,
        selectedMonth,
        currentBudget,
        updateBudget,
        updateMonthlyExpenses,
        switchMonth,
        resetToCurrentMonth,
        getCurrentMonthData,
        getSelectedMonthData,
        getPreviousMonthData,
        updateCategoryBudgets,
        updateSavingsGoal
      }}
    >
      {children}
    </BudgetContext.Provider>
  );
};

export const useBudget = () => {
  const context = useContext(BudgetContext);
  if (!context) {
    throw new Error('useBudget must be used within a BudgetProvider');
  }
  return context;
};