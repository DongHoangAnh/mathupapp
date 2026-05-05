/**
 * GameShow Screen - React Native
 * Multiplayer 1v1 math quiz game
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { useGameShowWS } from '../hooks/useGameShowWS';
import { generateQuestions } from '../services/questionGenerator';
import GameQuestion from '../components/GameQuestion';
import PlayerCard from '../components/PlayerCard';
import GameResults from '../components/GameResults';

interface GameShowScreenProps {
  userId: string;
  displayName: string;
  grade?: string;
  totalScore?: number;
  winRate?: number;
}

export default function GameShowScreen({
  userId,
  displayName,
  grade,
  totalScore = 0,
  winRate = 0,
}: GameShowScreenProps) {
  // WebSocket hook for game
  const { state, joinQueue, leaveQueue, submitAnswer } = useGameShowWS(
    userId,
    displayName,
    grade,
    totalScore,
    winRate
  );

  const [questions, setQuestions] = useState<any[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load questions when match starts
  useEffect(() => {
    if (state.phase === 'playing' && questions.length === 0) {
      const qs = generateQuestions(10);
      setQuestions(qs);
    }
  }, [state.phase]);

  // Handle answer submission
  const handleSubmitAnswer = async (answer: string) => {
    if (!state.roomId || !state.questions) return;

    setIsSubmitting(true);
    setSelectedAnswer(answer);

    try {
      submitAnswer(state.currentQuestionIndex, answer);

      // Move to next question after delay
      setTimeout(() => {
        setSelectedAnswer(null);
        setIsSubmitting(false);
      }, 1000);
    } catch (error) {
      Alert.alert('Error', 'Failed to submit answer');
      setIsSubmitting(false);
    }
  };

  const handlePlayAgain = () => {
    setQuestions([]);
    setSelectedAnswer(null);
    joinQueue();
  };

  // Render based on game phase
  switch (state.phase) {
    case 'idle':
      return (
        <View style={styles.container}>
          <View style={styles.centerContent}>
            <Text style={styles.title}>🎮 GameShow</Text>
            <Text style={styles.subtitle}>
              Thách đấu với người chơi khác
            </Text>

            <TouchableOpacity
              style={styles.button}
              onPress={joinQueue}
              disabled={state.loading}
            >
              {state.loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Tìm Đối Thủ</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      );

    case 'queued':
      return (
        <View style={styles.container}>
          <View style={styles.centerContent}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.subtitle}>
              Đang tìm đối thủ ({state.queuePosition || 'chờ'})...
            </Text>

            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={leaveQueue}
            >
              <Text style={styles.buttonText}>Huỷ</Text>
            </TouchableOpacity>
          </View>
        </View>
      );

    case 'match_found':
      return (
        <View style={styles.container}>
          <View style={styles.centerContent}>
            <Text style={styles.title}>⚡ Tìm thấy đối thủ!</Text>
            <Text style={styles.subtitle}>Chuẩn bị bắt đầu...</Text>
            <ActivityIndicator size="large" color="#FF6B6B" />
          </View>
        </View>
      );

    case 'playing': {
      if (!state.questions || questions.length === 0) {
        return (
          <View style={styles.container}>
            <ActivityIndicator size="large" color="#007AFF" />
          </View>
        );
      }

      const currentQuestion = state.questions[state.currentQuestionIndex];

      return (
        <ScrollView style={styles.container}>
          {/* Score Header */}
          <View style={styles.header}>
            <View style={styles.scoreRow}>
              <Text style={styles.scoreLabel}>Bạn</Text>
              <Text style={styles.scoreValue}>{state.myScore || 0}</Text>
            </View>
            <View style={styles.scoreRow}>
              <Text style={styles.scoreLabel}>Đối Thủ</Text>
              <Text style={styles.scoreValue}>{state.opponentScore || 0}</Text>
            </View>
          </View>

          {/* Question Counter */}
          <Text style={styles.questionCounter}>
            Câu {state.currentQuestionIndex + 1}/10
          </Text>

          {/* Question */}
          <GameQuestion
            question={currentQuestion}
            selectedAnswer={selectedAnswer}
            onSelectAnswer={handleSubmitAnswer}
            isDisabled={isSubmitting}
          />

          {/* Opponent Status */}
          {state.opponentProgress && (
            <View style={styles.opponentStatus}>
              <Text style={styles.statusText}>
                Đối thủ: Câu {state.opponentProgress.currentQuestion + 1}
              </Text>
            </View>
          )}
        </ScrollView>
      );
    }

    case 'game_over':
      return (
        <GameResults
          playerScore={state.myScore || 0}
          opponentScore={state.opponentScore || 0}
          playerTime={state.myTotalTime || 0}
          opponentTime={state.opponentTotalTime || 0}
          onPlayAgain={handlePlayAgain}
        />
      );

    case 'opponent_disconnected':
      return (
        <View style={styles.container}>
          <View style={styles.centerContent}>
            <Text style={styles.title}>😞 Đối Thủ Rời Đi</Text>
            <Text style={styles.subtitle}>Bạn thắng!</Text>
            <Text style={styles.scoreDisplay}>+100 điểm</Text>

            <TouchableOpacity style={styles.button} onPress={handlePlayAgain}>
              <Text style={styles.buttonText}>Chơi Lại</Text>
            </TouchableOpacity>
          </View>
        </View>
      );

    default:
      return (
        <View style={styles.container}>
          <Text>Trạng thái không xác định</Text>
        </View>
      );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
    marginTop: 16,
    minWidth: 200,
  },
  cancelButton: {
    backgroundColor: '#FF6B6B',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
  },
  scoreRow: {
    alignItems: 'center',
  },
  scoreLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  scoreValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  questionCounter: {
    fontSize: 14,
    color: '#999',
    marginBottom: 16,
    textAlign: 'center',
  },
  opponentStatus: {
    marginTop: 24,
    padding: 12,
    backgroundColor: '#E8F5E9',
    borderRadius: 8,
    marginBottom: 24,
  },
  statusText: {
    fontSize: 14,
    color: '#2E7D32',
    textAlign: 'center',
  },
  scoreDisplay: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginVertical: 16,
  },
});
