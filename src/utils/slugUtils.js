/**
 * Utilidades para manejo de slugs en la aplicación
 */

// Palabras reservadas que no se pueden usar como slugs
const RESERVED_WORDS = [
  'admin', 'login', 'auth', 'api', 'assets', 'dashboard', 'r', 'settings', 
  'menu', 'public', 'static', 'null', 'undefined', 'www', 'app', 'help',
  'support', 'contact', 'about', 'terms', 'privacy', 'blog', 'news'
];

/**
 * Normaliza un slug removiendo acentos, convirtiendo a minúsculas y aplicando reglas
 * @param {string} input - El texto a normalizar
 * @returns {string} - El slug normalizado
 */
export function normalizeSlug(input) {
  if (!input || typeof input !== 'string') {
    return '';
  }

  return input
    // Convertir a minúsculas
    .toLowerCase()
    // Remover acentos y caracteres especiales
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    // Reemplazar espacios y caracteres no permitidos por guiones
    .replace(/[^a-z0-9-]/g, '-')
    // Colapsar guiones múltiples
    .replace(/-+/g, '-')
    // Remover guiones al inicio y final
    .replace(/^-+|-+$/g, '');
}

/**
 * Valida si un slug cumple con las reglas establecidas
 * @param {string} slug - El slug a validar
 * @returns {Object} - { isValid: boolean, error?: string }
 */
export function validateSlug(slug) {
  if (!slug || typeof slug !== 'string') {
    return { isValid: false, error: 'El slug es requerido' };
  }

  // Validar longitud
  if (slug.length < 3) {
    return { isValid: false, error: 'El slug debe tener al menos 3 caracteres' };
  }

  if (slug.length > 50) {
    return { isValid: false, error: 'El slug no puede tener más de 50 caracteres' };
  }

  // Validar formato con regex
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  if (!slugRegex.test(slug)) {
    return { 
      isValid: false, 
      error: 'El slug solo puede contener letras minúsculas, números y guiones (no al inicio o final)' 
    };
  }

  // Validar palabras reservadas
  if (RESERVED_WORDS.includes(slug)) {
    return { 
      isValid: false, 
      error: `"${slug}" es una palabra reservada y no se puede usar` 
    };
  }

  return { isValid: true };
}

/**
 * Genera un slug único basado en un texto, agregando números si es necesario
 * @param {string} text - El texto base
 * @param {Function} checkExists - Función async que verifica si el slug existe
 * @returns {Promise<string>} - El slug único generado
 */
export async function generateUniqueSlug(text, checkExists) {
  let baseSlug = normalizeSlug(text);
  
  // Si el slug base está vacío, usar un fallback
  if (!baseSlug) {
    baseSlug = 'restaurante';
  }

  // Validar el slug base
  const validation = validateSlug(baseSlug);
  if (!validation.isValid) {
    // Si no es válido, usar un fallback
    baseSlug = 'restaurante';
  }

  let slug = baseSlug;
  let counter = 1;

  // Verificar si el slug existe y generar uno único
  while (await checkExists(slug)) {
    slug = `${baseSlug}-${counter}`;
    counter++;
    
    // Prevenir loops infinitos
    if (counter > 1000) {
      throw new Error('No se pudo generar un slug único');
    }
  }

  return slug;
}

/**
 * Convierte un slug a su versión canónica (normalizada)
 * @param {string} slug - El slug a canonizar
 * @returns {string} - El slug canónico
 */
export function canonicalizeSlug(slug) {
  return normalizeSlug(slug);
}

/**
 * Verifica si dos slugs son equivalentes (mismo slug normalizado)
 * @param {string} slug1 - Primer slug
 * @param {string} slug2 - Segundo slug
 * @returns {boolean} - True si son equivalentes
 */
export function slugsAreEquivalent(slug1, slug2) {
  return normalizeSlug(slug1) === normalizeSlug(slug2);
}

/**
 * Genera sugerencias de slugs basadas en un texto
 * @param {string} text - El texto base
 * @returns {string[]} - Array de sugerencias de slugs
 */
export function generateSlugSuggestions(text) {
  if (!text) return [];

  const baseSlug = normalizeSlug(text);
  if (!baseSlug) return [];

  const suggestions = [baseSlug];

  // Agregar variaciones con números
  for (let i = 1; i <= 3; i++) {
    suggestions.push(`${baseSlug}-${i}`);
  }

  // Si el texto tiene múltiples palabras, crear variaciones
  const words = text.toLowerCase().split(/\s+/);
  if (words.length > 1) {
    // Usar solo las primeras palabras
    if (words.length >= 2) {
      const shortSlug = normalizeSlug(words.slice(0, 2).join(' '));
      if (shortSlug && shortSlug !== baseSlug) {
        suggestions.push(shortSlug);
      }
    }

    // Usar iniciales
    if (words.length >= 2) {
      const initials = words.map(word => word.charAt(0)).join('');
      const initialsSlug = normalizeSlug(initials);
      if (initialsSlug && initialsSlug.length >= 3) {
        suggestions.push(initialsSlug);
      }
    }
  }

  // Filtrar duplicados y validar
  return [...new Set(suggestions)].filter(slug => {
    const validation = validateSlug(slug);
    return validation.isValid;
  });
}
