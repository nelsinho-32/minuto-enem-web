import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useUserStore } from '@/store/useUserStore';

interface CreateRoomButtonProps {
  onPress?: () => void;
}

export function CreateRoomButton({ onPress }: CreateRoomButtonProps) {
  const router = useRouter();
  const role = useUserStore((state) => state.user?.role);

  if (role !== 'TEACHER') {
    return null;
  }

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.push('/classes/new' as any);
    }
  };

  return (
    <TouchableOpacity
      style={styles.button}
      activeOpacity={0.8}
      onPress={handlePress}
    >
      <FontAwesome5 name="plus-circle" size={16} color="#FFFFFF" />
      <Text style={styles.text}>Criar Nova Turma</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#58CC02',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
    marginBottom: 12,
  },
  text: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
