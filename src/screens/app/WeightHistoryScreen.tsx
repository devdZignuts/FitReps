import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useAppDispatch, useAppSelector } from '../../store';
import { fetchWeightLogs } from '../../store/slices/weightSlice';
import AppHeader from '../../components/layout/AppHeader';

export default function WeightHistoryScreen() {
    const dispatch = useAppDispatch();
    const { logs, status } = useAppSelector((state) => state.weight);

    useEffect(() => {
        dispatch(fetchWeightLogs());
    }, [dispatch]);

    const calculateChange = () => {
        if (logs.length < 2) return null;
        const latest = logs[0].weight_kg;
        const first = logs[logs.length - 1].weight_kg;
        const change = latest - first;
        return {
            value: change.toFixed(1),
            isGain: change > 0,
            isLoss: change < 0
        };
    };

    const change = calculateChange();

    const renderLogItem = ({ item }: { item: any }) => (
        <View style={styles.logItem}>
            <View>
                <Text style={styles.logDate}>
                    {new Date(item.date).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                </Text>
            </View>
            <View style={styles.logWeightContainer}>
                <Text style={styles.logWeight}>{item.weight_kg}</Text>
                <Text style={styles.logUnit}>kg</Text>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <AppHeader title="Weight History" showProfile={false} showBack={true} />

            <View style={styles.summaryCard}>
                <Text style={styles.summaryLabel}>Total Change</Text>
                {change ? (
                    <View style={styles.changeContainer}>
                        <Text style={[
                            styles.changeValue,
                            change.isLoss && styles.lossText,
                            change.isGain && styles.gainText
                        ]}>
                            {change.isGain ? '+' : ''}{change.value} kg
                        </Text>
                        <Text style={styles.summarySubtext}>since first entry</Text>
                    </View>
                ) : (
                    <Text style={styles.noDataText}>More entries needed</Text>
                )}
            </View>

            {status === 'loading' && logs.length === 0 ? (
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color="#4f46e5" />
                </View>
            ) : (
                <FlatList
                    data={logs}
                    keyExtractor={(item) => item.id}
                    renderItem={renderLogItem}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyIcon}>⚖️</Text>
                            <Text style={styles.emptyTitle}>No weight logs yet</Text>
                            <Text style={styles.emptyText}>Start logging your weight on the dashboard!</Text>
                        </View>
                    }
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    summaryCard: {
        backgroundColor: '#fff',
        margin: 16,
        padding: 24,
        borderRadius: 20,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#f1f5f9',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
    },
    summaryLabel: {
        fontSize: 14,
        color: '#64748b',
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 8,
    },
    changeContainer: {
        alignItems: 'center',
    },
    changeValue: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#0f172a',
    },
    lossText: {
        color: '#10b981',
    },
    gainText: {
        color: '#ef4444',
    },
    summarySubtext: {
        fontSize: 12,
        color: '#94a3b8',
        marginTop: 4,
    },
    noDataText: {
        color: '#94a3b8',
        fontSize: 16,
        marginTop: 8,
    },
    listContent: {
        paddingHorizontal: 16,
        paddingBottom: 32,
    },
    logItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 12,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: '#f1f5f9',
    },
    logDate: {
        fontSize: 16,
        color: '#475569',
        fontWeight: '500',
    },
    logWeightContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
    },
    logWeight: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#0f172a',
    },
    logUnit: {
        fontSize: 14,
        color: '#64748b',
        marginLeft: 4,
        marginBottom: 2,
        fontWeight: '600',
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyContainer: {
        alignItems: 'center',
        marginTop: 100,
        paddingHorizontal: 40,
    },
    emptyIcon: {
        fontSize: 48,
        marginBottom: 16,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1e293b',
        marginBottom: 8,
    },
    emptyText: {
        color: '#64748b',
        textAlign: 'center',
        lineHeight: 20,
    },
});
