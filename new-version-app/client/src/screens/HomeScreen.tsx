/**
 * Home Screen - React Native
 * Main navigation hub
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { useAuth } from '../hooks/useAuth';

interface MenuButton {
  id: string;
  icon: string;
  title: string;
  subtitle: string;
  color: string;
  onPress: () => void;
}

export default function HomeScreen({
  onNavigateToGameShow,
  onNavigateToProfile,
  onNavigateToStats,
}: {
  onNavigateToGameShow: () => void;
  onNavigateToProfile: () => void;
  onNavigateToStats: () => void;
}) {
  const { user } = useAuth();
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Chào buổi sáng');
    else if (hour < 18) setGreeting('Chào buổi chiều');
    else setGreeting('Chào buổi tối');
  }, []);

  const menuButtons: MenuButton[] = [
    {
      id: 'gameshow',
      icon: '🎮',
      title: 'GameShow',
      subtitle: 'Chơi 1v1 trực tiếp',
      color: '#FF6B6B',
      onPress: onNavigateToGameShow,
    },
    {
      id: 'statistics',
      icon: '📊',
      title: 'Thống Kê',
      subtitle: 'Xem tiến độ của bạn',
      color: '#4CAF50',
      onPress: onNavigateToStats,
    },
    {
      id: 'leaderboard',
      icon: '🏆',
      title: 'Xếp Hạng',
      subtitle: 'Top 10 người chơi',
      color: '#FFD700',
      onPress: () => {},
    },
    {
      id: 'profile',
      icon: '👤',
      title: 'Hồ Sơ',
      subtitle: 'Quản lý tài khoản',
      color: '#007AFF',
      onPress: onNavigateToProfile,
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.greeting}>{greeting}, 👋</Text>
          <Text style={styles.username}>
            {user?.user_metadata?.full_name || 'Người chơi'}
          </Text>
        </View>

        {/* Quick Stats */}
        <View style={styles.quickStats}>
          <QuickStatCard icon="🎮" label="Trận chơi" value="0" />
          <QuickStatCard icon="🥇" label="Chiến thắng" value="0" />
          <QuickStatCard icon="🔥" label="Streak" value="0" />
        </View>

        {/* Main Menu */}
        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>Menu Chính</Text>
          <View style={styles.menuGrid}>
            {menuButtons.map((button) => (
              <MenuButton key={button.id} button={button} />
            ))}
          </View>
        </View>

        {/* Info Banner */}
        <View style={styles.infoBanner}>
          <Text style={styles.bannerIcon}>💡</Text>
          <View>
            <Text style={styles.bannerTitle}>Mẹo Nhỏ</Text>
            <Text style={styles.bannerText}>
              Chơi hàng ngày để tăng streak và nhận thêm điểm bonus!
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function QuickStatCard({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.quickStatCard}>
      <Text style={styles.quickStatIcon}>{icon}</Text>
      <Text style={styles.quickStatValue}>{value}</Text>
      <Text style={styles.quickStatLabel}>{label}</Text>
    </View>
  );
}

function MenuButton({ button }: { button: any }) {
  return (
    <TouchableOpacity
      style={[styles.menuButton, { backgroundColor: button.color }]}
      onPress={button.onPress}
      activeOpacity={0.8}
    >
      <Text style={styles.menuButtonIcon}>{button.icon}</Text>
      <Text style={styles.menuButtonTitle}>{button.title}</Text>
      <Text style={styles.menuButtonSubtitle}>{button.subtitle}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: '#007AFF',
    paddingVertical: 24,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  greeting: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 4,
  },
  username: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  quickStats: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    marginTop: -30,
    marginBottom: 24,
  },
  quickStatCard: {
    flex: 1,
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  quickStatIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  quickStatValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  quickStatLabel: {
    fontSize: 11,
    color: '#666',
    marginTop: 2,
  },
  menuSection: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  menuButton: {
    width: '48%',
    paddingVertical: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuButtonIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  menuButtonTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
  },
  menuButtonSubtitle: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 4,
    textAlign: 'center',
  },
  infoBanner: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 32,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#FFD700',
  },
  bannerIcon: {
    fontSize: 24,
  },
  bannerTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  bannerText: {
    fontSize: 12,
    color: '#666',
    lineHeight: 18,
  },
});
