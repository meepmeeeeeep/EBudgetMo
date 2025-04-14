// src/components/dashboard/ProfilePicture.jsx
import React from 'react';
import { Image, StyleSheet } from 'react-native';

const ProfilePicture = ({ uri }) => {
    return <Image source={{ uri }} style={styles.profilePicture} />;
};

const styles = StyleSheet.create({
    profilePicture: {
        width: 40,
        height: 40,
        borderRadius: 20,
    },
});

export default ProfilePicture;
