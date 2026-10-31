import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';
import {
  GENERAL_ERROR_STATS,
  INITIAL_ERROR_QUESTIONS,
  SUBJECT_ERROR_META,
} from '@/constants/errorStatsData';

export default function ErrorsScreen() {
  const router = useRouter();
  const { area } = useLocalSearchParams<{ area: string }>();

  const { subjectStatsList, worstSubject } = useMemo(() => {
    const filtered = area
      ? INITIAL_ERROR_QUESTIONS.filter((q) => q.area === area)
      : INITIAL_ERROR_QUESTIONS;

    const grouped = filtered.reduce(
      (acc, q) => {
        if (!acc[q.subject]) {
          acc[q.subject] = {
            questions: [],
            topics: new Set<string>(),
          };
        }
        acc[q.subject].questions.push(q);
        acc[q.subject].topics.add(q.topic);
        return acc;
      },
      {} as Record<string, { questions: typeof INITIAL_ERROR_QUESTIONS; topics: Set<string> }>
    );

    const list = Object.entries(grouped).map(([subject, data]) => {
      const meta = SUBJECT_ERROR_META[subject] ?? {
        area: data.questions[0]?.area ?? 'Geral',
        icon: 'book',
        color: '#FF4B4B',
        totalAttempted: 20,
        errorRate: 25,
        averageTime: '2m 30s',
      };

      return {
        subject,
        icon: meta.icon,
        color: meta.color,
        errorRate: meta.errorRate,
        averageTime: meta.averageTime,
        errorsCount: data.questions.length,
        topicsCount: data.topics.size,
        topicsList: Array.from(data.topics),
      };
    });

    list.sort((a, b) => b.errorRate - a.errorRate);

    return {
      subjectStatsList: list,
      worstSubject: list[0] ?? null,
    };
  }, [area]);

  const pageTitle = area ? `Raio-X: ${area}` : 'Raio-X de Erros';

  const handleOpenSubject = (subjectName: string) => {
    router.push({
      pathname: '/stats/error-topics' as any,
      params: { subject: subjectName },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 1. HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <FontAwesome5 name="arrow-left" size={20} color="#2C3A47" />
        </TouchableOpacity>
        <Text style={styles.title}>{pageTitle}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 2. VISÃO GERAL: TAXA DE ERRO E TEMPO MÉDIO */}
        <Text style={styles.sectionTitle}>Visão Geral dos Erros</Text>
        <View style={styles.overviewContainer}>
          {/* Card Taxa de Erro */}
          <View
            style={[
              styles.overviewCard,
              { borderBottomColor: '#FF4B4B', borderBottomWidth: 4 },
            ]}
          >
            <View style={styles.overviewIconHeader}>
              <View style={[styles.overviewBadge, { backgroundColor: '#FFE4E6' }]}>
                <FontAwesome5 name="exclamation-triangle" size={16} color="#FF4B4B" />
              </View>
              <Text style={[styles.overviewValue, { color: '#FF4B4B' }]}>
                {GENERAL_ERROR_STATS.errorRate}%
              </Text>
            </View>
            <Text style={styles.overviewLabel}>Taxa de Erro</Text>
            <Text style={styles.overviewSub}>
              {GENERAL_ERROR_STATS.totalErrors} de {GENERAL_ERROR_STATS.totalAnswered} questões
            </Text>
          </View>

          {/* Card Tempo Médio */}
          <View
            style={[
              styles.overviewCard,
              { borderBottomColor: '#FF9600', borderBottomWidth: 4 },
            ]}
          >
            <View style={styles.overviewIconHeader}>
              <View style={[styles.overviewBadge, { backgroundColor: '#FFF0D4' }]}>
                <FontAwesome5 name="stopwatch" size={16} color="#FF9600" />
              </View>
              <Text style={styles.overviewValue}>
                {GENERAL_ERROR_STATS.averageErrorTime}
              </Text>
            </View>
            <Text style={styles.overviewLabel}>Tempo Médio</Text>
            <Text style={styles.overviewSub}>Gasto por questão errada</Text>
          </View>
        </View>

        {subjectStatsList.length === 0 ? (
          <View style={styles.emptyState}>
            <FontAwesome5
              name="medal"
              size={48}
              color="#E2E8F0"
              style={{ marginBottom: 16 }}
            />
            <Text style={styles.emptyText}>
              Sem erros por aqui! Você está dominando o conteúdo.
            </Text>
          </View>
        ) : (
          <>
            {/* 3. PLANO DE AÇÃO DIRECIONADO */}
            {worstSubject && (
              <TouchableOpacity
                style={styles.actionPlanHero}
                activeOpacity={0.85}
                onPress={() => handleOpenSubject(worstSubject.subject)}
              >
                <View style={styles.heroHeader}>
                  <View style={styles.heroIconBox}>
                    <FontAwesome5 name="crosshairs" size={20} color="#FFF" />
                  </View>
                  <Text style={styles.heroTitle}>Plano de Ação Direcionado</Text>
                </View>
                <Text style={styles.heroDescription}>
                  Sua maior dificuldade atual é em{' '}
                  <Text style={{ fontWeight: 'bold', color: '#FFF' }}>
                    {worstSubject.subject}
                  </Text>{' '}
                  ({worstSubject.errorRate}% de taxa de erro e tempo médio de{' '}
                  {worstSubject.averageTime}).
                </Text>
                <View style={styles.heroTaskBox}>
                  <FontAwesome5
                    name="layer-group"
                    size={14}
                    color="#2C3A47"
                    style={{ marginRight: 10, marginTop: 2 }}
                  />
                  <Text style={styles.heroTaskText}>
                    Toque aqui para ver os {worstSubject.topicsCount} assuntos de{' '}
                    {worstSubject.subject} onde você mais errou.
                  </Text>
                </View>
              </TouchableOpacity>
            )}

            {/* 4. LISTA DE MATÉRIAS (CLICÁVEL PARA ABRIR NOVA TELA POR ASSUNTOS) */}
            <Text style={styles.sectionTitle}>Erros por Matéria</Text>
            <Text style={styles.sectionSub}>
              Toque em uma matéria para abrir os erros separados por assunto.
            </Text>

            <View style={styles.subjectsList}>
              {subjectStatsList.map((item) => (
                <TouchableOpacity
                  key={item.subject}
                  style={styles.subjectCard}
                  activeOpacity={0.75}
                  onPress={() => handleOpenSubject(item.subject)}
                >
                  <View style={styles.subjectCardHeader}>
                    <View
                      style={[
                        styles.subjectIconBox,
                        { backgroundColor: item.color },
                      ]}
                    >
                      <FontAwesome5 name={item.icon} size={16} color="#FFF" />
                    </View>

                    <View style={styles.subjectMainInfo}>
                      <Text style={styles.subjectName}>{item.subject}</Text>
                      <Text style={styles.subjectSubCount}>
                        {item.errorsCount}{' '}
                        {item.errorsCount === 1 ? 'erro' : 'erros'} em{' '}
                        {item.topicsCount}{' '}
                        {item.topicsCount === 1 ? 'assunto' : 'assuntos'}
                      </Text>
                    </View>

                    <View style={styles.subjectErrorRateBox}>
                      <Text
                        style={[styles.subjectErrorRateValue, { color: item.color }]}
                      >
                        {item.errorRate}%
                      </Text>
                      <Text style={styles.subjectErrorRateLabel}>taxa de erro</Text>
                    </View>

                    <FontAwesome5
                      name="chevron-right"
                      size={14}
                      color="#8CA0B3"
                      style={{ marginLeft: 10 }}
                    />
                  </View>

                  <View style={styles.progressBarBg}>
                    <View
                      style={[
                        styles.progressBarFill,
                        {
                          width: `${item.errorRate}%`,
                          backgroundColor: item.color,
                        },
                      ]}
                    />
                  </View>

                  <View style={styles.subjectCardFooter}>
                    <View style={styles.timeBadge}>
                      <FontAwesome5 name="clock" size={12} color="#8CA0B3" />
                      <Text style={styles.timeText}>
                        Tempo médio: {item.averageTime}
                      </Text>
                    </View>

                    <Text style={styles.viewTopicsLink}>Ver por assuntos</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F9FC' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderColor: '#E2E8F0',
  },
  backButton: { width: 40, height: 40, justifyContent: 'center' },
  title: { fontSize: 20, fontWeight: 'bold', color: '#2C3A47' },
  scrollContent: { padding: 20, paddingBottom: 60 },
  emptyState: { alignItems: 'center', justifyContent: 'center', marginTop: 60 },
  emptyText: { fontSize: 16, color: '#8CA0B3', textAlign: 'center' },

  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3A47',
    marginBottom: 6,
  },
  sectionSub: {
    fontSize: 13,
    color: '#8CA0B3',
    marginBottom: 16,
  },

  // Visão Geral (Taxa de Erro + Tempo Médio)
  overviewContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 10,
    marginBottom: 28,
  },
  overviewCard: {
    flex: 1,
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  overviewIconHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  overviewBadge: {
    width: 34,
    height: 34,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overviewValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2C3A47',
  },
  overviewLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4B5563',
    marginBottom: 4,
  },
  overviewSub: {
    fontSize: 12,
    color: '#8CA0B3',
  },

  // Hero Plano de Ação
  actionPlanHero: {
    backgroundColor: '#FF4B4B',
    borderRadius: 20,
    padding: 20,
    marginBottom: 28,
    shadowColor: '#FF4B4B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  heroHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  heroIconBox: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  heroTitle: { fontSize: 18, fontWeight: 'bold', color: '#FFF' },
  heroDescription: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.92)',
    lineHeight: 20,
    marginBottom: 14,
  },
  heroTaskBox: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 14,
    alignItems: 'flex-start',
  },
  heroTaskText: {
    flex: 1,
    fontSize: 13,
    color: '#2C3A47',
    fontWeight: 'bold',
    lineHeight: 18,
  },

  // Lista de Matérias
  subjectsList: {
    gap: 14,
  },
  subjectCard: {
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  subjectCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  subjectIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  subjectMainInfo: {
    flex: 1,
  },
  subjectName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3A47',
  },
  subjectSubCount: {
    fontSize: 12,
    color: '#8CA0B3',
    marginTop: 2,
  },
  subjectErrorRateBox: {
    alignItems: 'flex-end',
  },
  subjectErrorRateValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  subjectErrorRateLabel: {
    fontSize: 10,
    color: '#8CA0B3',
    textTransform: 'uppercase',
    fontWeight: 'bold',
  },
  progressBarBg: {
    width: '100%',
    height: 8,
    backgroundColor: '#F1F5F9',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  subjectCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  timeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#8CA0B3',
  },
  viewTopicsLink: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#1CB0F6',
  },
});
