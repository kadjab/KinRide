import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { colors, spacing, typography } from '../../lib/design';

interface ChatPreview {
  id: string;
  ride_id: string;
  other_user_name: string;
  last_message?: string;
  updated_at?: string;
}

export default function MessagesScreen() {
  const [chats, setChats] = useState<ChatPreview[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(React.useCallback(() => {
    fetchChats();
  }, []));

  const fetchChats = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: chatsData, error } = await supabase.from('chats').select('*').or(`driver_id.eq.${user.id},passenger_id.eq.${user.id}`);
      if (error) throw error;
      if (chatsData && chatsData.length > 0) {
        const otherUserIds = chatsData.map(c => c.driver_id === user.id ? c.passenger_id : c.driver_id);
        const { data: profiles } = await supabase.from('profiles').select('id, full_name').in('id', otherUserIds);
        const profileMap = profiles?.reduce((acc, p) => { acc[p.id] = p.full_name; return acc; }, {} as Record<string, string>) || {};
        const chatPreviews: ChatPreview[] = chatsData.map(chat => ({
          id: chat.id,
          ride_id: chat.ride_id,
          other_user_name: profileMap[chat.driver_id === user.id ? chat.passenger_id : chat.driver_id] || 'Unknown',
          updated_at: chat.created_at,
        }));
        setChats(chatPreviews);
      }
    } catch (error) {
      console.error('Error fetching chats:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderChat = ({ item }: { item: ChatPreview }) => (
    <View style={styles.chatItem}>
      <View style={styles.chatHeader}>
        <Text style={styles.chatName}>{item.other_user_name}</Text>
        <Text style={styles.timestamp}>Ride {item.ride_id.slice(0, 8)}</Text>
      </View>
      <Text style={styles.lastMessage} numberOfLines={1}>{item.last_message || 'No messages yet'}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.ember} />
        </View>
      ) : chats.length > 0 ? (
        <FlatList data={chats} keyExtractor={item => item.id} renderItem={renderChat} contentContainerStyle={styles.listContent} />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No conversations yet</Text>
          <Text style={styles.emptySubtext}>Messages will appear when you book or post rides</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.warmWhite },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContent: { padding: spacing.md },
  chatItem: { backgroundColor: colors.surface, borderRadius: 8, padding: spacing.md, marginBottom: spacing.md, borderWidth: 1, borderColor: colors.border },
  chatHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  chatName: { ...typography.body, fontWeight: '600', color: colors.midnight },
  timestamp: { ...typography.bodySmall, color: colors.textSecondary },
  lastMessage: { ...typography.bodySmall, color: colors.textSecondary },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.lg },
  emptyText: { ...typography.h2, color: colors.midnight, marginBottom: spacing.sm },
  emptySubtext: { ...typography.body, color: colors.textSecondary, textAlign: 'center' },
});
