import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator, FlatList, KeyboardAvoidingView, Platform, Text, TextInput, View, Pressable,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/useTheme';
import { spacing, radius } from '../../theme/colors';
import ScreenHeader from '../../components/ScreenHeader';
import { getMessages, sendMessage } from '../../api/patient';
import type { ChatMessage } from '../../api/patient';

const POLL_INTERVAL_MS = 8000;

function Bubble({ message }: { message: ChatMessage }) {
  const { colors } = useTheme();
  const isPatient = message.senderType === 'patient';
  const time = new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <View style={{ alignItems: isPatient ? 'flex-end' : 'flex-start', marginBottom: spacing.sm }}>
      {!isPatient && (
        <Text style={{ fontSize: 11, color: colors.textMuted, marginBottom: 2, marginLeft: 4 }}>Care Assistant</Text>
      )}
      <View
        style={{
          maxWidth: '80%',
          backgroundColor: isPatient ? colors.primary : colors.surface2,
          borderWidth: isPatient ? 0 : 1,
          borderColor: colors.border,
          borderRadius: radius.lg,
          borderBottomRightRadius: isPatient ? 4 : radius.lg,
          borderBottomLeftRadius: isPatient ? radius.lg : 4,
          paddingHorizontal: 14,
          paddingVertical: 10,
        }}
      >
        <Text style={{ color: isPatient ? '#fff' : colors.textPrimary, fontSize: 14, lineHeight: 19 }}>
          {message.text}
        </Text>
      </View>
      <Text style={{ fontSize: 10, color: colors.textMuted, marginTop: 2, marginHorizontal: 4 }}>{time}</Text>
    </View>
  );
}

export default function MessagesScreen() {
  const { colors } = useTheme();
  const [messages, setMessages] = useState<ChatMessage[] | null>(null);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const listRef = useRef<FlatList>(null);

  const load = useCallback(async () => {
    try {
      const data = await getMessages();
      setMessages(data);
    } catch {
      // keep whatever's already shown; a silent poll failure isn't worth an error banner
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
      const interval = setInterval(load, POLL_INTERVAL_MS);
      return () => clearInterval(interval);
    }, [load])
  );

  useEffect(() => {
    if (messages?.length) {
      requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: true }));
    }
  }, [messages?.length]);

  const submit = async () => {
    const text = draft.trim();
    if (!text || sending) return;
    setSending(true);
    setDraft('');
    try {
      const sent = await sendMessage(text);
      setMessages((prev) => (prev ? [...prev, sent] : [sent]));
    } catch {
      setDraft(text); // put it back so nothing's lost
    } finally {
      setSending(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.bg }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <ScreenHeader title="Messages" subtitle="Chat with your care assistant" />

      {messages === null ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: spacing.md }}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : (
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(m) => m.id}
          contentContainerStyle={{ padding: spacing.lg, paddingTop: spacing.xl, flexGrow: 1 }}
          renderItem={({ item }) => <Bubble message={item} />}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
          ListEmptyComponent={
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14, paddingHorizontal: spacing.xxl }}>
              <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name="chatbubble-ellipses-outline" size={32} color={colors.primary} />
              </View>
              <Text style={{ fontSize: 16, fontWeight: '800', color: colors.textPrimary, textAlign: 'center' }}>
                Message your care team
              </Text>
              <Text style={{ fontSize: 13, color: colors.textMuted, textAlign: 'center', lineHeight: 19 }}>
                Questions about your visit or treatment? Send a message and your care team will get back to you here.
              </Text>
            </View>
          }
        />
      )}

      <View style={{
        flexDirection: 'row', alignItems: 'center', gap: 10,
        paddingHorizontal: spacing.lg, paddingVertical: spacing.md,
        borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.surface,
      }}>
        <TextInput
          value={draft}
          onChangeText={setDraft}
          placeholder="Message your care team…"
          placeholderTextColor={colors.textMuted}
          multiline
          style={{
            flex: 1, backgroundColor: colors.surface2, borderRadius: radius.pill,
            paddingHorizontal: 16, paddingVertical: 10, fontSize: 13.5, color: colors.textPrimary,
            borderWidth: 1, borderColor: colors.border, maxHeight: 100,
          }}
        />
        <Pressable
          onPress={submit}
          disabled={!draft.trim() || sending}
          style={{
            width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center',
            backgroundColor: draft.trim() && !sending ? colors.primary : colors.borderDark,
          }}
        >
          {sending ? <ActivityIndicator size="small" color="#fff" /> : <Ionicons name="send" size={16} color="#fff" />}
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}
