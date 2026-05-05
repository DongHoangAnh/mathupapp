/**
 * Profile Screen - React Native
 * User account and statistics
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useAuth } from '../hooks/useAuth';

interface UserStats {
  totalScore: number;
  totalMatches: number;
  wins: number;
  winRate: number;
  streak: number;
  level: number;
  points: number;
}

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUserStats();
    }
  }, [user]);

  const fetchUserStats = async () => {
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/api/gameshow/stats/${user?.id}`
      );
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <Text>Please login first</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user.user_metadata?.full_name?.[0] || 'U'}
            </Text>
          </View>
        </View>
        <Text style={styles.name}>{user.user_metadata?.full_name}</Text>
        {user.user_metadata?.grade && (
          <Text style={styles.grade}>Lớp {user.user_metadata.grade}</Text>
        )}
      </View>

      {/* Stats Grid */}
      {stats && (
        <>
          <View style={styles.statsGrid}>
            <StatCard
              icon="🏆"
              label="Tổng Điểm"
              value={stats.totalScore}
            />
            <StatCard
              icon="🎮"
              label="Trận Chơi"
              value={stats.totalMatches}
            />
            <StatCard
              icon="🥇"
              label="Chiến Thắng"
              value={stats.wins}
            />
            <StatCard
              icon="📈"
              label="Tỷ Lệ Thắng"
              value={`${stats.winRate.toFixed(1)}%`}
            />
          </View>

          {/* Details */}
          <View style={styles.detailsBox}>
            <DetailRow icon="🔥" label="Streak" value={`${stats.streak} ngày`} />
            <DetailRow icon="⭐" label="Level" value={`Level ${stats.level}`} />
            <DetailRow icon="✨" label="Điểm XP" value={stats.points} />
          </View>
        </>
      )}

      {/* Menu Items */}
      <View style={styles.menuBox}>
        <MenuItem
          icon="📊"
          label="Xem Chi Tiết Thống Kê"
          onPress={() => {}}
        />
        <MenuItem
          icon="⚙️"
          label="Cài Đặt"
          onPress={() => {}}
        />
        <MenuItem
          icon="❓"
          label="Trợ Giúp"
          onPress={() => {}}
        />
        <MenuItem
          icon="🚪"
          label="Đăng Xuất"
          onPress={handleSignOut}
          isDanger
        />
      </View>
    </ScrollView>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string | number;
}) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statIcon}>{icon}</Text>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string | number;
}) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailIcon}>{icon}</Text>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

function MenuItem({
  icon,
  label,
  onPress,
  isDanger = false,
}: {
  icon: string;
  label: string;
  onPress: () => void;
  isDanger?: boolean;
}) {
  return (
    <TouchableOpacity
      style={[styles.menuItem, isDanger && styles.menuItemDanger]}
      onPress={onPress}
    >
      <Text style={styles.menuIcon}>{icon}</Text>
      <Text style={[styles.menuLabel, isDanger && styles.menuLabelDanger]}>
        {label}
      </Text>
      <Text style={styles.menuArrow}>›</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#007AFF',
    paddingVertical: 24,
    paddingHorizontal: 16,
    alignItems: 'center',
    paddingTop: 40,
  },
  avatarContainer: {
    marginBottom: 12,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  grade: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8,
    gap: 8,
  },
  statCard: {
    flex: 1,
    minWidth: '48%',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 8,
    marginVertical: 8,
  },
  statIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  detailsBox: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginVertical: 12,
    borderRadius: 12,
    padding: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  detailIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  detailLabel: {
    flex: 1,
    fontSize: 14,
    color: '#666',
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  menuBox: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginVertical: 12,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 32,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  menuItemDanger: {
    backgroundColor: 'rgba(255, 107, 107, 0.05)',
  },
  menuIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  menuLabel: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  menuLabelDanger: {
    color: '#FF6B6B',
  },
  menuArrow: {
    fontSize: 20,
    color: '#ccc',
  },
});
