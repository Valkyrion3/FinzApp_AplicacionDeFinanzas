/**
 * @fileoverview Hook de autenticación para gestión de sesión de usuario
 * @module hooks/useAuth
 * @description Proporciona funcionalidad completa de autenticación usando AsyncStorage
 * para persistir la sesión del usuario entre reinicios de la aplicación.
 * 
 * @example
 * const { usuario, guardarSesion, cerrarSesion, estaAutenticado } = useAuth();
 * 
 * @author Marco Campos, Erick Mora y Edgar Ventura
 * @version 1.0.0
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { sanitizar } from '../lib/validators';

/**
 * Datos del usuario autenticado (sin contraseña)
 * @interface Usuario
 */
export interface Usuario {
  id: number;
  nombre: string;
  apellido: string;
  correo: string;
}

/**
 * Estado interno del hook de autenticación
 * @interface AuthState
 * @private
 */
interface AuthState {
  usuario: Usuario | null;
  cargando: boolean;
  error: string | null;
}

/**
 * Hook personalizado para gestión de autenticación
 * @function useAuth
 * @description Maneja la persistencia de sesión usando AsyncStorage.
 * Verifica automáticamente si hay una sesión guardada al inicializar.
 * 
 * @returns {Object} Objeto con estado y funciones de autenticación
 * @returns {Usuario|null} returns.usuario - Usuario autenticado o null
 * @returns {boolean} returns.cargando - True mientras verifica sesión
 * @returns {string|null} returns.error - Mensaje de error o null
 * @returns {Function} returns.guardarSesion - Guarda sesión del usuario
 * @returns {Function} returns.cerrarSesion - Cierra sesión actual
 * @returns {Function} returns.verificarSesion - Reverifica sesión guardada
 * @returns {Function} returns.limpiarError - Limpia estado de error
 * @returns {boolean} returns.estaAutenticado - True si hay usuario autenticado
 * 
 * @example
 * function MiComponente() {
 *   const { usuario, estaAutenticado, cerrarSesion } = useAuth();
 *   
 *   if (!estaAutenticado) return <LoginScreen />;
 *   return <Text>Bienvenido, {usuario.nombre}</Text>;
 * }
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
