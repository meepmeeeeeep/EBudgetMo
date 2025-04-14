// src/components/dashboard/NotificationBell.jsx
import React from 'react';
import { Text, TouchableOpacity } from 'react-native';

const NotificationBell = ({ onPress }) => {
    return (
        <TouchableOpacity onPress={onPress}>\
        </TouchableOpacity>
    );
};

export default NotificationBell;
