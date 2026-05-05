/**
 * GameResults Component - React Native
 * Displays game results and winner
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';

interface GameResultsProps {
  playerScore: number;
  opponentScore: number;
  playerTime: number;
  opponentTime: number;
  onPlayAgain: () => void;
}

export default function GameResults({
  playerScore,
  opponentScore,
  playerTime,
  opponentTime,
  onPlayAgain,
}: GameResultsProps) {
  const playerWon = playerScore > opponentScore;
  const isDraw = playerScore === opponentScore;

  const formatTime = (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    return `${minutes}:${(seconds % 60).toString().padStart(2, '0')}`;
  };

  const getWinnerMessage = (): string => {
    if (isDraw) return 'Hoà!';
    return playerWon ? '🎉 Bạn Thắng!' : '😢 Bạn Thua';
  };

  const getWinnerColor = (): string => {
    if (isDraw) return '#FF9800';
    return playerWon ? '#4CAF50' : '#FF6B6B';
  };

  return (
    <ScrollView style={styles.container}>
      {/* Winner Message */}
      <View style={styles.resultHeader}>
        <Text style={[styles.resultTitle, { color: getWinnerColor() }]}>
          {getWinnerMessage()}
        </Text>
      </View>

      {/* Score Comparison */}
      <View style={styles.scoreComparison}>
        {/* Player Card */}
        <View style={styles.playerCard}>
          <Text style={styles.playerLabel}>Bạn</Text>
          <Text style={styles.playerScore}>{playerScore}</Text>
          <View style={styles.scoreDetail}>
            <Text style={styles.detailLabel}>Điểm</Text>
            <Text style={styles.detailValue}>{playerScore * 10}</Text>
          </View>
          <View style={styles.scoreDetail}>
            <Text style={styles.detailLabel}>Thời gian</Text>
            <Text style={styles.detailValue}>{formatTime(playerTime)}</Text>
          </View>
          {playerWon && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>👑 Winner</Text>
            </View>
          )}
        </View>

        {/* VS */}
        <View style={styles.vsContainer}>
          <Text style={styles.vsText}>VS</Text>
        </View>

        {/* Opponent Card */}
        <View style={styles.playerCard}>
          <Text style={styles.playerLabel}>Đối Thủ</Text>
          <Text style={styles.playerScore}>{opponentScore}</Text>
          <View style={styles.scoreDetail}>
            <Text style={styles.detailLabel}>Điểm</Text>
            <Text style={styles.detailValue}>{opponentScore * 10}</Text>
          </View>
          <View style={styles.scoreDetail}>
            <Text style={styles.detailLabel}>Thời gian</Text>
            <Text style={styles.detailValue}>{formatTime(opponentTime)}</Text>
          </View>
          {!playerWon && !isDraw && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>👑 Winner</Text>
            </View>
          )}
        </View>
      </View>

      {/* Stats Summary */}
      <View style={styles.summaryBox}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Câu Trả Lời Đúng</Text>
          <Text style={styles.summaryValue}>
            {playerScore}/10 vs {opponentScore}/10
          </Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Tốc Độ</Text>
          <Text style={styles.summaryValue}>
            {formatTime(playerTime)} vs {formatTime(opponentTime)}
          </Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Tổng Điểm Nhận</Text>
          <Text style={[styles.summaryValue, styles.pointsEarned]}>
            +{Math.max(playerScore * 10, 50)}
          </Text>
        </View>
      </View>

      {/* Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.primaryButton]}
          onPress={onPlayAgain}
        >
          <Text style={styles.buttonText}>🔄 Chơi Trận Mới</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, styles.secondaryButton]}>
          <Text style={styles.secondaryButtonText}>📊 Xem Thống Kê</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  resultHeader: {
    paddingVertical: 24,
    alignItems: 'center',
    marginBottom: 24,
  },
  resultTitle: {
    fontSize: 36,
    fontWeight: 'bold',
  },
  scoreComparison: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 24,
    gap: 12,
  },
  playerCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  playerLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    fontWeight: '600',
  },
  playerScore: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 12,
  },
  scoreDetail: {
    marginVertical: 4,
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 12,
    color: '#999',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  badge: {
    backgroundColor: '#FFD700',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    marginTop: 8,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
  },
  vsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
  },
  vsText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#999',
  },
  summaryBox: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  pointsEarned: {
    color: '#4CAF50',
    fontSize: 16,
  },
  buttonContainer: {
    gap: 12,
    marginBottom: 24,
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#007AFF',
  },
  secondaryButton: {
    backgroundColor: '#f0f0f0',
    borderWidth: 2,
    borderColor: '#ddd',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
});
