import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';
import { useChatStore, ChatCategory, ChatMessage } from '@/store/useChatStore';
import { useUserStore } from '@/store/useUserStore';

const CATEGORIES: { label: string; value: ChatCategory | 'ALL'; icon: string; color: string }[] = [
  { label: 'Todos', value: 'ALL', icon: 'comments', color: '#1CB0F6' },
  { label: 'Macetes', value: 'MACETE', icon: 'lightbulb', color: '#FF9600' },
  { label: 'Questões', value: 'QUESTAO', icon: 'question-circle', color: '#58CC02' },
  { label: 'Dúvidas', value: 'DUVIDA', icon: 'hands-helping', color: '#8E44AD' },
];

export default function FriendsChatScreen() {
  const router = useRouter();
  const { messages, addMessage, toggleLike } = useChatStore();
  const { user, avatar } = useUserStore();

  const [selectedFilter, setSelectedFilter] = useState<ChatCategory | 'ALL'>('ALL');
  const [inputText, setInputText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ChatCategory>('MACETE');
  const [subjectTag, setSubjectTag] = useState('Geral');

  const filteredMessages = messages.filter((m) =>
    selectedFilter === 'ALL' ? true : m.category === selectedFilter
  );

  const handleSend = () => {
    if (!inputText.trim()) {
      Alert.alert('Mensagem vazia', 'Escreva algo para compartilhar com seus amigos.');
      return;
    }

    addMessage({
      senderId: user?.id || 'me',
      senderName: user?.name || 'Você',
      senderAvatar: avatar || undefined,
      category: selectedCategory,
      subjectTag: subjectTag.trim() || 'Geral',
      content: inputText.trim(),
    });

    setInputText('');
  };

  const renderBadge = (category: ChatCategory) => {
    switch (category) {
      case 'MACETE':
        return (
          <View style={[styles.badgeContainer, { backgroundColor: '#FFF4E5' }]}>
            <FontAwesome5 name="lightbulb" size={11} color="#FF9600" />
            <Text style={[styles.badgeText, { color: '#FF9600' }]}>Macete</Text>
          </View>
        );
      case 'QUESTAO':
        return (
          <View style={[styles.badgeContainer, { backgroundColor: '#EBFBEF' }]}>
            <FontAwesome5 name="question-circle" size={11} color="#58CC02" />
            <Text style={[styles.badgeText, { color: '#27AE60' }]}>Questão</Text>
          </View>
        );
      case 'DUVIDA':
        return (
          <View style={[styles.badgeContainer, { backgroundColor: '#F3E8FF' }]}>
            <FontAwesome5 name="hands-helping" size={11} color="#8E44AD" />
            <Text style={[styles.badgeText, { color: '#8E44AD' }]}>Dúvida</Text>
          </View>
        );
      default:
        return (
          <View style={[styles.badgeContainer, { backgroundColor: '#F1F5F9' }]}>
            <Text style={[styles.badgeText, { color: '#64748B' }]}>Geral</Text>
          </View>
        );
    }
  };

  const renderItem = ({ item }: { item: ChatMessage }) => {
    return (
      <View style={[styles.messageCard, item.isMe && styles.messageCardMe]}>
        <View style={styles.messageHeader}>
          <View style={styles.senderInfo}>
            <View style={[styles.senderAvatar, item.isMe && styles.senderAvatarMe]}>
              <FontAwesome5 name="user" size={12} color="#FFF" />
            </View>
            <View>
              <Text style={styles.senderName}>{item.senderName} {item.isMe && '(Você)'}</Text>
              <Text style={styles.timestamp}>{item.timestamp} • {item.subjectTag || 'Geral'}</Text>
            </View>
          </View>
          {renderBadge(item.category)}
        </View>

        <Text style={styles.messageContent}>{item.content}</Text>

        <View style={styles.messageFooter}>
          <TouchableOpacity
            style={[styles.likeButton, item.likedByMe && styles.likeButtonActive]}
            onPress={() => toggleLike(item.id)}
            activeOpacity={0.7}
          >
            <FontAwesome5
              name="thumbs-up"
              size={13}
              color={item.likedByMe ? '#1CB0F6' : '#8CA0B3'}
              solid={item.likedByMe}
            />
            <Text style={[styles.likeCount, item.likedByMe && styles.likeCountActive]}>
              {item.likes} {item.likes === 1 ? 'curtida' : 'curtidas'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <FontAwesome5 name="arrow-left" size={18} color="#2C3A47" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Chat da Turma & Amigos</Text>
          <Text style={styles.headerSubtitle}>Macetes, Questões e Assuntos</Text>
        </View>
        <View style={styles.backButton} />
      </View>

      {/* FILTROS POR CATEGORIA */}
      <View style={styles.filterContainer}>
        {CATEGORIES.map((cat) => {
          const isSelected = selectedFilter === cat.value;
          return (
            <TouchableOpacity
              key={cat.value}
              style={[styles.filterChip, isSelected && styles.filterChipActive]}
              onPress={() => setSelectedFilter(cat.value)}
              activeOpacity={0.8}
            >
              <FontAwesome5
                name={cat.icon}
                size={12}
                color={isSelected ? '#FFF' : cat.color}
                style={{ marginRight: 6 }}
              />
              <Text style={[styles.filterText, isSelected && styles.filterTextActive]}>
                {cat.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* LISTA DE MENSAGENS */}
      <FlatList
        data={filteredMessages}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <FontAwesome5 name="comments" size={40} color="#CBD5E1" />
            <Text style={styles.emptyText}>Nenhuma mensagem nessa categoria ainda.</Text>
            <Text style={styles.emptySubtext}>Seja o primeiro a compartilhar um macete ou dúvida!</Text>
          </View>
        }
      />

      {/* BARRA DE ENVIO */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View style={styles.inputContainer}>
          {/* Seletor do tipo de mensagem */}
          <View style={styles.categorySelectorRow}>
            <Text style={styles.categorySelectorLabel}>Tipo:</Text>
            {(['MACETE', 'QUESTAO', 'DUVIDA'] as ChatCategory[]).map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.categoryOption,
                  selectedCategory === cat && styles.categoryOptionActive,
                ]}
                onPress={() => setSelectedCategory(cat)}
              >
                <Text
                  style={[
                    styles.categoryOptionText,
                    selectedCategory === cat && styles.categoryOptionTextActive,
                  ]}
                >
                  {cat === 'MACETE' ? '💡 Macete' : cat === 'QUESTAO' ? '❓ Questão' : '🤝 Dúvida'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.inputRow}>
            <TextInput
              style={styles.textInput}
              placeholder={`Compartilhar ${
                selectedCategory === 'MACETE'
                  ? 'um macete/dica'
                  : selectedCategory === 'QUESTAO'
                  ? 'uma questão'
                  : 'uma dúvida'
              }...`}
              placeholderTextColor="#94A3B8"
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={500}
            />
            <TouchableOpacity
              style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
              onPress={handleSend}
              disabled={!inputText.trim()}
              activeOpacity={0.8}
            >
              <FontAwesome5 name="paper-plane" size={16} color="#FFF" />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderColor: '#E2E8F0',
  },
  backButton: { width: 36, height: 36, justifyContent: 'center' },
  headerTitleContainer: { alignItems: 'center' },
  headerTitle: { fontSize: 16, fontWeight: 'bold', color: '#1E293B' },
  headerSubtitle: { fontSize: 12, color: '#64748B', marginTop: 2 },

  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FFF',
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
  },
  filterChipActive: { backgroundColor: '#1CB0F6' },
  filterText: { fontSize: 12, fontWeight: 'bold', color: '#64748B' },
  filterTextActive: { color: '#FFF' },

  listContent: { padding: 16, gap: 12, paddingBottom: 24 },
  messageCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  messageCardMe: {
    borderColor: '#BAE6FD',
    backgroundColor: '#F0F9FF',
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  senderInfo: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  senderAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#64748B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  senderAvatarMe: {
    backgroundColor: '#1CB0F6',
  },
  senderName: { fontSize: 14, fontWeight: 'bold', color: '#1E293B' },
  timestamp: { fontSize: 11, color: '#94A3B8' },

  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  badgeText: { fontSize: 11, fontWeight: 'bold' },

  messageContent: { fontSize: 14, color: '#334155', lineHeight: 21, marginBottom: 10 },

  messageFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 8,
  },
  likeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  likeButtonActive: {
    backgroundColor: '#E0F2FE',
  },
  likeCount: { fontSize: 12, color: '#64748B', fontWeight: '500' },
  likeCountActive: { color: '#0284C7', fontWeight: 'bold' },

  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60, gap: 8 },
  emptyText: { fontSize: 15, fontWeight: 'bold', color: '#64748B' },
  emptySubtext: { fontSize: 13, color: '#94A3B8', textAlign: 'center' },

  inputContainer: {
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 16 : 10,
  },
  categorySelectorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  categorySelectorLabel: { fontSize: 12, fontWeight: 'bold', color: '#64748B' },
  categoryOption: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
  },
  categoryOptionActive: { backgroundColor: '#2C3A47' },
  categoryOptionText: { fontSize: 11, fontWeight: 'bold', color: '#64748B' },
  categoryOptionTextActive: { color: '#FFF' },

  inputRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 10 },
  textInput: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: '#1E293B',
    maxHeight: 100,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1CB0F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#CBD5E1',
  },
});

