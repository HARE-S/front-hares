import { ref, computed } from 'vue';
import { getCurrentUser, logout as logoutService } from '@/services/authService';

const user = ref(null);
const loading = ref(false);
const initialized = ref(false);
const sessionExpired = ref(false);

const SESSION_KEY = '__hares_session_dev__';
const isDev = import.meta.env.DEV;

// Recuperar sesión del almacenamiento
function getStoredSession() {
  try {
    const stored = sessionStorage.getItem(SESSION_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

// Guardar sesión en almacenamiento
function storeSession(userData) {
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(userData));
  } catch {
    console.warn('No se pudo guardar sesión en almacenamiento');
  }
}

// Limpiar sesión del almacenamiento
function clearStoredSession() {
  try {
    sessionStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem('access_token');
  } catch {
    // ignore
  }
}

export function useAuth() {
  const isAuthenticated = computed(() => user.value !== null);
  const isPending = computed(() => user.value?.role === 'pending');

  const hasRole = (...roles) => {
    if (user.value === null) return false;
    return roles.includes(user.value.role);
  };

  async function load() {
    if (initialized.value) {
      console.log('[useAuth] load() ya fue inicializado, retornando');
      return;
    }

    console.log('[useAuth] Iniciando load()');
    loading.value = true;
    try {
      // Primero intentar obtener del backend (cookies HttpOnly en producción)
      console.log('[useAuth] Llamando getCurrentUser()...');
      const data = await getCurrentUser();
      console.log('[useAuth] getCurrentUser() respondió:', data);
      if (data) {
        user.value = data;
        sessionExpired.value = false;
        storeSession(data);
        console.log('[useAuth] Usuario autenticado:', data.email);
      } else {
        const stored = getStoredSession();
        if (stored) {
          user.value = stored;
          sessionExpired.value = false;
          console.log('[useAuth] ✅ Sesión recuperada del almacenamiento');
        } else {
          user.value = null;
          console.log('[useAuth] No hay usuario autenticado');
        }
      }
    } catch (err) {
      console.log('[useAuth] Error en getCurrentUser():', err.message);
      const stored = getStoredSession();
      if (stored) {
        user.value = stored;
        sessionExpired.value = false;
        console.log('[useAuth] ✅ Sesión recuperada del almacenamiento');
      } else {
        user.value = null;
      }
      sessionExpired.value = false;
    } finally {
      loading.value = false;
      initialized.value = true;
      console.log('[useAuth] load() completado, isAuthenticated:', user.value !== null);
    }
  }

  async function logout() {
    try {
      await logoutService();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      user.value = null;
      sessionExpired.value = false;
      initialized.value = false;
      clearStoredSession();
    }
  }

  function markSessionExpired() {
    sessionExpired.value = true;
    user.value = null;
  }

  function clearSessionExpired() {
    sessionExpired.value = false;
  }

  function setUser(userData) {
    const actualUser = userData?.user ? userData.user : userData;
    user.value = actualUser;
    sessionExpired.value = false;
    storeSession(actualUser);
    if (userData?.access_token) {
      try {
        sessionStorage.setItem('access_token', userData.access_token);
      } catch (e) {
        // ignore
      }
    }
  }

  return {
    user,
    loading,
    isAuthenticated,
    isPending,
    sessionExpired,
    hasRole,
    load,
    logout,
    markSessionExpired,
    clearSessionExpired,
    setUser
  };
}
