import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BILLS_STORAGE_KEY = 'recurring_bills';

const BillsContext = createContext();

export const useBills = () => {
  const context = useContext(BillsContext);
  if (!context) {
    throw new Error('useBills must be used within a BillsProvider');
  }
  return context;
};

export const BillsProvider = ({ children }) => {
  const [bills, setBills] = useState([]);
  const [upcomingBills, setUpcomingBills] = useState([]);
  const [lastUpdate, setLastUpdate] = useState(Date.now());

  // Load bills from storage
  useEffect(() => {
    loadBills();
  }, [lastUpdate]);

  // Update upcoming bills whenever bills change
  useEffect(() => {
    updateUpcomingBills();
  }, [bills, lastUpdate]);

  const loadBills = async () => {
    try {
      const savedBills = await AsyncStorage.getItem(BILLS_STORAGE_KEY);
      if (savedBills) {
        setBills(JSON.parse(savedBills));
      }
    } catch (error) {
      console.error('Error loading bills:', error);
    }
  };

  const saveBills = async (updatedBills) => {
    try {
      await AsyncStorage.setItem(BILLS_STORAGE_KEY, JSON.stringify(updatedBills));
      setBills(updatedBills);
      setLastUpdate(Date.now()); // Force refresh
    } catch (error) {
      console.error('Error saving bills:', error);
    }
  };

  const updateUpcomingBills = () => {
    const today = new Date();
    const upcoming = bills
      .map(bill => {
        const dueDate = new Date();
        dueDate.setDate(bill.dueDate);
        if (dueDate < today) {
          dueDate.setMonth(dueDate.getMonth() + 1);
        }
        const daysUntilDue = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
        return { ...bill, daysUntilDue };
      })
      .filter(bill => bill.daysUntilDue <= 7)
      .sort((a, b) => a.daysUntilDue - b.daysUntilDue)
      .slice(0, 3);
    
    setUpcomingBills(upcoming);
  };

  const refreshBills = () => {
    setLastUpdate(Date.now());
  };

  const addBill = async (newBill) => {
    const updatedBills = [...bills, newBill];
    await saveBills(updatedBills);
  };

  const updateBill = async (updatedBill) => {
    const updatedBills = bills.map(bill => 
      bill.id === updatedBill.id ? updatedBill : bill
    );
    await saveBills(updatedBills);
  };

  const deleteBill = async (billId) => {
    const updatedBills = bills.filter(bill => bill.id !== billId);
    await saveBills(updatedBills);
  };

  return (
    <BillsContext.Provider value={{
      bills,
      upcomingBills,
      addBill,
      updateBill,
      deleteBill,
      loadBills,
      refreshBills
    }}>
      {children}
    </BillsContext.Provider>
  );
}; 