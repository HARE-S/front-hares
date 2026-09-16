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
  <div class="login-container">
    <div class="login-box">
      <h1>HARES</h1>
      <p class="subtitle">Plataforma de Gestión de Comprensión Lectora</p>

      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label for="email">Correo corporativo</label>
          <input
            id="email"
            v-model="email"
            type="email"
            placeholder="usuario@grupopenascal.com"
            @keydown="handleKeydown"
            :disabled="loading"
          />
        </div>

        <div v-if="error" class="error-message">
          {{ error }}
        </div>

        <button type="submit" :disabled="loading">
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
.login-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-box {
  background: white;
  border-radius: 8px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  padding: 2rem;
  width: 100%;
  max-width: 400px;
}

h1 {
  margin: 0 0 0.5rem;
  text-align: center;
  color: #333;
  font-size: 2rem;
}

.subtitle {
  margin: 0 0 2rem;
  text-align: center;
  color: #666;
  font-size: 0.9rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  color: #333;
  font-weight: 500;
  font-size: 0.9rem;
}

input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  font-family: inherit;
}

input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

input:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
}

button {
  width: 100%;
  padding: 0.75rem;
  background-color: #667eea;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}

button:hover:not(:disabled) {
  background-color: #5568d3;
}

button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.error-message {
  color: #d32f2f;
  background-color: #ffebee;
  border: 1px solid #ffcdd2;
  border-radius: 4px;
  padding: 0.75rem;
  margin-bottom: 1rem;
  font-size: 0.9rem;
}

.hint {
  margin: 1rem 0 0;
  text-align: center;
  color: #999;
  font-size: 0.8rem;
}
</style>
