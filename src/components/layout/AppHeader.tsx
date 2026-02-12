import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppDispatch } from '../../store';
import { logout } from '../../store/slices/authSlice';
import { useNavigation } from '@react-navigation/native';

interface AppHeaderProps {
    title: string;
    showProfile?: boolean;
    showBack?: boolean;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
    title,
    showProfile = true,
    showBack = false
}) => {
    const dispatch = useAppDispatch();
    const navigation = useNavigation<any>();

    return (
        <View style={styles.container}>
            <SafeAreaView edges={['top']}>
                <View style={styles.innerContainer}>
                    <View style={styles.leftContainer}>
                        {showBack && (
                            <TouchableOpacity
                                onPress={() => navigation.goBack()}
                                style={styles.backButton}
                            >
                                <Text style={styles.backText}>←</Text>
                            </TouchableOpacity>
                        )}
                        <Text style={styles.title} numberOfLines={1}>{title}</Text>
                    </View>

                    {showProfile && (
                        <TouchableOpacity
                            onPress={() => navigation.navigate('Profile')}
                            style={styles.profileButton}
                        >
                            <Text style={styles.profileText}>Profile</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </SafeAreaView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#ffffff',
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
    },
    innerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingVertical: 16,
    },
    leftContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        marginRight: 12,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#0f172a',
    },
    backButton: {
        marginRight: 16,
        padding: 4,
    },
    backText: {
        fontSize: 24,
        color: '#0f172a',
        fontWeight: 'bold',
    },
    profileButton: {
        backgroundColor: '#f1f5f9',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
    },
    profileText: {
        color: '#475569',
        fontWeight: '600',
    },
});

export default AppHeader;
