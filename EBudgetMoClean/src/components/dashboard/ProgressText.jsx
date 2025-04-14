// src/components/dashboard/ProgressText.js

import React from 'react';
import { Text, StyleSheet, View } from 'react-native';

const ProgressText = ({ income, expense }) => {
    // Calculate the percentage difference based on income and expense
    const total = income + expense;
    const percentageIncome = total > 0 ? (income / total) * 100 : 0;
    const percentageExpense = total > 0 ? (expense / total) * 100 : 0;

    const incomeColor = '#4CAF50'; // Green for income
    const expenseColor = '#F44336'; // Red for expense

    return (
        <View style={styles.container}>
            <View style={styles.row}>
                <Text style={styles.label}>Income: </Text>
                <Text style={[styles.valueText, { color: incomeColor }]}>
                     {income.toFixed(2)} {`(${Math.round(percentageIncome)}%)`}
                </Text>
            </View>

            <View style={styles.row}>
                <Text style={styles.label}>Expense: </Text>
                <Text style={[styles.valueText, { color: expenseColor }]}>
                     {expense.toFixed(2)} {`(${Math.round(percentageExpense)}%)`}
                </Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 10,
        marginHorizontal: 20,
        marginVertical: 20,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 5,
        paddingVertical: 20,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 5,
    },
    label: {
        fontSize: 22,
        color: '#000',
        fontFamily: 'MavenPro-Bold',
    },
    valueText: {
        fontSize: 22,
        color: '#333',
        fontFamily: 'MavenPro-Bold',
    },
});

export default ProgressText;
