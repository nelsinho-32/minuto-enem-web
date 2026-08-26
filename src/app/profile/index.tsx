import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useUserStore } from '@/store/useUserStore';

const USER_PROFILE = {
  name: 'Nelson Filho',
  course: 'Sistemas para Internet - IFPB',
  streak: 12,
  league: 'Liga Ouro',
  avatarInitials: 'NF'
};

const BADGES = [
  { id: 1, title: 'Madrugada Adentro', desc: 'Estudou após as 00h', icon: 'moon', color: '#8E44AD', unlocked: true },
  { id: 2, title: 'Foco de Ferro', desc: 'Ofensiva de 7 dias', icon: 'fire-alt', color: '#FF9600', unlocked: true },
  { id: 3, title: 'Gênio da Exatas', desc: 'Acertou 20 seguidas de Mat.', icon: 'calculator', color: '#E2E8F0', unlocked: false },
];

const FRIENDS_RANKING = [
  { id: 1, name: 'Nelson Filho', xp: 2450, isMe: true },
  { id: 2, name: 'Carlos Eduardo', xp: 2120, isMe: false },
  { id: 3, name: 'Ana Beatriz', xp: 1950, isMe: false },
  { id: 4, name: 'Lucas Silva', xp: 850, isMe: false },
];

export default function ProfileScreen() {
  const router = useRouter();
  const { xp, avatar, setAvatar } = useUserStore(); // Pega e altera o avatar globalmente
  const [activeTab, setActiveTab] = useState<'conquistas' | 'amigos'>('amigos');

  // Função para abrir a galeria e alterar a foto de perfil
  const handlePickImage = async () => {
    // Solicita permissão para acessar a galeria
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (!permissionResult.granted) {
      Alert.alert("Permissão negada", "Precisamos de permissão para acessar sua galeria de fotos.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setAvatar(result.assets[0].uri);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <FontAwesome5 name="arrow-left" size={20} color="#2C3A47" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Meu Perfil</Text>
        <TouchableOpacity style={styles.settingsButton}>
          <FontAwesome5 name="cog" size={20} color="#8CA0B3" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* CARD DO USUÁRIO COM FOTO DINÂMICA */}
        <View style={styles.userCard}>
          <TouchableOpacity onPress={handlePickImage} activeOpacity={0.9} style={styles.avatarContainer}>
            {avatar ? (
              <Image source={{ uri: avatar }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatarBox}>
                <Text style={styles.avatarText}>{USER_PROFILE.avatarInitials}</Text>
              </View>
            )}
            
            {/* Ícone flutuante de câmera para indicar que é clicável */}
            <View style={styles.cameraBadge}>
              <FontAwesome5 name="camera" size={10} color="#FFF" />
            </View>
          </TouchableOpacity>
          
          <Text style={styles.userName}>{USER_PROFILE.name}</Text>
          <Text style={styles.userCourse}>{USER_PROFILE.course}</Text>
          
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <FontAwesome5 name="star" size={16} color="#F1C40F" solid />
              <Text style={styles.statValue}>{xp}</Text>
              <Text style={styles.statLabel}>Total XP</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <FontAwesome5 name="fire-alt" size={16} color="#FF9600" />
              <Text style={styles.statValue}>{USER_PROFILE.streak}</Text>
              <Text style={styles.statLabel}>Dias Seguidos</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <FontAwesome5 name="medal" size={16} color="#1CB0F6" />
              <Text style={styles.statValue}>{USER_PROFILE.league}</Text>
              <Text style={styles.statLabel}>Ranking</Text>
            </View>
          </View>
        </View>

        {/* ABAS */}
        <View style={styles.tabContainer}>
          <TouchableOpacity 
            style={[styles.tabButton, activeTab === 'amigos' && styles.tabActive]}
            onPress={() => setActiveTab('amigos')}
          >
            <FontAwesome5 name="user-friends" size={14} color={activeTab === 'amigos' ? '#FFF' : '#8CA0B3'} style={{marginRight: 8}} />
            <Text style={[styles.tabText, activeTab === 'amigos' && styles.tabTextActive]}>Liga de Amigos</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.tabButton, activeTab === 'conquistas' && styles.tabActive]}
            onPress={() => setActiveTab('conquistas')}
          >
            <FontAwesome5 name="award" size={14} color={activeTab === 'conquistas' ? '#FFF' : '#8CA0B3'} style={{marginRight: 8}} />
            <Text style={[styles.tabText, activeTab === 'conquistas' && styles.tabTextActive]}>Conquistas</Text>
          </TouchableOpacity>
        </View>

        {/* CONTEÚDO */}
        {activeTab === 'amigos' && (
          <View style={styles.friendsSection}>
            <View style={styles.friendsHeader}>
              <Text style={styles.sectionTitle}>Ranking Semanal</Text>
              <TouchableOpacity>
                <Text style={styles.addFriendText}>+ Convidar</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.rankingCard}>
              {FRIENDS_RANKING.map((friend, index) => {
                let positionColor = '#8CA0B3';
                if (index === 0) positionColor = '#F1C40F';
                if (index === 1) positionColor = '#BDC3C7';
                if (index === 2) positionColor = '#CD7F32';

                return (
                  <View key={friend.id} style={[styles.rankingRow, friend.isMe && styles.rankingRowMe]}>
                    <Text style={[styles.rankPosition, { color: positionColor }]}>{index + 1}º</Text>
                    
                    <View style={styles.friendAvatar}>
                      <FontAwesome5 name="user" size={12} color="#FFF" />
                    </View>
                    
                    <Text style={[styles.friendName, friend.isMe && { fontWeight: 'bold' }]}>
                      {friend.name} {friend.isMe && '(Você)'}
                    </Text>
                    
                    <Text style={styles.friendXp}>{friend.xp} XP</Text>
                    
                    {!friend.isMe && (
                      <TouchableOpacity style={styles.cheerButton}>
                        <FontAwesome5 name="hands-helping" size={14} color="#1CB0F6" />
                      </TouchableOpacity>
                    )}
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {activeTab === 'conquistas' && (
          <View style={styles.badgesSection}>
            <Text style={styles.sectionTitle}>Suas Medalhas</Text>
            <View style={styles.badgesGrid}>
              {BADGES.map(badge => (
                <View key={badge.id} style={[styles.badgeCard, !badge.unlocked && { opacity: 0.5 }]}>
                  <View style={[styles.badgeIconBox, { backgroundColor: badge.unlocked ? badge.color : '#E2E8F0' }]}>
                    <FontAwesome5 name={badge.icon} size={24} color={badge.unlocked ? '#FFF' : '#A0AEC0'} />
                  </View>
                  <Text style={styles.badgeTitle}>{badge.title}</Text>
                  <Text style={styles.badgeDesc} numberOfLines={2}>{badge.desc}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F9FC' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, backgroundColor: '#FFF', borderBottomWidth: 1, borderColor: '#E2E8F0' },
  backButton: { width: 40, height: 40, justifyContent: 'center' },
  settingsButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'flex-end' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#2C3A47' },
  
  scrollContent: { padding: 20, paddingBottom: 60 },

  userCard: { backgroundColor: '#FFF', borderRadius: 24, padding: 24, alignItems: 'center', marginBottom: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 3 },
  
  avatarContainer: { position: 'relative', marginBottom: 12 },
  avatarBox: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#1CB0F6', justifyContent: 'center', alignItems: 'center' },
  avatarImage: { width: 80, height: 80, borderRadius: 40 },
  avatarText: { fontSize: 28, fontWeight: 'bold', color: '#FFF' },
  cameraBadge: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#2C3A47', width: 26, height: 26, borderRadius: 13, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#FFF' },

  userName: { fontSize: 22, fontWeight: 'bold', color: '#2C3A47', marginBottom: 4 },
  userCourse: { fontSize: 14, color: '#8CA0B3', marginBottom: 24 },
  
  statsRow: { flexDirection: 'row', justifyContent: 'space-around', width: '100%', backgroundColor: '#F8FAFC', paddingVertical: 16, borderRadius: 16 },
  statItem: { alignItems: 'center', flex: 1, gap: 4 },
  statValue: { fontSize: 16, fontWeight: 'bold', color: '#2C3A47' },
  statLabel: { fontSize: 11, color: '#8CA0B3', textTransform: 'uppercase' },
  statDivider: { width: 1, height: '80%', backgroundColor: '#E2E8F0', alignSelf: 'center' },

  tabContainer: { flexDirection: 'row', backgroundColor: '#E2E8F0', borderRadius: 16, padding: 4, marginBottom: 24 },
  tabButton: { flex: 1, flexDirection: 'row', paddingVertical: 12, justifyContent: 'center', alignItems: 'center', borderRadius: 12 },
  tabActive: { backgroundColor: '#2C3A47', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  tabText: { fontSize: 14, fontWeight: 'bold', color: '#8CA0B3' },
  tabTextActive: { color: '#FFF' },

  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#2C3A47', marginBottom: 16 },

  friendsSection: {},
  friendsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  addFriendText: { fontSize: 14, fontWeight: 'bold', color: '#1CB0F6' },
  
  rankingCard: { backgroundColor: '#FFF', borderRadius: 16, borderWidth: 1, borderColor: '#E2E8F0', overflow: 'hidden' },
  rankingRow: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  rankingRowMe: { backgroundColor: '#F0F9FF' },
  rankPosition: { fontSize: 16, fontWeight: 'bold', width: 30 },
  friendAvatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#8CA0B3', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  friendName: { flex: 1, fontSize: 15, color: '#2C3A47' },
  friendXp: { fontSize: 14, fontWeight: 'bold', color: '#F1C40F', marginRight: 12 },
  cheerButton: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#E0F2FE', justifyContent: 'center', alignItems: 'center' },

  badgesSection: {},
  badgesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  badgeCard: { width: '31%', backgroundColor: '#FFF', padding: 12, borderRadius: 16, alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0' },
  badgeIconBox: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  badgeTitle: { fontSize: 12, fontWeight: 'bold', color: '#2C3A47', textAlign: 'center', marginBottom: 4 },
  badgeDesc: { fontSize: 10, color: '#8CA0B3', textAlign: 'center' },
});