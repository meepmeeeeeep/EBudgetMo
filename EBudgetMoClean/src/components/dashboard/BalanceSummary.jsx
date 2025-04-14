// src/components/dashboard/BalanceSummary.jsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const BalanceSummary = ({ currentBalance, lastMonthBalance }) => {
    // Calculate the percentage difference
    const percentageDifference = ((currentBalance - lastMonthBalance) / lastMonthBalance) * 100;

    // Determine the color based on the percentage difference (green for positive, red for negative)
    const percentageColor = percentageDifference >= 0 ? '#4CAF50' : '#F44336'; // Green for positive, red for negative

    return (
        <View style={styles.container}>
            <Text style={styles.currentBalanceText}>Current Balance:</Text>

            {/* Current Balance */}
            <Text style={styles.balanceText}>
                {currentBalance.toFixed(2)} {/* Format balance as currency */}
            </Text>

            {/* Percentage Difference */}
            <Text style={[styles.percentageText, { color: percentageColor }]}>
                {percentageDifference > 0
                    ? `+${percentageDifference.toFixed(2)}%`
                    : `${percentageDifference.toFixed(2)}%`} from last month
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 10,
        marginHorizontal: 20,
        marginTop: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 5,
    },
    currentBalanceText: {
        fontSize: 22,
        color: '#1e3a8a',
        fontFamily: 'MavenPro-Bold',
    },
    balanceText: {
        fontSize: 38,
        color: '#1e3a8a',
        fontFamily: 'MavenPro-Bold',
    },
    percentageText: {
        fontSize: 16,
        marginTop: 5,
        fontFamily: 'MavenPro-Bold',
    },
});

export default BalanceSummary;
