import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';

// Matérias disponíveis para categorizar a anotação
const SUBJECTS = [
  { id: 'mat', name: 'Matemática', color: '#FF4B4B' },
  { id: 'fis', name: 'Física', color: '#58CC02' },
  { id: 'qui', name: 'Química', color: '#58CC02' },
  { id: 'his', name: 'História', color: '#F1C40F' },
  { id: 'red', name: 'Redação', color: '#1CB0F6' },
  { id: 'por', name: 'Português', color: '#CE82FF' },
];

export default function NewNoteScreen() {
  const router = useRouter();
  
  // Estados do formulário
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);

  const handleSave = () => {
    if (!title.trim() || !content.trim() || !selectedSubject) {
      Alert.alert("Quase lá!", "Preencha o título, selecione uma matéria e escreva algo na sua anotação antes de salvar.");
      return;
    }
    
    // Aqui no futuro o Zustand vai salvar no banco de dados
    Alert.alert("Sucesso!", "Sua anotação foi salva no Caderno.", [
      { text: "OK", onPress: () => router.back() }
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER SUPERIOR */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconButton}>
          <FontAwesome5 name="times" size={20} color="#2C3A47" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Novo Resumo</Text>
        
        <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
          <Text style={styles.saveButtonText}>Salvar</Text>
        </TouchableOpacity>
      </View>

      {/* O KeyboardAvoidingView impede que o teclado cubra o texto enquanto o aluno digita */}
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          {/* TÍTULO DA ANOTAÇÃO */}
          <TextInput
            style={styles.titleInput}
            placeholder="Título do seu resumo..."
            placeholderTextColor="#8CA0B3"
            value={title}
            onChangeText={setTitle}
            maxLength={60}
          />

          {/* SELEÇÃO DE MATÉRIA (TAG) */}
          <Text style={styles.sectionLabel}>Escolha a Matéria:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.subjectsScroll}>
            {SUBJECTS.map((subject) => {
              const isSelected = selectedSubject === subject.id;
              return (
                <TouchableOpacity
                  key={subject.id}
                  style={[
                    styles.subjectPill,
                    isSelected && { backgroundColor: subject.color, borderColor: subject.color }
                  ]}
                  onPress={() => setSelectedSubject(subject.id)}
                  activeOpacity={0.7}
                >
                  <Text style={[
                    styles.subjectPillText,
                    isSelected && { color: '#FFF' }
                  ]}>
                    {subject.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* ÁREA DE ESCRITA (CADERNO) */}
          <View style={styles.editorContainer}>
            <TextInput
              style={styles.contentInput}
              placeholder="Escreva seus macetes, fórmulas ou teoria aqui..."
              placeholderTextColor="#A0AEC0"
              value={content}
              onChangeText={setContent}
              multiline
              textAlignVertical="top" // Faz o texto começar do topo no Android
              autoCorrect={false}
            />
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' }, // Fundo branco para parecer uma folha
  
  header: { 
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', 
    padding: 20, borderBottomWidth: 1, borderColor: '#E2E8F0', backgroundColor: '#FFF' 
  },
  iconButton: { width: 40, height: 40, justifyContent: 'center' },
  headerTitle: { fontSize: 16, fontWeight: 'bold', color: '#8CA0B3', textTransform: 'uppercase' },
  saveButton: { 
    backgroundColor: '#1CB0F6', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
  },
  saveButtonText: { color: '#FFF', fontWeight: 'bold', fontSize: 14 },

  scrollContent: { padding: 20, paddingBottom: 40 },

  titleInput: {
    fontSize: 24, fontWeight: 'bold', color: '#2C3A47',
    marginBottom: 24, paddingVertical: 8,
    borderBottomWidth: 2, borderBottomColor: '#F7F9FC',
  },

  sectionLabel: { fontSize: 14, fontWeight: 'bold', color: '#8CA0B3', marginBottom: 12 },
  
  subjectsScroll: { gap: 8, paddingBottom: 8, marginBottom: 24 },
  subjectPill: {
    paddingHorizontal: 16, paddingVertical: 8,
    borderRadius: 20, borderWidth: 1, borderColor: '#E2E8F0',
    backgroundColor: '#F7F9FC',
  },
  subjectPillText: { fontSize: 14, fontWeight: 'bold', color: '#4B5563' },

  editorContainer: {
    flex: 1,
    minHeight: 300,
    backgroundColor: '#FFFEF5', // Fundo levemente amarelado de caderno
    borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: '#F1C40F40',
  },
  contentInput: {
    flex: 1,
    fontSize: 16, color: '#2C3A47', lineHeight: 24,
  }
});