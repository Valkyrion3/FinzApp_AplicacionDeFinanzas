/**
 * Validators and sanitizers for user input
 * Provides comprehensive validation for all user inputs to prevent data integrity issues
 */

/**
 * Validates email format using RFC 5322 simplified pattern
 */
export const validarEmail = (email: string): boolean => {
  if (!email || typeof email !== 'string') return false;
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email.trim());
};

/**
 * Validates password strength
 * Requirements: min 6 chars, at least one letter and one number
 */
export const validarContrasena = (password: string): { valido: boolean; errores: string[] } => {
  const errores: string[] = [];
  
  if (!password || typeof password !== 'string') {
    return { valido: false, errores: ['La contraseña es requerida'] };
  }

  if (password.length < 6) {
    errores.push('La contraseña debe tener al menos 6 caracteres');
  }

  if (!/[a-zA-Z]/.test(password)) {
    errores.push('La contraseña debe contener letras');
  }

  if (!/[0-9]/.test(password)) {
    errores.push('La contraseña debe contener números');
  }

  return {
    valido: errores.length === 0,
    errores
  };
};

/**
 * Validates monetary amounts
 */
export const validarMonto = (monto: number | string): { valido: boolean; error?: string } => {
  const num = typeof monto === 'string' ? parseFloat(monto) : monto;

  if (!Number.isFinite(num)) {
    return { valido: false, error: 'El monto debe ser un número válido' };
  }

  if (num <= 0) {
    return { valido: false, error: 'El monto debe ser mayor a 0' };
  }

  if (num > 999999999) {
    return { valido: false, error: 'El monto es demasiado grande' };
  }

  // Check decimal places (max 2)
  if (!/^\d+(\.\d{1,2})?$/.test(num.toFixed(2))) {
    return { valido: false, error: 'Máximo 2 decimales permitidos' };
  }

  return { valido: true };
};

/**
 * Sanitizes user input by removing dangerous characters
 */
export const sanitizar = (input: string): string => {
  if (typeof input !== 'string') return '';
  
  return input
    .trim()
    .replace(/[<>\"'`]/g, '') // Remove dangerous HTML chars
    .substring(0, 255); // Limit length
};

/**
 * Validates user name format
 */
export const validarNombre = (nombre: string): { valido: boolean; error?: string } => {
  if (!nombre || typeof nombre !== 'string') {
    return { valido: false, error: 'El nombre es requerido' };
  }

  const sanitized = sanitizar(nombre);

  if (sanitized.length < 2) {
    return { valido: false, error: 'El nombre debe tener al menos 2 caracteres' };
  }

  if (sanitized.length > 50) {
    return { valido: false, error: 'El nombre es muy largo (máximo 50 caracteres)' };
  }

  if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s-]*$/.test(sanitized)) {
    return { valido: false, error: 'El nombre contiene caracteres no permitidos' };
  }

  return { valido: true };
};

/**
 * Validates category name
 */
export const validarCategoria = (categoria: string): boolean => {
  const categoriasValidas = [
    'alimentos', 'transporte', 'salud', 'educacion',
    'entretenimiento', 'servicios', 'compras', 'otros'
  ];
  return categoriasValidas.includes(categoria.toLowerCase());
};

/**
 * Validates transaction description
 */
export const validarDescripcion = (desc: string): { valido: boolean; error?: string } => {
  if (!desc || typeof desc !== 'string') {
    return { valido: true }; // Optional field
  }

  const sanitized = sanitizar(desc);

  if (sanitized.length > 500) {
    return { valido: false, error: 'La descripción es muy larga (máximo 500 caracteres)' };
  }

  return { valido: true };
};

/**
 * Validates date format (YYYY-MM-DD or timestamp)
 */
export const validarFecha = (fecha: string | number): { valido: boolean; error?: string } => {
  let date: Date;

  if (typeof fecha === 'number') {
    date = new Date(fecha);
  } else if (typeof fecha === 'string') {
    date = new Date(fecha);
  } else {
    return { valido: false, error: 'Formato de fecha inválido' };
  }

  if (isNaN(date.getTime())) {
    return { valido: false, error: 'La fecha no es válida' };
  }

  // Check if date is not too far in the future (max 10 years)
  const futuro = new Date();
  futuro.setFullYear(futuro.getFullYear() + 10);
  
  if (date > futuro) {
    return { valido: false, error: 'La fecha no puede ser más de 10 años en el futuro' };
  }

  return { valido: true };
};

/**
 * Validates wallet name
 */
export const validarNombreBilletera = (nombre: string): { valido: boolean; error?: string } => {
  if (!nombre || typeof nombre !== 'string') {
    return { valido: false, error: 'El nombre de la billetera es requerido' };
  }

  const sanitized = sanitizar(nombre);

  if (sanitized.length < 2) {
    return { valido: false, error: 'El nombre debe tener al menos 2 caracteres' };
  }

  if (sanitized.length > 50) {
    return { valido: false, error: 'El nombre es muy largo (máximo 50 caracteres)' };
  }

  return { valido: true };
};

/**
 * Comprehensive validation for login credentials
 */
export const validarCredencialesLogin = (
  correo: string,
  contrasena: string
): { valido: boolean; errores: string[] } => {
  const errores: string[] = [];

  if (!validarEmail(correo)) {
    errores.push('El correo no es válido');
  }

  if (!contrasena) {
    errores.push('La contraseña es requerida');
  }

  return {
    valido: errores.length === 0,
    errores
  };
};

/**
 * Comprehensive validation for registration
 */
export const validarRegistro = (
  correo: string,
  contrasena: string,
  nombre: string,
  apellido: string
): { valido: boolean; errores: string[] } => {
  const errores: string[] = [];

  const emailValidation = validarEmail(correo);
  if (!emailValidation) errores.push('El correo no es válido');

  const passwordValidation = validarContrasena(contrasena);
  if (!passwordValidation.valido) errores.push(...passwordValidation.errores);

  const nombreValidation = validarNombre(nombre);
  if (!nombreValidation.valido) errores.push(`Nombre: ${nombreValidation.error}`);

  const apellidoValidation = validarNombre(apellido);
  if (!apellidoValidation.valido) errores.push(`Apellido: ${apellidoValidation.error}`);

  return {
    valido: errores.length === 0,
    errores
  };
};
