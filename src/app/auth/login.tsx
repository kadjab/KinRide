import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { colors, spacing, typography } from '../../lib/design';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) {
        setError(signInError.message);
        return;
      }
      router.replace('/(tabs)/home');
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>KinRide</Text>
          <Text style={styles.subtitle}>Intercity ridesharing</Text>
        </View>
        <View style={styles.form}>
          <Input label="Email" placeholder="your@email.com" value={email} onChangeText={setEmail} keyboardType="email-address" />
          <Input label="Password" placeholder="••••••••" value={password} onChangeText={setPassword} secureTextEntry />
          {error && <Text style={styles.errorMessage}>{error}</Text>}
          <Button title="Sign In" onPress={handleLogin} loading={loading} size="large" />
          <Button title="Create Account" onPress={() => router.push('/auth/signup')} variant="outline" size="large" />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.warmWhite },
  content: { flexGrow: 1, justifyContent: 'center', padding: spacing.lg },
  header: { alignItems: 'center', marginBottom: spacing.xl },
  title: { ...typography.h1, color: colors.midnight },
  subtitle: { ...typography.body, color: colors.textSecondary, marginTop: spacing.sm },
  form: { gap: spacing.md },
  errorMessage: { color: colors.error, fontSize: 14, textAlign: 'center', marginTop: spacing.sm },
});
