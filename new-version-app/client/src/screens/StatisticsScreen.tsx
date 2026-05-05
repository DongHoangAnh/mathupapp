/**
 * Statistics Screen - React Native
 * Detailed statistics and analytics
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../hooks/useAuth';

interface Stats {
  totalMatches: number;
  totalWins: number;
  winRate: number;
  totalScore: number;
  averageScore: number;
  bestStreak: number;
  currentStreak: number;
  totalTimeSpent: number;
  level: number;
  nextLevelProgress: number;
}

export default function StatisticsScreen() {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchStats();
    }
  }, [user]);

  const fetchStats = async () => {
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

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>📊 Thống Kê</Text>
        </View>

        {/* Overall Stats */}
        <View style={styles.section}>
          <SectionTitle title="Tổng Quan" />
          <StatsGrid
            stats={[
              {
                icon: '🎮',
                label: 'Trận Chơi',
                value: stats?.totalMatches || 0,
              },
              {
                icon: '🥇',
                label: 'Chiến Thắng',
                value: stats?.totalWins || 0,
              },
              {
                icon: '📈',
                label: 'Tỷ Lệ Thắng',
                value: `${stats?.winRate.toFixed(1) || 0}%`,
              },
              {
                icon: '🏆',
                label: 'Tổng Điểm',
                value: stats?.totalScore || 0,
              },
            ]}
          />
        </View>

        {/* Performance Stats */}
        <View style={styles.section}>
          <SectionTitle title="Hiệu Suất" />
          <DetailCard
            icon="📊"
            title="Điểm Trung Bình"
            value={`${stats?.averageScore || 0}`}
            subtitle="mỗi trận"
          />
          <DetailCard
            icon="🔥"
            title="Streak Tốt Nhất"
            value={`${stats?.bestStreak || 0}`}
            subtitle="ngày liên tiếp"
          />
          <DetailCard
            icon="🔥"
            title="Streak Hiện Tại"
            value={`${stats?.currentStreak || 0}`}
            subtitle="ngày"
          />
        </View>

        {/* Level & Experience */}
        <View style={styles.section}>
          <SectionTitle title="Cấp Độ & Kinh Nghiệm" />
          <LevelCard
            level={stats?.level || 1}
            progress={stats?.nextLevelProgress || 0}
          />
        </View>

        {/* Achievements */}
        <View style={styles.section}>
          <SectionTitle title="Thành Tựu" />
          <View style={styles.achievementsGrid}>
            <AchievementBadge
              emoji="🌟"
              title="Bắt Đầu"
              description="Chơi trận đầu tiên"
            />
            <AchievementBadge
              emoji="🔥"
              title="Nóng Lên"
              description="5 trận liên tiếp thắng"
            />
            <AchievementBadge
              emoji="🏅"
              title="Nhân Phẩm"
              description="Đạt 1000 điểm"
            />
            <AchievementBadge
              emoji="⭐"
              title="Sao"
              description="Level 5"
            />
          </View>
        </View>

        {/* Stats Table */}
        <View style={styles.section}>
          <SectionTitle title="Chi Tiết" />
          <StatsTable
            data={[
              { label: 'Tổng Thời Gian Chơi', value: '12h 45m' },
              { label: 'Trung Bình Mỗi Trận', value: '2m 30s' },
              { label: 'Câu Hỏi Đã Trả Lời', value: '450' },
              { label: 'Tỷ Lệ Trả Lời Đúng', value: '75%' },
            ]}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function SectionTitle({ title }: { title: string }) {
  return <Text style={styles.sectionTitle}>{title}</Text>;
}

function StatsGrid({
  stats,
}: {
  stats: Array<{ icon: string; label: string; value: string | number }>;
}) {
  return (
    <View style={styles.statsGrid}>
      {stats.map((stat, idx) => (
        <View key={idx} style={styles.statItem}>
          <Text style={styles.statIcon}>{stat.icon}</Text>
          <Text style={styles.statValue}>{stat.value}</Text>
          <Text style={styles.statLabel}>{stat.label}</Text>
        </View>
      ))}
    </View>
  );
}

function DetailCard({
  icon,
  title,
  value,
  subtitle,
}: {
  icon: string;
  title: string;
  value: string;
  subtitle: string;
}) {
  return (
    <View style={styles.detailCard}>
      <Text style={styles.detailCardIcon}>{icon}</Text>
      <View style={styles.detailCardContent}>
        <Text style={styles.detailCardTitle}>{title}</Text>
        <Text style={styles.detailCardSubtitle}>{subtitle}</Text>
      </View>
      <Text style={styles.detailCardValue}>{value}</Text>
    </View>
  );
}

function LevelCard({
  level,
  progress,
}: {
  level: number;
  progress: number;
}) {
  return (
    <View style={styles.levelCard}>
      <View style={styles.levelHeader}>
        <Text style={styles.levelIcon}>⭐</Text>
        <View>
          <Text style={styles.levelTitle}>Level {level}</Text>
          <Text style={styles.levelSubtitle}>Đến Level {level + 1}</Text>
        </View>
      </View>
      <View style={styles.progressBar}>
        <View
          style={[styles.progressFill, { width: `${Math.min(progress, 100)}%` }]}
        />
      </View>
      <Text style={styles.progressText}>{progress}%</Text>
    </View>
  );
}

function AchievementBadge({
  emoji,
  title,
  description,
}: {
  emoji: string;
  title: string;
  description: string;
}) {
  return (
    <View style={styles.achievementBadge}>
      <Text style={styles.achievementEmoji}>{emoji}</Text>
      <Text style={styles.achievementTitle}>{title}</Text>
      <Text style={styles.achievementDescription}>{description}</Text>
    </View>
  );
}

function StatsTable({
  data,
}: {
  data: Array<{ label: string; value: string }>;
}) {
  return (
    <View style={styles.statsTable}>
      {data.map((row, idx) => (
        <View key={idx} style={styles.tableRow}>
          <Text style={styles.tableLabel}>{row.label}</Text>
          <Text style={styles.tableValue}>{row.value}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: '#007AFF',
    paddingVertical: 24,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  section: {
    paddingHorizontal: 16,
    marginTop: 24,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statItem: {
    flex: 1,
    minWidth: '48%',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  statIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  detailCard: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 8,
  },
  detailCardIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  detailCardContent: {
    flex: 1,
  },
  detailCardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  detailCardSubtitle: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  detailCardValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  levelCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  levelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  levelIcon: {
    fontSize: 28,
    marginRight: 12,
  },
  levelTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  levelSubtitle: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  progressBar: {
    backgroundColor: '#eee',
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    backgroundColor: '#007AFF',
    height: '100%',
  },
  progressText: {
    fontSize: 12,
    color: '#666',
  },
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  achievementBadge: {
    width: '48%',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#eee',
  },
  achievementEmoji: {
    fontSize: 28,
    marginBottom: 4,
  },
  achievementTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  achievementDescription: {
    fontSize: 10,
    color: '#999',
    marginTop: 2,
  },
  statsTable: {
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  tableLabel: {
    fontSize: 14,
    color: '#666',
  },
  tableValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
});
