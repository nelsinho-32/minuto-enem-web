import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useUserStore } from '@/store/useUserStore';

// Evita que a splash nativa suma antes da hidratação do Zustand/AsyncStorage
SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();
  const token = useUserStore((state) => state.token);
  const hasHydrated = useUserStore((state) => state.hasHydrated);

  useEffect(() => {
    if (!hasHydrated) return;

    SplashScreen.hideAsync().catch(() => {});

    const inAuthGroup = segments[0] === 'auth';

    if (!token && !inAuthGroup) {
      // Usuário não autenticado tentando acessar rota protegida -> redireciona para login
      router.replace('/auth/login' as any);
    } else if (token && inAuthGroup) {
      // Usuário já autenticado tentando acessar login/registro -> redireciona para a Home
      router.replace('/');
    }
  }, [token, hasHydrated, segments, router]);

  // Evita flash da tela protegida enquanto o estado persistido está hidratando
  if (!hasHydrated) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1CB0F6" />
      </View>
    );
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F7F9FC',
  },
});
