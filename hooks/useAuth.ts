import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { sanitizar } from '../lib/validators';

export interface Usuario {
  id: number;
  nombre: string;
  apellido: string;
  correo: string;
}

interface AuthState {
  usuario: Usuario | null;
  cargando: boolean;
  error: string | null;
}

/**
 * Custom hook for authentication management
 * Handles user session persistence and validation
 */
export const useAuth = () => {
  const [state, setState] = useState<AuthState>({
    usuario: null,
    cargando: true,
    error: null
  });

  // Verify saved session on app initialization
  useEffect(() => {
    verificarSesion();
  }, []);

  /**
   * Verify if user has an active session
   */
  const verificarSesion = async () => {
    try {
      setState(prev => ({ ...prev, cargando: true, error: null }));
      
      const sesionGuardada = await AsyncStorage.getItem('sesion_usuario');
      
      if (sesionGuardada) {
        const usuario = JSON.parse(sesionGuardada) as Usuario;
        
        // Validate user object structure
        if (usuario.id && usuario.nombre && usuario.correo) {
          setState(prev => ({ 
            ...prev, 
            usuario,
            cargando: false 
          }));
        } else {
          // Invalid session data, clear it
          await AsyncStorage.removeItem('sesion_usuario');
          setState(prev => ({ ...prev, cargando: false }));
        }
      } else {
        setState(prev => ({ ...prev, cargando: false }));
      }
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : 'Error desconocido';
      setState(prev => ({ 
        ...prev, 
        error: mensaje,
        cargando: false 
      }));
    }
  };

  /**
   * Save user session (with validation)
   */
  const guardarSesion = async (usuario: Usuario): Promise<boolean> => {
    try {
      // Validate user object
      if (!usuario.id || !usuario.nombre || !usuario.correo) {
        throw new Error('Datos de usuario incompletos');
      }

      // Sanitize before saving
      const usuarioSanitizado: Usuario = {
        id: usuario.id,
        nombre: sanitizar(usuario.nombre),
        apellido: sanitizar(usuario.apellido),
        correo: usuario.correo // Already validated at DB level
      };

      await AsyncStorage.setItem('sesion_usuario', JSON.stringify(usuarioSanitizado));
      setState(prev => ({ 
        ...prev, 
        usuario: usuarioSanitizado,
        error: null 
      }));
      return true;
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : 'Error al guardar sesión';
      setState(prev => ({ ...prev, error: mensaje }));
      return false;
    }
  };

  /**
   * Clear user session
   */
  const cerrarSesion = async (): Promise<boolean> => {
    try {
      await AsyncStorage.removeItem('sesion_usuario');
      setState({
        usuario: null,
        cargando: false,
        error: null
      });
      return true;
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : 'Error al cerrar sesión';
      setState(prev => ({ ...prev, error: mensaje }));
      return false;
    }
  };

  /**
   * Clear error state
   */
  const limpiarError = () => {
    setState(prev => ({ ...prev, error: null }));
  };

  return {
    usuario: state.usuario,
    cargando: state.cargando,
    error: state.error,
    guardarSesion,
    cerrarSesion,
    verificarSesion,
    limpiarError,
    estaAutenticado: !!state.usuario
  };
};
