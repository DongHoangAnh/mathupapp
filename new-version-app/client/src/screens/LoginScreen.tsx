/**
 * Login Screen - React Native
 * Google OAuth authentication
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  SafeAreaView,
} from 'react-native';
import { useAuth } from '../hooks/useAuth';

export default function LoginScreen() {
  const { signInWithGoogle, loading } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    try {
      setError(null);
      await signInWithGoogle();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Login failed';
      setError(errorMessage);
      Alert.alert('Login Error', errorMessage);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Logo/Title */}
        <View style={styles.headerSection}>
          <Text style={styles.logo}>🧮</Text>
          <Text style={styles.title}>MathUp</Text>
          <Text style={styles.subtitle}>
            Thách đấu toán học với bạn bè
          </Text>
        </View>

        {/* Features */}
        <View style={styles.featuresSection}>
          <FeatureItem icon="⚡" text="Chơi 1v1 trực tiếp" />
          <FeatureItem icon="🏆" text="Tranh đấu xếp hạng" />
          <FeatureItem icon="📊" text="Theo dõi tiến độ" />
          <FeatureItem icon="🎯" text="Thách thức bạn bè" />
        </View>

        {/* Login Button */}
        <View style={styles.buttonsSection}>
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={handleGoogleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="large" />
            ) : (
              <>
                <Text style={styles.googleIcon}>🔐</Text>
                <Text style={styles.buttonText}>Đăng Nhập Với Google</Text>
              </>
            )}
          </TouchableOpacity>

          {error && <Text style={styles.errorText}>{error}</Text>}

          {/* Info Text */}
          <Text style={styles.infoText}>
            Bạn cần tài khoản Google để chơi. An toàn và nhanh chóng.
          </Text>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Made with ❤️ for Math Lovers
        </Text>
      </View>
    </SafeAreaView>
  );
}

function FeatureItem({ icon, text }: { icon: string; text: string }) {
  return (
    <View style={styles.featureItem}>
      <Text style={styles.featureIcon}>{icon}</Text>
      <Text style={styles.featureText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#007AFF',
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'space-between',
  },
  headerSection: {
    alignItems: 'center',
    marginTop: 40,
  },
  logo: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  featuresSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 20,
    gap: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureIcon: {
    fontSize: 24,
  },
  featureText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '500',
  },
  buttonsSection: {
    gap: 16,
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  primaryButton: {
    backgroundColor: '#fff',
  },
  googleIcon: {
    fontSize: 20,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  errorText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 14,
    backgroundColor: 'rgba(255, 107, 107, 0.3)',
    padding: 10,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#FF6B6B',
  },
  infoText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
  },
  footer: {
    paddingBottom: 24,
    alignItems: 'center',
  },
  footerText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 12,
  },
});
