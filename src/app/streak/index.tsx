import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { useUserStore } from '@/store/useUserStore';

// Configuração do idioma
LocaleConfig.locales['pt-br'] = {
  monthNames: ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'],
  monthNamesShort: ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'],
  dayNames: ['Domingo','Segunda-feira','Terça-feira','Quarta-feira','Quinta-feira','Sexta-feira','Sábado'],
  dayNamesShort: ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'],
  today: 'Hoje'
};
LocaleConfig.defaultLocale = 'pt-br';

export default function StreakScreen() {
  const router = useRouter();
  const { streak } = useUserStore();

  // SIMULAÇÃO: Se a ofensiva for 0, forçamos o valor 5 apenas para visualização do layout.
  // Em produção, você removerá essa linha e usará apenas o 'streak' real.
  const displayStreak = streak > 0 ? streak : 5; 

  // Esta lógica cria exatamente a mesma quantidade de dias marcados 
  // que o número total exibido no placar acima do calendário.
  const markedDates = useMemo(() => {
    const dates: Record<string, any> = {};
    const today = new Date();

    for (let i = 0; i < displayStreak; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateString = date.toISOString().split('T')[0];
      
      dates[dateString] = { selected: true };
    }
    return dates;
  }, [displayStreak]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <FontAwesome5 name="arrow-left" size={20} color="#2C3A47" />
        </TouchableOpacity>
        <Text style={styles.title}>Suas Conquistas</Text>
        <View style={{ width: 40 }} /> 
      </View>

      <View style={styles.content}>
        {/* Placar de Ofensiva (Relacionado aos dias do calendário) */}
        <View style={styles.streakShowcase}>
          <FontAwesome5 name="fire-alt" size={60} color="#FF9600" style={styles.icon} />
          <Text style={styles.streakNumber}>{displayStreak}</Text>
          <Text style={styles.streakLabel}>Dias seguidos estudando!</Text>
        </View>
        
        <View style={styles.calendarContainer}>
          <Calendar
            hideExtraDays={true}
            markedDates={markedDates}
            theme={{
              calendarBackground: '#FFFFFF',
              textSectionTitleColor: '#8CA0B3',
              monthTextColor: '#2C3A47',
              textMonthFontWeight: 'bold',
              textDayHeaderFontWeight: 'bold',
              arrowColor: '#FF9600',
            }}
            // Substituímos o visual padrão por um componente customizado
            dayComponent={({ date, state, marking }: any) => {
              const isSelected = marking?.selected;
              const isToday = state === 'today';
              const isDisabled = state === 'disabled';

              return (
                <View style={[
                  styles.dayCell, 
                  isSelected && styles.dayCellSelected,
                  isToday && !isSelected && styles.dayCellToday
                ]}>
                  {/* Foguinho injetado diretamente na célula do dia! */}
                  {isSelected && (
                    <FontAwesome5 name="fire-alt" size={14} color="#FFFFFF" style={styles.dayIcon} />
                  )}
                  <Text style={[
                    styles.dayText,
                    isSelected && styles.dayTextSelected,
                    isDisabled && styles.dayTextDisabled,
                    isToday && !isSelected && styles.dayTextToday
                  ]}>
                    {date.day}
                  </Text>
                </View>
              );
            }}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F9FC' },
  header: { 
    flexDirection: 'row', justifyContent: 'space-between', 
    padding: 20, alignItems: 'center', backgroundColor: '#FFF',
    borderBottomWidth: 1, borderColor: '#E2E8F0'
  },
  backButton: { width: 40, height: 40, justifyContent: 'center' },
  title: { fontSize: 20, fontWeight: 'bold', color: '#2C3A47' },
  content: { flex: 1, paddingTop: 20, paddingHorizontal: 20 },
  
  streakShowcase: {
    alignItems: 'center', backgroundColor: '#FFF', padding: 24,
    borderRadius: 24, borderWidth: 1, borderColor: '#E2E8F0',
    marginBottom: 24,
    shadowColor: '#FF9600', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4,
  },
  icon: { marginBottom: 10 },
  streakNumber: { fontSize: 48, fontWeight: 'bold', color: '#2C3A47' },
  streakLabel: { fontSize: 16, color: '#8CA0B3', fontWeight: '600' },
  
  calendarContainer: {
    borderRadius: 24, overflow: 'hidden', borderWidth: 1, borderColor: '#E2E8F0',
    backgroundColor: '#FFF', paddingBottom: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },

  // Estilos da Célula Customizada do Calendário
  dayCell: {
    width: 40, height: 44, 
    justifyContent: 'center', alignItems: 'center',
    borderRadius: 12,
  },
  dayCellSelected: {
    backgroundColor: '#FF9600', // Laranja do foguinho
    shadowColor: '#FF9600', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.4, shadowRadius: 3, elevation: 3,
  },
  dayCellToday: {
    borderWidth: 2, borderColor: '#1CB0F6',
  },
  dayIcon: {
    marginBottom: 2, // Espaço entre o fogo e o número
  },
  dayText: {
    fontSize: 14, fontWeight: 'bold', color: '#2C3A47'
  },
  dayTextSelected: {
    color: '#FFFFFF'
  },
  dayTextDisabled: {
    color: '#E2E8F0'
  },
  dayTextToday: {
    color: '#1CB0F6'
  }
});