import { ref, computed } from 'vue';
import { getCurrentUser, logout as logoutService } from '@/services/authService';

const user = ref(null);
const loading = ref(false);
const initialized = ref(false);
const sessionExpired = ref(false);

const SESSION_KEY = '__hares_session_dev__';
const isDev = import.meta.env.DEV;

// Recuperar sesión de sessionStorage en desarrollo
function getStoredSession() {
  if (!isDev) return null;
  try {
    const stored = sessionStorage.getItem(SESSION_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

// Guardar sesión en sessionStorage en desarrollo
function storeSession(userData) {
  if (!isDev) return;
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(userData));
  } catch {
    console.warn('No se pudo guardar sesión en sessionStorage');
  }
}

// Limpiar sesión de sessionStorage
function clearStoredSession() {
  try {
    sessionStorage.removeItem(SESSION_KEY);
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
    if (initialized.value) return;

    loading.value = true;
    try {
      // Primero intentar obtener del backend (cookies HttpOnly en producción)
      const data = await getCurrentUser();
      if (data) {
        user.value = data;
        sessionExpired.value = false;
        // En desarrollo, guardar también en sessionStorage
        storeSession(data);
      } else {
        user.value = null;
      }
    } catch (err) {
      // Intenta recuperar desde sessionStorage (en ambos entornos para mayor resiliencia)
      const stored = getStoredSession();
      if (stored) {
        user.value = stored;
        sessionExpired.value = false;
      } else {
        user.value = null;
      }
    } finally {
      loading.value = false;
      initialized.value = true;
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
      clearStoredSession();
      // Solo redirigir si estamos en un contexto donde hay router
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
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
    user.value = userData;
    sessionExpired.value = false;
    storeSession(userData);
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
