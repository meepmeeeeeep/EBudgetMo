// src/components/welcomeScreen/welcomeScreenPages/WelcomeImage.jsx
import React from 'react';
import { View, Image, StyleSheet } from 'react-native';

const WelcomeImage = ({ imageSource }) => {
    const hasImage = imageSource != null;

    return (
        <View style={[styles.container, !hasImage && styles.noImageContainer]}>
            {hasImage ? (
                <Image
                    source={imageSource}
                    style={styles.image}
                    resizeMode="cover"
                />
            ) : (
                <View style={styles.noImageBackground} />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: 350,
        height: 350,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    noImageContainer: {
        backgroundColor: '#dbdbdb',
        borderRadius: 999,
    },
    noImageBackground: {
        width: '100%',
        height: '100%',
    },
});

export default WelcomeImage;
