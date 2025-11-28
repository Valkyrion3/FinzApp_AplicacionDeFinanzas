import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { GlassCard } from '../components/ui/GlassCard';
import { GradientBackground } from '../components/ui/GradientBackground';
import { PrimaryButton } from '../components/ui/PrimaryButton';
import { Colors } from '../constants/Colors';
import { useAuth } from '../hooks/useAuth';

export default function WelcomeScreen() {
  const router = useRouter();
  const { estaAutenticado, cargando } = useAuth();  // Redirigir automáticamente si el usuario ya está autenticado
  useEffect(() => {
    console.log('🔄 Index.tsx - Auth check:', { estaAutenticado, cargando });
    if (!cargando) {
      if (estaAutenticado) {
        console.log('✅ User is authenticated, redirecting to tabs...');
        // Small delay to ensure the session is properly set
        setTimeout(() => {
          router.replace('/(tabs)/inicio');
        }, 100);
      } else {
        console.log('❌ User not authenticated, staying on welcome screen');
      }
    }
  }, [estaAutenticado, cargando]);

  if (cargando) {
    return null; // El loading se maneja en _layout.tsx
  }

  return (
    <GradientBackground>
      <StatusBar style="light" />
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.heroCopy}>
            <Text style={styles.badge}>FinzApp</Text>
            <Text style={styles.title}>Gestiona tu dinero con elegancia</Text>
            <Text style={styles.subtitle}>
              Visualiza tus metas, crea billeteras inteligentes y mantén el control total de tus finanzas
              personales.
            </Text>
          </View>
          <Image source={require('../assets/images/icon.png')} style={styles.image} />
        </View>

        <GlassCard style={styles.card}>
          <Text style={styles.cardTitle}>Un nuevo estándar para tus finanzas</Text>
          <View style={styles.featureList}>
            <View style={styles.featureItem}>
              <Ionicons name="sparkles" size={20} color={Colors.secondary} />
              <Text style={styles.featureText}>Paneles vibrantes con información en tiempo real.</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="wallet" size={20} color={Colors.secondary} />
              <Text style={styles.featureText}>Organiza billeteras personales, familiares o de proyectos.</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="stats-chart" size={20} color={Colors.secondary} />
              <Text style={styles.featureText}>Estadísticas hermosas que convierten números en decisiones.</Text>
            </View>
          </View>

          <PrimaryButton label="Comenzar" onPress={() => router.push('/(auth)/iniciar-sesion')} />
          <TouchableOpacity onPress={() => router.push('/(auth)/registro')} style={styles.secondaryAction}>
            <Text style={styles.secondaryText}>¿Aún no tienes cuenta? Regístrate gratis</Text>
          </TouchableOpacity>
        </GlassCard>
      </View>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 70,
    paddingBottom: 60,
    paddingHorizontal: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 32,
    columnGap: 20,
  },
  badge: {
    color: Colors.secondary,
    fontWeight: '600',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  title: {
    fontSize: 32,
    lineHeight: 40,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  subtitle: {
    color: Colors.textSecondary,
    fontSize: 16,
    lineHeight: 24,
    maxWidth: 320,
  },
  image: {
    width: 160,
    height: 160,
    flexShrink: 0,
  },
  heroCopy: {
    flex: 1,
  },
  card: {
    rowGap: 20,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  featureList: {
    rowGap: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 12,
  },
  featureText: {
    color: Colors.textSecondary,
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  secondaryAction: {
    alignItems: 'center',
  },
  secondaryText: {
    color: Colors.textSecondary,
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});