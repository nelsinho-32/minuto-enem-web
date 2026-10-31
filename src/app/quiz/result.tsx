import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  AppState,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';
import { useUserStore } from '@/store/useUserStore';
import { useQuestionsQuery } from '@/hooks/useQuestionsQuery';

export default function ResultScreen() {
  const router = useRouter();
  const { xp, streak } = useUserStore();
  const {
    pendingSyncCount,
    isSyncing,
    syncPendingResults,
    refreshQueueCount,
  } = useQuestionsQuery();

  const [lastSyncedCount, setLastSyncedCount] = useState(0);

  // Tenta sincronizar resultados pendentes assim que a tela de conclusão abre
  useEffect(() => {
    let mounted = true;
    const triggerSync = async () => {
      await refreshQueueCount();
      const res = await syncPendingResults();
      if (mounted && res.syncedCount > 0) {
        setLastSyncedCount((prev) => prev + res.syncedCount);
      }
    };

    triggerSync();

    // Tenta novamente em background e quando o app retorna ao foco
    const interval = setInterval(() => {
      syncPendingResults()
        .then((res) => {
          if (mounted && res.syncedCount > 0) {
            setLastSyncedCount((prev) => prev + res.syncedCount);
          }
        })
        .catch(() => {});
    }, 8000);

    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        triggerSync();
      }
    });

    return () => {
      mounted = false;
      clearInterval(interval);
      sub.remove();
    };
  }, [refreshQueueCount, syncPendingResults]);

  const handleManualSync = async () => {
    const res = await syncPendingResults();
    if (res.syncedCount > 0) {
      setLastSyncedCount((prev) => prev + res.syncedCount);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <FontAwesome5 name="trophy" size={80} color="#F1C40F" style={styles.icon} />

        <Text style={styles.title}>Sessão Concluída!</Text>
        <Text style={styles.subtitle}>
          Você está ficando cada vez mais preparado para o ENEM.
        </Text>

        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <FontAwesome5 name="star" size={24} color="#F1C40F" solid />
            <Text style={styles.statLabel}>XP Total</Text>
            <Text style={styles.statValue}>{xp}</Text>
          </View>

          <View style={styles.statBox}>
            <FontAwesome5 name="fire-alt" size={24} color="#FF9600" />
            <Text style={styles.statLabel}>Ofensiva</Text>
            <Text style={styles.statValue}>{streak}</Text>
          </View>
        </View>

        {/* STATUS DE SINCRONIZAÇÃO OFFLINE-FIRST */}
        {isSyncing ? (
          <View style={[styles.syncCard, styles.syncCardLoading]}>
            <ActivityIndicator size="small" color="#1CB0F6" />
            <Text style={styles.syncTextLoading}>
              Sincronizando resultados offline com o servidor...
            </Text>
          </View>
        ) : pendingSyncCount > 0 ? (
          <View style={[styles.syncCard, styles.syncCardPending]}>
            <View style={styles.syncPendingHeader}>
              <FontAwesome5 name="cloud-upload-alt" size={18} color="#D97706" />
              <Text style={styles.syncTitlePending}>
                {pendingSyncCount}{' '}
                {pendingSyncCount === 1
                  ? 'resposta aguardando conexão'
                  : 'respostas aguardando conexão'}
              </Text>
            </View>
            <Text style={styles.syncDescriptionPending}>
              Seus pontos já foram garantidos localmente e serão sincronizados automaticamente assim que a internet voltar.
            </Text>
            <TouchableOpacity
              style={styles.retrySyncButton}
              onPress={handleManualSync}
              activeOpacity={0.8}
            >
              <FontAwesome5 name="sync-alt" size={12} color="#FFF" />
              <Text style={styles.retrySyncButtonText}>Tentar Sincronizar Agora</Text>
            </TouchableOpacity>
          </View>
        ) : lastSyncedCount > 0 ? (
          <View style={[styles.syncCard, styles.syncCardSuccess]}>
            <FontAwesome5 name="check-circle" size={18} color="#58CC02" />
            <Text style={styles.syncTextSuccess}>
              {lastSyncedCount}{' '}
              {lastSyncedCount === 1
                ? 'resposta offline sincronizada com sucesso!'
                : 'respostas offline sincronizadas com sucesso!'}
            </Text>
          </View>
        ) : null}
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.mainButton}
          onPress={() => router.replace('/')}
        >
          <Text style={styles.mainButtonText}>Voltar ao Início</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9FC',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  icon: {
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2C3A47',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#8CA0B3',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 20,
    width: '100%',
    marginBottom: 24,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E2E8F0',
  },
  statLabel: {
    fontSize: 14,
    color: '#8CA0B3',
    fontWeight: 'bold',
    marginTop: 12,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2C3A47',
  },
  syncCard: {
    width: '100%',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
  },
  syncCardLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#F0F9FF',
    borderColor: '#BAE6FD',
  },
  syncTextLoading: {
    flex: 1,
    fontSize: 13,
    fontWeight: 'bold',
    color: '#0284C7',
  },
  syncCardPending: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE68A',
  },
  syncPendingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  syncTitlePending: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#B45309',
  },
  syncDescriptionPending: {
    fontSize: 12,
    color: '#92400E',
    lineHeight: 18,
    marginBottom: 12,
  },
  retrySyncButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#D97706',
    paddingVertical: 10,
    borderRadius: 10,
  },
  retrySyncButtonText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  syncCardSuccess: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
  },
  syncTextSuccess: {
    flex: 1,
    fontSize: 13,
    fontWeight: 'bold',
    color: '#15803D',
  },
  footer: {
    padding: 20,
  },
  mainButton: {
    backgroundColor: '#1CB0F6',
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    shadowColor: '#1CB0F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  mainButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
});
