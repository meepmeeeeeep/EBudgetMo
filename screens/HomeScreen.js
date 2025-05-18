import React, { useState, useEffect } from 'react';
import {
 View,
 Text,
 StyleSheet,
 Image,
 ScrollView,
 TouchableOpacity,
 TextInput,
 StatusBar,
 Modal,
 Alert,
 SafeAreaView,
 Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useBudget } from './BudgetContext';
import { useBills } from './BillsContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BILLS_STORAGE_KEY = 'recurring_bills';

// Add this shared styles object that can be exported
export const sharedStyles = StyleSheet.create({
  screenHeader: {
    width: '100%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eaeaea',
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 0,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
});

const HomeScreen = ({ navigation }) => {
 const { 
   currentBudget, 
   updateBudget, 
   getCurrentMonthData, 
   getPreviousMonthData, 
   resetToCurrentMonth,
   monthlyData 
 } = useBudget();
 const { upcomingBills, refreshBills } = useBills();
 const [totalExpenses, setTotalExpenses] = useState(0);
 const [currentSavings, setCurrentSavings] = useState(0);
 const [quickBudgetModalVisible, setQuickBudgetModalVisible] = useState(false);
 const [tempBudget, setTempBudget] = useState(currentBudget.toString());
 const [budgetComparison, setBudgetComparison] = useState({ percentage: 0, isIncrease: true });
 const [currentMonthData, setCurrentMonthData] = useState(null);
 const [notificationsModalVisible, setNotificationsModalVisible] = useState(false);
 const [notifications, setNotifications] = useState([]);

 // Reset to current month only on mount
 useEffect(() => {
   // Reset to current month on initial mount
   resetToCurrentMonth();
   // Initial bills refresh
   refreshBills();
 }, []);

 // Add a focus listener to refresh bills
 useEffect(() => {
   const unsubscribe = navigation.addListener('focus', () => {
     resetToCurrentMonth();
     refreshBills();
     checkNotifications();
   });

   return unsubscribe;
 }, [navigation, resetToCurrentMonth, refreshBills]);

 // Load current month data
 useEffect(() => {
   const loadCurrentData = () => {
     const data = getCurrentMonthData();
     console.log('Current month data loaded:', data);
     setCurrentMonthData(data);
     
     if (data) {
       // Update current budget from the data
       if (data.budget) {
         updateBudget(data.budget);
       }
       
       // Calculate total expenses
       const currentExpenses = Array.isArray(data.expenses) ? data.expenses : [];
       const currentTotal = currentExpenses.reduce((sum, expense) => sum + (expense?.amount || 0), 0);
       setTotalExpenses(currentTotal);
       
       // Get previous month data for comparison
       const previousData = getPreviousMonthData();
       if (previousData) {
         const previousExpenses = Array.isArray(previousData.expenses) ? previousData.expenses : [];
         const previousTotal = previousExpenses.reduce((sum, expense) => sum + (expense?.amount || 0), 0);
         const difference = currentTotal - previousTotal;
         const percentage = previousTotal === 0 ? 0 : (difference / previousTotal) * 100;
         
         setBudgetComparison({
           percentage: Math.abs(percentage),
           isIncrease: difference >= 0
         });
       }
     }
   };

   loadCurrentData();
   
   // Set up an interval to refresh data every minute
   const intervalId = setInterval(loadCurrentData, 60000);
   
   return () => clearInterval(intervalId);
 }, [getCurrentMonthData, getPreviousMonthData]); // Remove currentBudget dependency

 // Update savings whenever expenses or budget changes
 useEffect(() => {
   setCurrentSavings(Math.max(0, currentBudget - totalExpenses));
 }, [currentBudget, totalExpenses]);

 // Update tempBudget when currentBudget changes
 useEffect(() => {
   setTempBudget(currentBudget.toString());
 }, [currentBudget]);

 // Modify checkNotifications to include category
 const checkNotifications = () => {
   const newNotifications = [];
   
   // Check for upcoming bills (due in 3 days or less)
   const urgentBills = upcomingBills.filter(bill => bill.daysUntilDue <= 3);
   urgentBills.forEach(bill => {
     newNotifications.push({
       id: `bill-${bill.id}`,
       type: 'bill',
       category: bill.category,
       message: `${bill.name} payment due in ${bill.daysUntilDue} ${bill.daysUntilDue === 1 ? 'day' : 'days'}`,
       amount: bill.amount,
       read: false,
       timestamp: new Date().toISOString()
     });
   });

   // Check budget status (if used more than 80% of budget)
   const budgetPercentage = (totalExpenses / currentBudget) * 100;
   if (budgetPercentage >= 80 && budgetPercentage < 100) {
     newNotifications.push({
       id: 'budget-warning',
       type: 'budget',
       category: 'budget',
       message: `You've used ${Math.round(budgetPercentage)}% of your monthly budget`,
       percentage: budgetPercentage,
       read: false,
       timestamp: new Date().toISOString()
     });
   } else if (budgetPercentage >= 100) {
     newNotifications.push({
       id: 'budget-exceeded',
       type: 'budget',
       category: 'budget',
       message: 'You have exceeded your monthly budget',
       percentage: budgetPercentage,
       read: false,
       timestamp: new Date().toISOString()
     });
   }

   setNotifications(newNotifications);
 };

 // Add effect to check notifications when dependencies change
 useEffect(() => {
   checkNotifications();
 }, [upcomingBills, totalExpenses, currentBudget]);

 // Add effect to refresh bills periodically
 useEffect(() => {
   // Initial refresh
   refreshBills();
   
   // Set up interval to refresh bills every minute
   const intervalId = setInterval(() => {
     refreshBills();
     checkNotifications();
   }, 60000);
   
   return () => clearInterval(intervalId);
 }, [refreshBills]);

 const handleUpdateBudget = () => {
   const newBudget = parseFloat(tempBudget);
   if (isNaN(newBudget) || newBudget < 0) {
     Alert.alert('Invalid Budget', 'Please enter a valid budget amount');
     return;
   }
   updateBudget(newBudget);
   setQuickBudgetModalVisible(false);
 };

 const openBudgetModal = () => {
   setTempBudget(currentBudget.toString());
   setQuickBudgetModalVisible(true);
 };

 const handleViewAllBills = () => {
   navigation.navigate('BillsTab');
 };

 const dismissNotification = (notificationId) => {
   setNotifications(prevNotifications => 
     prevNotifications.filter(notification => notification.id !== notificationId)
   );
 };

 const clearAllNotifications = () => {
   setNotifications([]);
   setNotificationsModalVisible(false);
 };

  return (
   <SafeAreaView style={styles.safeArea}>
     <StatusBar 
       barStyle="dark-content"
       backgroundColor="#ffffff"
       translucent={true}
     />
     <View style={[styles.mainContainer, { paddingTop: StatusBar.currentHeight }]}>
       {/* Header with Notification */}
       <View style={sharedStyles.screenHeader}>
         <View style={sharedStyles.headerContent}>
           <View style={styles.headerIconPlaceholder} />
           <Text style={sharedStyles.screenTitle}>Welcome back!</Text>
           <TouchableOpacity 
             style={styles.headerButton}
             onPress={() => setNotificationsModalVisible(true)}
           >
             <Ionicons 
               name={notifications.length > 0 ? "notifications" : "notifications-outline"} 
               size={24} 
               color="#5F9EA0" 
             />
             {notifications.length > 0 && (
               <View style={styles.notificationBadge}>
                 <Text style={styles.notificationBadgeText}>{notifications.length}</Text>
               </View>
             )}
           </TouchableOpacity>
         </View>
       </View>

       {/* Notifications Modal */}
       <Modal
         animationType="slide"
         transparent={true}
         visible={notificationsModalVisible}
         onRequestClose={() => setNotificationsModalVisible(false)}
       >
         <View style={styles.modalContainer}>
           <View style={styles.notificationsModal}>
             <View style={styles.modalHeader}>
               <Text style={styles.modalTitle}>Notifications</Text>
               <View style={styles.modalActions}>
                 {notifications.length > 0 && (
                   <TouchableOpacity 
                     style={styles.clearAllButton}
                     onPress={clearAllNotifications}
                   >
                     <Text style={styles.clearAllText}>Clear All</Text>
                   </TouchableOpacity>
                 )}
                 <TouchableOpacity 
                   style={styles.closeButton}
                   onPress={() => setNotificationsModalVisible(false)}
                 >
                   <Ionicons name="close" size={24} color="#333" />
                 </TouchableOpacity>
               </View>
             </View>

             <ScrollView style={styles.notificationsList}>
               {notifications.length === 0 ? (
                 <View style={styles.emptyNotifications}>
                   <Ionicons name="notifications-off-outline" size={48} color="#999" />
                   <Text style={styles.emptyNotificationsText}>No notifications</Text>
                 </View>
               ) : (
                 notifications.map(notification => (
                   <View key={notification.id} style={styles.notificationItem}>
                     <View style={styles.notificationContent}>
                       <View style={styles.notificationHeader}>
                         <View style={[
                           styles.categoryIconContainer,
                           { backgroundColor: notification.type === 'budget' ? '#FF3B30' : getCategoryColor(notification.category) }
                         ]}>
                           <Ionicons 
                             name={notification.type === 'budget' ? 'wallet' : getCategoryIcon(notification.category)} 
                             size={20} 
                             color="white"
                           />
                         </View>
                         <Text style={styles.notificationText}>
                           {notification.message}
                         </Text>
                       </View>
                       <TouchableOpacity
                         style={styles.dismissButton}
                         onPress={() => dismissNotification(notification.id)}
                       >
                         <Ionicons name="close-circle" size={20} color="#999" />
                       </TouchableOpacity>
                     </View>
                     <Text style={styles.notificationTime}>
                       {new Date(notification.timestamp).toLocaleTimeString([], { 
                         hour: '2-digit', 
                         minute: '2-digit' 
                       })}
                     </Text>
                   </View>
                 ))
               )}
             </ScrollView>
           </View>
         </View>
       </Modal>

       <ScrollView 
         style={styles.container}
         contentContainerStyle={styles.scrollContent}
         showsVerticalScrollIndicator={false}
       >
         {/* Current Balance */}
         <View style={styles.section}>
           <View style={styles.sectionHeader}>
             <Text style={sharedStyles.sectionTitle}>Monthly Budget</Text>
             <TouchableOpacity 
               style={styles.editBudgetButton}
               onPress={openBudgetModal}
             >
               <Ionicons name="create-outline" size={20} color="#5F9EA0" />
             </TouchableOpacity>
           </View>
           <View style={styles.featuredContainer}>
             <View style={styles.budgetInfo}>
               <Text style={styles.budgetAmount}>₱{formatCurrency(currentBudget)}</Text>
               <View style={styles.budgetUsage}>
                 <Text style={styles.budgetUsageText}>
                   {Math.round((totalExpenses / currentBudget) * 100)}% used
                 </Text>
                 <Text style={styles.remainingBudget}>
                   ₱{formatCurrency(currentBudget - totalExpenses)} remaining
                 </Text>
               </View>
               {budgetComparison.percentage > 0 && (
                 <View style={styles.comparisonContainer}>
                   <Ionicons 
                     name={budgetComparison.isIncrease ? 'trending-up' : 'trending-down'} 
                     size={16} 
                     color={budgetComparison.isIncrease ? '#FF3B30' : '#4CD964'} 
                     style={styles.trendIcon}
                   />
                   <Text style={[
                     styles.comparisonText,
                     { color: budgetComparison.isIncrease ? '#FF3B30' : '#4CD964' }
                   ]}>
                     {budgetComparison.percentage.toFixed(1)}% {budgetComparison.isIncrease ? 'higher' : 'lower'} than last month
                   </Text>
                 </View>
               )}
             </View>
           </View>
           <View style={styles.budgetProgressContainer}>
             <View style={styles.budgetProgressBar}>
               <View 
                 style={[
                   styles.budgetProgress, 
                   {
                     width: `${Math.min(100, (totalExpenses / currentBudget) * 100)}%`,
                     backgroundColor: totalExpenses > currentBudget ? '#FF3B30' : '#5F9EA0'
                   }
                 ]} 
               />
             </View>
           </View>
         </View>

         {/* Savings vs Expense */}
         <View style={styles.section}>
           <Text style={sharedStyles.sectionTitle}>Savings vs Expense</Text>
           <View style={{ marginBottom: 10, flexDirection: 'row', justifyContent: 'center' }}>
             {[
               { 
                 title: 'Savings', 
                 progress: Math.round((currentSavings / currentBudget) * 100), 
                 color: '#4CD964',
                 icon: 'wallet-outline'
               },
               { 
                 title: 'Expense', 
                 progress: Math.round((totalExpenses / currentBudget) * 100), 
                 color: '#FF3B30',
                 icon: 'cash-outline'
               }
             ].map((item, index) => (
               <View key={index} style={styles.readingCard}>
                 <View style={[styles.readingCardIcon, { backgroundColor: item.color }]}>
                   <Ionicons name={item.icon} size={24} color="#fff" />
                 </View>
                 <Text style={styles.readingCardTitle}>{item.title}</Text>
                 <View style={styles.progressContainer}>
                   <View style={[styles.progressBar, { 
                     width: `${Math.min(100, item.progress)}%`,
                     backgroundColor: item.color
                   }]} />
                 </View>
                 <Text style={styles.progressText}>₱{formatCurrency(item.title === 'Savings' ? currentSavings : totalExpenses)}</Text>
                 <Text style={styles.percentageText}>{item.progress}% of budget</Text>
               </View>
             ))}
           </View>
         </View>
       
         {/* Past Months Summary */}
         <View style={styles.section}>
           <Text style={sharedStyles.sectionTitle}>Past Months Summary</Text>
           {(() => {
             // Get past 5 months
             const getPastMonths = () => {
               const months = [];
               const currentDate = new Date();
               const currentMonth = currentDate.toISOString().slice(0, 7);
               
               for (let i = 1; i <= 5; i++) {
                 const date = new Date();
                 date.setMonth(date.getMonth() - i);
                 months.push(date.toISOString().slice(0, 7));
               }
               return months;
             };

             const pastMonths = getPastMonths();
             
             return pastMonths.map((monthKey) => {
               const monthData = monthlyData[monthKey];
               const hasData = !!monthData;
               
               // Calculate values if data exists
               const budget = hasData ? monthData.budget : 0;
               const expenses = hasData ? monthData.expenses.reduce((sum, exp) => sum + (exp?.amount || 0), 0) : 0;
               const savings = hasData ? Math.max(0, budget - expenses) : 0;

               return (
                 <View key={monthKey} style={styles.monthSummaryCard}>
                   <View style={styles.monthSummaryHeader}>
                     <Text style={styles.monthSummaryTitle}>
                       {new Date(monthKey + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                     </Text>
                     {!hasData && (
                       <Text style={styles.noDataText}>No Data Available</Text>
                     )}
                   </View>
                   
                   {hasData ? (
                     <View style={styles.monthSummaryContent}>
                       <View style={styles.summaryItem}>
                         <Text style={styles.summaryLabel}>Budget</Text>
                         <Text style={styles.summaryValue}>₱{formatCurrency(budget)}</Text>
                       </View>
                       
                       <View style={styles.summaryItem}>
                         <Text style={styles.summaryLabel}>Expenses</Text>
                         <Text style={[styles.summaryValue, styles.expenseValue]}>
                           ₱{formatCurrency(expenses)}
                         </Text>
                       </View>
                       
                       <View style={styles.summaryItem}>
                         <Text style={styles.summaryLabel}>Savings</Text>
                         <Text style={[
                           styles.summaryValue,
                           { color: savings > 0 ? '#4CD964' : '#333' }
                         ]}>₱{formatCurrency(savings)}</Text>
                       </View>

                       <View style={styles.progressContainer}>
                         <View style={styles.progressLabelContainer}>
                           <Text style={styles.progressLabel}>Budget Used:</Text>
                           <Text style={[
                             styles.progressPercentage,
                             { color: expenses > budget ? '#FF3B30' : '#5F9EA0' }
                           ]}>
                             {Math.round((expenses / budget) * 100)}%
                           </Text>
                         </View>
                         <View style={styles.monthProgressBar}>
                           <View style={[
                             styles.monthProgress,
                             {
                               width: `${Math.min(100, (expenses / budget) * 100)}%`,
                               backgroundColor: expenses > budget ? '#FF3B30' : '#5F9EA0'
                             }
                           ]} />
                         </View>
                       </View>
                     </View>
                   ) : (
                     <View style={styles.noDataContainer}>
                       <Ionicons name="document-outline" size={14} color="#999" style={styles.noDataIcon} />
                       <Text style={styles.noDataDescription}>No financial records</Text>
                     </View>
                   )}
                 </View>
               );
             });
           })()}
         </View>
       
         {/* Upcoming Bills */}
         <View style={styles.section}>
           <View style={styles.sectionHeader}>
             <Text style={sharedStyles.sectionTitle}>Upcoming Bills</Text>
             <TouchableOpacity 
               style={styles.viewAllButton}
               onPress={handleViewAllBills}
             >
               <Text style={styles.viewAllText}>View All</Text>
               <Ionicons name="chevron-forward" size={16} color="#5F9EA0" />
             </TouchableOpacity>
           </View>
           {upcomingBills.length > 0 ? (
             <View style={styles.upcomingBillsContainer}>
               {upcomingBills.map((bill) => (
                 <View
                   key={bill.id}
                   style={styles.upcomingBillItem}
                 >
                   <View style={styles.billIconContainer}>
                     <View style={[styles.billIcon, { backgroundColor: getCategoryColor(bill.category) }]}>
                       <Ionicons name={getCategoryIcon(bill.category)} size={20} color="white" />
                     </View>
                   </View>
                   <View style={styles.billInfo}>
                     <Text style={styles.billName}>{bill.name}</Text>
                     <Text style={styles.billAmount}>₱{formatCurrency(bill.amount)}</Text>
                     <Text style={[
                       styles.billDueDate,
                       { color: bill.daysUntilDue <= 3 ? '#FF3B30' : '#FF9500' }
                     ]}>
                       Due in {bill.daysUntilDue} {bill.daysUntilDue === 1 ? 'day' : 'days'}
                     </Text>
                   </View>
                 </View>
               ))}
             </View>
           ) : (
             <View style={styles.emptyBillsContainer}>
               <Text style={styles.emptyBillsText}>No upcoming bills</Text>
             </View>
           )}
         </View>
       
         {/* Footer */}
         <View style={styles.footer}>
           <Text style={styles.footerText}>© 2025 E-Budget Mo!. All rights reserved.</Text>
           <View style={styles.footerActions}>
             <View style={styles.socialLinks}>
               <Ionicons name="logo-twitter" size={18} color="#888" style={styles.socialIcon} />
               <Ionicons name="logo-facebook" size={18} color="#888" style={styles.socialIcon} />
               <Ionicons name="logo-instagram" size={18} color="#888" style={styles.socialIcon} />
             </View>
           </View>
         </View>
       </ScrollView>

       {/* Edit Budget Quick Shortcut */}
       <Modal
         animationType="fade"
         transparent={true}
         visible={quickBudgetModalVisible}
         onRequestClose={() => setQuickBudgetModalVisible(false)}
       >
         <View style={styles.modalContainer}>
           <View style={styles.quickEditModal}>
             <View style={styles.quickEditHeader}>
               <Text style={styles.modalTitle}>Edit Monthly Budget</Text>
               <TouchableOpacity 
                 onPress={() => {
                   setQuickBudgetModalVisible(false);
                   setTempBudget(currentBudget.toString());
                 }}
               >
                 <Ionicons name="close" size={24} color="#333" />
               </TouchableOpacity>
             </View>
             
             <View style={styles.budgetInputContainer}>
               <Text style={styles.inputLabel}>Budget Amount (₱)</Text>
               <TextInput
                 style={styles.budgetInput}
                 keyboardType="numeric"
                 value={tempBudget}
                 onChangeText={setTempBudget}
                 placeholder="Enter budget amount"
               />
             </View>

             <TouchableOpacity style={styles.saveButton} onPress={handleUpdateBudget}>
               <Text style={styles.saveButtonText}>Save Changes</Text>
             </TouchableOpacity>
           </View>
         </View>
       </Modal>
     </View>
   </SafeAreaView>
 );
};

// Add these helper functions
const formatCurrency = (amount) => {
  // Convert to float and fix to 2 decimal places
  const fixedAmount = parseFloat(amount).toFixed(2);
  // Format with commas for thousands
  return parseFloat(fixedAmount).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

const getCategoryIcon = (category) => {
  const icons = {
    utilities: 'flash',
    rent: 'home',
    internet: 'wifi',
    phone: 'phone-portrait',
    insurance: 'shield-checkmark',
    subscription: 'repeat',
    education: 'school',
    healthcare: 'medical',
    others: 'ellipsis-horizontal'
  };
  return icons[category] || 'document';
};

const getCategoryColor = (category) => {
  const colors = {
    utilities: '#FF9500',
    rent: '#5856D6',
    internet: '#007AFF',
    phone: '#34C759',
    insurance: '#5F9EA0',
    subscription: '#FF2D55',
    education: '#AF52DE',
    healthcare: '#32ADE6',
    others: '#8E8E93'
  };
  return colors[category] || '#8E8E93';
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
 scrollContent: {
   flexGrow: 1,
 },
 headerIconPlaceholder: {
   width: 24,
 },
 headerButton: {
   padding: 8,
 },
 notificationBadge: {
   position: 'absolute',
   top: -5,
   right: -5,
   backgroundColor: '#FF6347',
   width: 18,
   height: 18,
   borderRadius: 9,
   justifyContent: 'center',
   alignItems: 'center',
 },
 notificationBadgeText: {
   color: 'white',
   fontSize: 10,
   fontWeight: 'bold',
 },
 section: {
   padding: 15,
   marginBottom: 10,
   backgroundColor: 'white',
   marginHorizontal: 10,
   marginTop: 10,
   borderRadius: 10,
   borderWidth: 1,
   borderColor: '#eaeaea',
 },
 sectionHeader: {
   flexDirection: 'row',
   justifyContent: 'space-between',
   alignItems: 'center',
 },
 featuredContainer: {
   flexDirection: 'row',
   justifyContent: 'space-between',
   alignItems: 'center',
   marginBottom: 15,
 },
 budgetInfo: {
   flex: 1,
 },
 budgetAmount: {
   fontSize: 32,
   fontWeight: 'bold',
   color: '#333',
   marginBottom: 8,
 },
 budgetUsage: {
   flexDirection: 'row',
   alignItems: 'center',
 },
 budgetUsageText: {
   fontSize: 14,
   color: '#666',
   marginRight: 10,
 },
 remainingBudget: {
   fontSize: 14,
   color: '#5F9EA0',
   fontWeight: '600',
 },
 editBudgetButton: {
   padding: 8,
 },
 budgetProgressContainer: {
   marginTop: 5,
 },
 budgetProgressBar: {
   height: 8,
   backgroundColor: '#f0f0f0',
   borderRadius: 4,
   overflow: 'hidden',
 },
 budgetProgress: {
   height: '100%',
   borderRadius: 4,
 },
 readingCard: {
   backgroundColor: 'white',
   borderRadius: 12,
   padding: 15,
   marginHorizontal: 8,
   flex: 1,
   maxWidth: 200,
   alignItems: 'center',
   borderWidth: 1,
   borderColor: '#eaeaea',
   marginTop: 10,
 },
 readingCardIcon: {
   width: 40,
   height: 40,
   borderRadius: 20,
   justifyContent: 'center',
   alignItems: 'center',
   marginBottom: 10,
 },
 readingCardTitle: {
   fontSize: 14,
   fontWeight: 'bold',
   color: '#333',
   marginBottom: 5,
 },
 progressContainer: {
   width: '100%',
   height: 8,
   backgroundColor: '#f0f0f0',
   borderRadius: 4,
   marginTop: 10,
   overflow: 'hidden',
 },
 progressBar: {
   height: 8,
   borderRadius: 4,
 },
 progressText: {
   fontSize: 16,
   fontWeight: 'bold',
   color: '#333',
   marginTop: 8,
 },
 percentageText: {
   fontSize: 12,
   color: '#666',
   marginTop: 4,
 },
 footer: {
   width: '100%',
   padding: 20,
   backgroundColor: 'white',
   borderTopWidth: 1,
   borderTopColor: '#eaeaea',
   marginTop: 15,
 },
 footerText: {
   fontSize: 12,
   color: '#888',
   textAlign: 'center',
   marginBottom: 10,
 },
 footerActions: {
   width: '100%',
   alignItems: 'center',
   marginTop: 10,
 },
 socialLinks: {
   flexDirection: 'row',
   justifyContent: 'center',
   marginBottom: 10,
 },
 socialIcon: {
   marginHorizontal: 10,
 },
 modalContainer: {
   flex: 1,
   backgroundColor: 'rgba(0, 0, 0, 0.5)',
   justifyContent: 'flex-end',
 },
 notificationsModal: {
   backgroundColor: 'white',
   borderTopLeftRadius: 20,
   borderTopRightRadius: 20,
   width: '100%',
   maxHeight: '80%',
   paddingTop: 20,
 },
 quickEditModal: {
   backgroundColor: 'white',
   borderTopLeftRadius: 20,
   borderTopRightRadius: 20,
   padding: 20,
   width: '100%',
   shadowColor: '#000',
   shadowOffset: { width: 0, height: -2 },
   shadowOpacity: 0.25,
   shadowRadius: 3.84,
   elevation: 5,
 },
 quickEditHeader: {
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
 budgetInputContainer: {
   marginBottom: 20,
 },
 inputLabel: {
   fontSize: 14,
   color: '#666',
   marginBottom: 8,
 },
 budgetInput: {
   borderWidth: 1,
   borderColor: '#ddd',
   borderRadius: 8,
   paddingHorizontal: 12,
   paddingVertical: 10,
   fontSize: 16,
   color: '#333',
 },
 saveButton: {
   backgroundColor: '#5F9EA0',
   padding: 15,
   borderRadius: 8,
   alignItems: 'center',
 },
 saveButtonText: {
   color: 'white',
   fontSize: 16,
   fontWeight: 'bold',
 },
 comparisonContainer: {
   flexDirection: 'row',
   alignItems: 'center',
   marginTop: 5,
 },
 trendIcon: {
   marginRight: 5,
 },
 comparisonText: {
   fontSize: 12,
   fontWeight: '600',
 },
 monthSummaryCard: {
   backgroundColor: 'white',
   borderRadius: 12,
   padding: 15,
   marginBottom: 15,
   borderWidth: 1,
   borderColor: '#eaeaea',
 },
 monthSummaryHeader: {
   flexDirection: 'row',
   justifyContent: 'space-between',
   alignItems: 'center',
   marginBottom: 15,
 },
 monthSummaryTitle: {
   fontSize: 16,
   fontWeight: 'bold',
   color: '#333',
 },
 noDataText: {
   fontSize: 12,
   color: '#999',
   fontStyle: 'italic',
 },
 monthSummaryContent: {
   gap: 10,
 },
 summaryItem: {
   flexDirection: 'row',
   justifyContent: 'space-between',
   alignItems: 'center',
 },
 summaryLabel: {
   fontSize: 14,
   color: '#666',
 },
 summaryValue: {
   fontSize: 14,
   fontWeight: '600',
   color: '#333',
 },
 monthProgressBar: {
   height: 4,
   backgroundColor: '#f0f0f0',
   borderRadius: 2,
   overflow: 'hidden',
   marginTop: 10,
 },
 monthProgress: {
   height: '100%',
   borderRadius: 2,
 },
 noDataContainer: {
   flexDirection: 'row',
   alignItems: 'center',
   justifyContent: 'center',
   paddingVertical: 8,
 },
 noDataIcon: {
   marginRight: 6,
 },
 noDataDescription: {
   fontSize: 13,
   color: '#999',
 },
 expenseValue: {
   color: '#FF3B30',
 },
 progressContainer: {
   marginTop: 12,
 },
 progressLabelContainer: {
   flexDirection: 'row',
   justifyContent: 'space-between',
   alignItems: 'center',
   marginBottom: 4,
 },
 progressLabel: {
   fontSize: 12,
   color: '#666',
 },
 progressPercentage: {
   fontSize: 12,
   fontWeight: '600',
 },
 viewAllButton: {
   flexDirection: 'row',
   alignItems: 'center',
   backgroundColor: '#f0f0f0',
   paddingHorizontal: 12,
   paddingVertical: 6,
   borderRadius: 8,
 },
 viewAllText: {
   color: '#5F9EA0',
   fontSize: 14,
   fontWeight: '600',
   marginRight: 4,
 },
 upcomingBillsContainer: {
   marginTop: 10,
 },
 upcomingBillItem: {
   flexDirection: 'row',
   alignItems: 'center',
   backgroundColor: 'white',
   borderRadius: 12,
   padding: 12,
   marginBottom: 8,
   borderWidth: 1,
   borderColor: '#eaeaea',
 },
 billIconContainer: {
   marginRight: 12,
 },
 billIcon: {
   width: 40,
   height: 40,
   borderRadius: 20,
   justifyContent: 'center',
   alignItems: 'center',
 },
 billInfo: {
   flex: 1,
 },
 billName: {
   fontSize: 16,
   fontWeight: '600',
   color: '#333',
   marginBottom: 4,
 },
 billAmount: {
   fontSize: 14,
   color: '#666',
   marginBottom: 4,
 },
 billDueDate: {
   fontSize: 12,
   fontWeight: '500',
 },
 emptyBillsContainer: {
   padding: 20,
   alignItems: 'center',
 },
 emptyBillsText: {
   color: '#666',
   fontSize: 14,
 },
 notificationsModal: {
   backgroundColor: 'white',
   borderTopLeftRadius: 20,
   borderTopRightRadius: 20,
   width: '100%',
   maxWidth: 600,
   maxHeight: '80%',
   marginHorizontal: 20,
   paddingTop: 20,
   alignSelf: 'center',
   shadowColor: '#000',
   shadowOffset: {
     width: 0,
     height: -2,
   },
   shadowOpacity: 0.25,
   shadowRadius: 3.84,
   elevation: 5,
 },
 modalHeader: {
   flexDirection: 'row',
   justifyContent: 'space-between',
   alignItems: 'center',
   paddingHorizontal: 20,
   paddingBottom: 15,
   borderBottomWidth: 1,
   borderBottomColor: '#eaeaea',
 },
 modalActions: {
   flexDirection: 'row',
   alignItems: 'center',
 },
 clearAllButton: {
   marginRight: 15,
   paddingVertical: 6,
   paddingHorizontal: 12,
   borderRadius: 6,
   backgroundColor: '#f0f0f0',
 },
 clearAllText: {
   color: '#5F9EA0',
   fontSize: 14,
   fontWeight: '600',
 },
 closeButton: {
   padding: 4,
 },
 notificationsList: {
   maxHeight: '100%',
   paddingHorizontal: 20,
 },
 notificationItem: {
   padding: 15,
   borderBottomWidth: 1,
   borderBottomColor: '#eaeaea',
 },
 notificationContent: {
   flexDirection: 'row',
   justifyContent: 'space-between',
   alignItems: 'flex-start',
   marginBottom: 8,
 },
 notificationHeader: {
   flexDirection: 'row',
   alignItems: 'center',
   flex: 1,
   marginRight: 10,
 },
 notificationText: {
   flex: 1,
   fontSize: 14,
   color: '#333',
   lineHeight: 20,
   marginLeft: 12,
 },
 notificationTime: {
   fontSize: 12,
   color: '#999',
   marginLeft: 44,
 },
 emptyNotifications: {
   alignItems: 'center',
   justifyContent: 'center',
   padding: 40,
   minHeight: 200,
 },
 emptyNotificationsText: {
   fontSize: 16,
   color: '#999',
   marginTop: 10,
 },
 categoryIconContainer: {
   width: 32,
   height: 32,
   borderRadius: 16,
   justifyContent: 'center',
   alignItems: 'center',
 },
 dismissButton: {
   padding: 4,
 },
});

export default HomeScreen;