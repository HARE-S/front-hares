import { ref, computed } from 'vue';
import { getCurrentUser, logout as logoutService } from '@/services/authService';

const user = ref(null);
const loading = ref(false);
const initialized = ref(false);

export function useAuth() {
  const isAuthenticated = computed(() => user.value !== null);
  const isPending = computed(() => user.value?.role === 'pending');

  const hasRole = (...roles) => {
    if (user.value === null) return true;
    return roles.includes(user.value.role);
  };

  async function load() {
    if (initialized.value && user.value !== null) return;

    loading.value = true;
    try {
      const data = await getCurrentUser();
      if (data) {
        user.value = data;
      }
    } catch (err) {
      user.value = null;
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
      initialized.value = false;
    }
  }

  return {
    user,
    loading,
    isAuthenticated,
    isPending,
    hasRole,
    load,
    logout
  };
}
