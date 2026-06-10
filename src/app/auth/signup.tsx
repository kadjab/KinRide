import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { colors, spacing, typography } from '../../lib/design';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';

export default function SignupScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignUp = async () => {
    if (!email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const { error: signUpError } = await supabase.auth.signUp({ email, password });
      if (signUpError) {
        setError(signUpError.message);
        return;
      }
      router.replace('/setup-profile');
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
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join KinRide</Text>
        </View>
        <View style={styles.form}>
          <Input label="Email" placeholder="your@email.com" value={email} onChangeText={setEmail} keyboardType="email-address" />
          <Input label="Password" placeholder="••••••••" value={password} onChangeText={setPassword} secureTextEntry />
          <Input label="Confirm Password" placeholder="••••••••" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry />
          {error && <Text style={styles.errorMessage}>{error}</Text>}
          <Button title="Create Account" onPress={handleSignUp} loading={loading} size="large" />
          <Button title="Back to Login" onPress={() => router.back()} variant="outline" size="large" />
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
  subtitle: { ...typography.body, color: colors.textSecondary, marginTop: spacing.sm, textAlign: 'center' },
  form: { gap: spacing.md },
  errorMessage: { color: colors.error, fontSize: 14, textAlign: 'center', marginTop: spacing.sm },
});
