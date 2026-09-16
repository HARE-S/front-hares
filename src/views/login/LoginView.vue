<script setup>
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { login } from '@/services/authService';

const router = useRouter();
const route = useRoute();

const email = ref('');
const password = ref('');
const error = ref('');
const loading = ref(false);

async function handleLogin() {
  error.value = '';
  loading.value = true;

  try {
    if (!email.value) {
      error.value = 'El correo es requerido';
      return;
    }

    if (!email.value.endsWith('@grupopenascal.com')) {
      error.value = 'Solo se permiten correos @grupopenascal.com';
      return;
    }

    const response = await login(email.value, password.value || '');

    if (response) {
      const next = route.query.next || '/';
      router.push(next);
    }
  } catch (err) {
    error.value = err.message || 'Error al iniciar sesión';
  } finally {
    loading.value = false;
  }
}

function handleKeydown(e) {
  if (e.key === 'Enter') handleLogin();
}
</script>

<template>
  <div class="login-page">
    <div class="login-box flat-card">
      <h1>HARES</h1>
      <p class="subtitle">Plataforma de Gestión de Comprensión Lectora</p>

      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label for="email">Correo corporativo</label>
          <input
            id="email"
            v-model="email"
            type="email"
            class="form-input"
            placeholder="usuario@grupopenascal.com"
            @keydown="handleKeydown"
            :disabled="loading"
          />
        </div>

        <div v-if="error" class="alert alert-danger">
          {{ error }}
        </div>

        <button type="submit" class="btn btn-primary" style="width: 100%;" :disabled="loading">
          {{ loading ? 'Autenticando...' : 'Acceder' }}
        </button>
      </form>

      <p class="hint">
        Solo se permiten correos con dominio @grupopenascal.com
      </p>
    </div>
  </div>
</template>

<style scoped>
.login-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: var(--gray-50);
  padding: 1rem;
}

.login-box {
  width: 100%;
  max-width: 400px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

h1 {
  text-align: center;
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.subtitle {
  text-align: center;
  color: var(--gray-600);
  font-size: 0.9rem;
  margin-bottom: 2rem;
}

.hint {
  margin-top: 1rem;
  text-align: center;
  color: var(--gray-500);
  font-size: 0.8rem;
}
</style>
