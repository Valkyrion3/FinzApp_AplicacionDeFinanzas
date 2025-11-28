import { Ionicons } from '@expo/vector-icons';
import { Tabs, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Platform } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '../../constants/Colors';
import { useAuth } from '../../hooks/useAuth';

export default function TabLayout() {
  const { estaAutenticado, cargando } = useAuth();
  const router = useRouter();

  // Redirect to main screen if not authenticated
  useEffect(() => {
    console.log('TabLayout - Auth check:', { estaAutenticado, cargando });
    if (!cargando && !estaAutenticado) {
      console.log('Not authenticated in tabs, redirecting to main...');
      router.replace('/');
    }
  }, [estaAutenticado, cargando]);

  // Don't render tabs until authentication is checked
  if (cargando) {
    return null;
  }

  // Don't render tabs if not authenticated
  if (!estaAutenticado) {
    return null;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: {
          backgroundColor: Colors.backgroundElevated,
          borderTopColor: Colors.glassBorder,
          borderTopWidth: 1,
          height: 80,
          paddingHorizontal: 20,
          paddingTop: 12,
          paddingBottom: Platform.OS === 'ios' ? 24 : 16,
          ...Platform.select({
            ios: {
              position: 'absolute',
            },
            default: {},
          }),
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          letterSpacing: 0.3,
        },
        tabBarItemStyle: {
          borderRadius: 16,
        },
        tabBarActiveTintColor: Colors.secondary,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarHideOnKeyboard: true,
      }}>
      <Tabs.Screen
        name="inicio"
        options={{
          title: 'Inicio',
          tabBarIcon: ({ color }) => <Ionicons size={24} name="home" color={color} />,
        }}
      />
      <Tabs.Screen
        name="billetera"
        options={{
          title: 'Billeteras',
          tabBarIcon: ({ color }) => <Ionicons size={24} name="wallet" color={color} />,
        }}
      />
      <Tabs.Screen
        name="estadisticas"
        options={{
          title: 'Estadísticas',
          tabBarIcon: ({ color }) => <Ionicons size={24} name="stats-chart" color={color} />,
        }}
      />
      <Tabs.Screen
        name="perfil"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color }) => <Ionicons size={24} name="person" color={color} />,
        }}
      />

      {/* Páginas ocultas pero accesibles */}
      <Tabs.Screen
        name="configuracion"
        options={{
          href: null, // Oculta de la barra de navegación
        }}
      />
      <Tabs.Screen
        name="nueva-billetera"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="detalle-billetera"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="editar-billetera"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="nueva-transaccion"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="editar-transaccion"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="estadisticas-usuario"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="editar-perfil"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="privacidad"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="cerrar-sesion"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="buscar"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
