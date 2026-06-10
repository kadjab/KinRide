import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../lib/supabase';
import { colors, spacing, typography } from '../lib/design';
import { Input } from '../components/Input';
import { Button } from '../components/Button';

export default function SetupProfileScreen() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleComplete = async () => {
    if (!fullName) {
      setError('Please enter your name');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('User not found');
        return;
      }
      const { error: updateError } = await supabase.from('profiles').upsert({
        id: user.id,
        email: user.email,
        full_name: fullName,
        phone,
        bio,
      });
      if (updateError) {
        setError(updateError.message);
        return;
      }
      router.replace('/onboarding');
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
          <Text style={styles.title}>Complete Your Profile</Text>
          <Text style={styles.subtitle}>Help others know who you are</Text>
        </View>
        <View style={styles.form}>
          <Input label="Full Name" placeholder="Your Name" value={fullName} onChangeText={setFullName} />
          <Input label="Phone (Optional)" placeholder="+47 98765432" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
          <Input label="Bio (Optional)" placeholder="Tell us about yourself..." value={bio} onChangeText={setBio} multiline numberOfLines={4} />
          {error && <Text style={styles.errorMessage}>{error}</Text>}
          <Button title="Continue" onPress={handleComplete} loading={loading} size="large" />
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
  errorMessage: { color: colors.error, fontSize: 14, textAlign: 'center' },
});
