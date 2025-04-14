// src/components/dashboard/Username.jsx
import React from 'react';
import { Text, StyleSheet } from 'react-native';

const Username = ({ name }) => {
    return <Text style={styles.username}>{name}</Text>;
};

const styles = StyleSheet.create({
    username: {
        fontSize: 22,
        marginLeft: 10,
        color: '#fff',
        fontFamily: 'MavenPro-Bold',
    },
});

export default Username;
