/*
 * Nota del autor: este documento fue actualizado manualmente el 29 de octubre de 2025 para ordenar y priorizar dependencias.
 * Cambios principales: categorización por prioridad, notas sobre compatibilidad con Expo SDK 54 y comandos de instalación.
 * Para más detalles revisa el historial de commits.
 */

// ============================================================================
// PRIORIDAD 1: CRÍTICA - Instalar ahora para seguridad
// ============================================================================

// 1. Encriptación de datos sensibles
// npm install expo-secure-store
// Reemplaza AsyncStorage para tokens y datos sensibles
/*
import * as SecureStore from 'expo-secure-store';

await SecureStore.setItemAsync('authToken', token);
const token = await SecureStore.getItemAsync('authToken');
*/

// 2. Hashing de contraseñas  
// npm install expo-crypto
// Para hashear contraseñas antes de guardar
/*
import * as Crypto from 'expo-crypto';

const digest = await Crypto.digestStringAsync(
  Crypto.CryptoDigestAlgorithm.SHA256,
  password
);
*/

// 3. Validación de esquemas (Alternative to manual validators)
// npm install zod
// O: npm install yup
/*
import { z } from 'zod';

const UserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2).max(50),
});

const validation = UserSchema.safeParse(userData);
*/

// ============================================================================
// PRIORIDAD 2: ALTA - Instalar en sprint 2-3
// ============================================================================

// 4. React Native Toast Notifications
// npm install react-native-toast-notifications
// Mejor que nuestra implementación Toast manual
/*
import { useToast } from 'react-native-toast-notifications';

const toast = useToast();
toast.show({ type: 'success', text: 'Guardado!' });
*/

// 5. Sentry for Error Tracking
// npm install @sentry/react-native
// Envía errores a Sentry en producción
/*
import * as Sentry from '@sentry/react-native';

Sentry.init({
  dsn: 'YOUR_SENTRY_DSN',
  environment: __DEV__ ? 'development' : 'production',
});

// En ErrorBoundary:
Sentry.captureException(error);
*/

// 6. Async Storage Encryption
// npm install react-native-encrypted-storage
// Reemplaza AsyncStorage con encriptación nativa
/*
import EncryptedStorage from 'react-native-encrypted-storage';

await EncryptedStorage.setItem('sesion', JSON.stringify(user));
const sesion = await EncryptedStorage.getItem('sesion');
*/

// 7. Redux for State Management (if app grows)
// npm install @reduxjs/toolkit react-redux
// Centraliza estado global de auth, billeteras, etc.
/*
import { createSlice } from '@reduxjs/toolkit';

const authSlice = createSlice({
  name: 'auth',
  initialState: { user: null },
  reducers: { setUser: (state, action) => { state.user = action.payload; } }
});
*/

// ============================================================================
// PRIORIDAD 3: MEDIA - Performance & Testing
// ============================================================================

// 8. Jest for Testing
// npm install --save-dev jest @types/jest babel-jest
// Unit testing para validators, hooks, etc.
/*
test('validarEmail debe rechazar emails inválidos', () => {
  expect(validarEmail('invalid')).toBe(false);
  expect(validarEmail('valid@email.com')).toBe(true);
});
*/

// 9. React Native Testing Library
// npm install --save-dev @testing-library/react-native
// Testing de componentes
/*
import { render, screen } from '@testing-library/react-native';

test('Button debe ser clickeable', () => {
  render(<PrimaryButton label="Click" onPress={jest.fn()} />);
  expect(screen.getByText('Click')).toBeEnabled();
});
*/

// 10. Lodash for Utilities
// npm install lodash
// Funciones útiles de utilería
/*
import { debounce, throttle, isEmpty } from 'lodash';

const debouncedSearch = debounce((query) => { /* search */ }, 300);
*/

// 11. Day.js for Date Handling
// npm install dayjs
// Mejor que new Date() para fechas
/*
import dayjs from 'dayjs';

dayjs().format('DD/MM/YYYY');
dayjs().add(1, 'day').toDate();
*/

// 12. NanoID for Unique IDs
// npm install nanoid
// Generar IDs únicos (mejor que uuid)
/*
import { nanoid } from 'nanoid';

const id = nanoid(); // más corto que uuid
*/

// ============================================================================
// PRIORIDAD 4: NICE TO HAVE - UX Enhancements
// ============================================================================

// 13. Lottie Animations
// npm install lottie-react-native
// Animaciones hermosas y livianas
/*
import LottieView from 'lottie-react-native';

<LottieView source={require('./loading.json')} autoPlay />
*/

// 14. Linear Gradient
// npm install expo-linear-gradient
// Ya tienes GradientBackground, esto es alternativa nativa
/*
import { LinearGradient } from 'expo-linear-gradient';

<LinearGradient colors={['#667eea', '#764ba2']}> 
  {/* content */}
</LinearGradient>
*/

// 15. Haptic Feedback
// Ya tienes expo-haptics, pero puedes usarlo más:
/*
import * as Haptics from 'expo-haptics';

Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
Haptics.selectionAsync(); // Al tocar botones
*/

// 16. React Query for Data Fetching
// npm install @tanstack/react-query
// Si necesitas integración con backend
/*
import { useQuery } from '@tanstack/react-query';

const { data, isLoading } = useQuery({
  queryKey: ['billeteras'],
  queryFn: obtenerBilleteras
});
*/

// ============================================================================
// DEPENDENCIAS YA INSTALADAS (No instalar de nuevo)
// ============================================================================

const alreadyInstalledDependencies = [
  'expo',
  'react-native',
  'expo-router',
  'expo-sqlite',
  '@react-native-async-storage/async-storage',
  'react-native-chart-kit',
  '@expo/vector-icons',
  'typescript',
  'expo-haptics',
  'expo-image-picker',
];

// ============================================================================
// INSTALLATION GUIDE
// ============================================================================

/*
PASO 1: Copia el comando para tu dependencia deseada

PASO 2: Ejecuta en terminal:
npm install <package-name>

PASO 3: Para dev dependencies:
npm install --save-dev <package-name>

PASO 4: Reinicia el servidor:
npm start

RECOMENDACIÓN DE INSTALACIÓN:
─────────────────────────────
✅ WEEK 1: expo-secure-store, expo-crypto
✅ WEEK 2: zod (or yup), sentry
✅ WEEK 3: jest, react-native-toast-notifications
✅ WEEK 4: lodash, dayjs, nanoid
✅ WEEK 5+: Animaciones y features opcionales
*/

export {};
