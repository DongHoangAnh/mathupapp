/**
 * GameQuestion Component - React Native
 * Displays a single math question with answer options
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';

interface GameQuestionProps {
  question: {
    id: string;
    text: string;
    options: string[];
    correctAnswer: string;
    type: 'arithmetic' | 'comparison';
  };
  selectedAnswer: string | null;
  onSelectAnswer: (answer: string) => void;
  isDisabled: boolean;
}

export default function GameQuestion({
  question,
  selectedAnswer,
  onSelectAnswer,
  isDisabled,
}: GameQuestionProps) {
  const getOptionStyle = (option: string) => {
    if (!selectedAnswer) {
      return styles.optionDefault;
    }

    if (option === question.correctAnswer) {
      return styles.optionCorrect;
    }

    if (option === selectedAnswer && option !== question.correctAnswer) {
      return styles.optionWrong;
    }

    return styles.optionDefault;
  };

  const getOptionTextStyle = (option: string) => {
    if (!selectedAnswer) {
      return styles.optionTextDefault;
    }

    if (option === question.correctAnswer) {
      return styles.optionTextCorrect;
    }

    if (option === selectedAnswer && option !== question.correctAnswer) {
      return styles.optionTextWrong;
    }

    return styles.optionTextDefault;
  };

  return (
    <View style={styles.container}>
      {/* Question Text */}
      <View style={styles.questionBox}>
        <Text style={styles.questionText}>{question.text}</Text>
      </View>

      {/* Answer Options */}
      <View style={styles.optionsContainer}>
        {question.options.map((option, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.option, getOptionStyle(option)]}
            onPress={() => !isDisabled && onSelectAnswer(option)}
            disabled={isDisabled || !!selectedAnswer}
            activeOpacity={0.7}
          >
            <Text style={[styles.optionText, getOptionTextStyle(option)]}>
              {option}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Feedback */}
      {selectedAnswer && (
        <View
          style={[
            styles.feedback,
            selectedAnswer === question.correctAnswer
              ? styles.feedbackCorrect
              : styles.feedbackWrong,
          ]}
        >
          <Text
            style={[
              styles.feedbackText,
              selectedAnswer === question.correctAnswer
                ? styles.feedbackTextCorrect
                : styles.feedbackTextWrong,
            ]}
          >
            {selectedAnswer === question.correctAnswer ? '✓ Đúng!' : '✗ Sai'}
          </Text>
          {selectedAnswer !== question.correctAnswer && (
            <Text style={styles.feedbackSubtext}>
              Đáp án đúng: {question.correctAnswer}
            </Text>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  questionBox: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  questionText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  optionsContainer: {
    gap: 12,
  },
  option: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: 'center',
  },
  optionDefault: {
    backgroundColor: '#fff',
    borderColor: '#ddd',
  },
  optionCorrect: {
    backgroundColor: '#4CAF50',
    borderColor: '#2E7D32',
  },
  optionWrong: {
    backgroundColor: '#FF6B6B',
    borderColor: '#C62828',
  },
  optionText: {
    fontSize: 18,
    fontWeight: '600',
  },
  optionTextDefault: {
    color: '#333',
  },
  optionTextCorrect: {
    color: '#fff',
  },
  optionTextWrong: {
    color: '#fff',
  },
  feedback: {
    marginTop: 16,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  feedbackCorrect: {
    backgroundColor: '#E8F5E9',
  },
  feedbackWrong: {
    backgroundColor: '#FFEBEE',
  },
  feedbackText: {
    fontSize: 16,
    fontWeight: '600',
  },
  feedbackTextCorrect: {
    color: '#2E7D32',
  },
  feedbackTextWrong: {
    color: '#C62828',
  },
  feedbackSubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
});
