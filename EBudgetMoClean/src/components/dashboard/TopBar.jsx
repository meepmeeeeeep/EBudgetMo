import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import ProfilePicture from './ProfilePicture';
import Username from './Username';
import NotificationBell from './NotificationBell';

const TopBar = ({ username, profilePictureUri, onNotificationPress }) => {
    return (
        <View style={styles.container}>
            <View style={styles.profileContainer}>
                {/* Profile Picture */}
                <ProfilePicture uri={profilePictureUri} />
                {/* Username */}
                <Username name={username} />
            </View>
            {/* Notification Bell */}
            <NotificationBell onPress={onNotificationPress} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 20,
        paddingHorizontal: 20,
        paddingVertical: 10,
        backgroundColor: '#1e3a8a',
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
    profileContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    profilePicPlaceholder: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#dcdcdc',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
    },
    profileEmoji: {
        fontSize: 20,
    },
    username: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    bell: {
        fontSize: 20,
    },
});

export default TopBar;
