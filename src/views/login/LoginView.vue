<script setup>
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { login } from '@/services/authService';

const router = useRouter();
const route = useRoute();

const mode = ref('login');
const email = ref('');
const password = ref('');
const passwordConfirm = ref('');
const name = ref('');
const error = ref('');
const success = ref('');
const loading = ref(false);

async function handleLogin() {
  error.value = '';
  success.value = '';
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

async function handleRegister() {
  error.value = '';
  success.value = '';
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

    if (!password.value) {
      error.value = 'La contraseña es requerida';
      return;
    }

    if (password.value !== passwordConfirm.value) {
      error.value = 'Las contraseñas no coinciden';
      return;
    }

    const res = await fetch('/api/v1/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: email.value,
        password: password.value,
        name: name.value || email.value.split('@')[0]
      })
    });

    const data = await res.json();

    if (!res.ok) {
      error.value = data.error || 'Error al registrar';
      return;
    }

    success.value = data.message || 'Cuenta registrada exitosamente.';
    email.value = '';
    password.value = '';
    passwordConfirm.value = '';
    name.value = '';

    setTimeout(() => {
      mode.value = 'login';
      success.value = '';
    }, 3000);
  } catch (err) {
    error.value = err.message || 'Error al registrar';
  } finally {
    loading.value = false;
  }
}

function handleKeydown(e) {
  if (e.key === 'Enter' && !loading.value) {
    if (mode.value === 'login') handleLogin();
    else handleRegister();
  }
}
</script>

<template>
  <div class="login-page">
    <div class="login-box">
      <h1>HARES</h1>
      <p class="subtitle">Plataforma de Gestión de Comprensión Lectora</p>

      <!-- Tabs -->
      <div class="auth-tabs">
        <button
          :class="['tab', { active: mode === 'login' }]"
          @click="mode = 'login'; error = ''; success = ''"
        >
          Acceder
        </button>
        <button
          :class="['tab', { active: mode === 'register' }]"
          @click="mode = 'register'; error = ''; success = ''"
        >
          Registrarse
        </button>
      </div>

      <!-- Formulario Login -->
      <form v-if="mode === 'login'" @submit.prevent="handleLogin">
        <div class="form-group">
          <label for="email-login">Correo corporativo</label>
          <input
            id="email-login"
            v-model="email"
            type="email"
            class="form-input"
            placeholder="usuario@grupopenascal.com"
            @keydown="handleKeydown"
            :disabled="loading"
            required
          />
        </div>

        <div class="form-group">
          <label for="password-login">Contraseña</label>
          <input
            id="password-login"
            v-model="password"
            type="password"
            class="form-input"
            placeholder="Contraseña"
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

      <!-- Formulario Registro -->
      <form v-else @submit.prevent="handleRegister">
        <div class="form-group">
          <label for="name">Nombre (opcional)</label>
          <input
            id="name"
            v-model="name"
            type="text"
            class="form-input"
            placeholder="Tu nombre"
            @keydown="handleKeydown"
            :disabled="loading"
          />
        </div>

        <div class="form-group">
          <label for="email-register">Correo corporativo</label>
          <input
            id="email-register"
            v-model="email"
            type="email"
            class="form-input"
            placeholder="usuario@grupopenascal.com"
            @keydown="handleKeydown"
            :disabled="loading"
            required
          />
        </div>

        <div class="form-group">
          <label for="password-register">Contraseña</label>
          <input
            id="password-register"
            v-model="password"
            type="password"
            class="form-input"
            placeholder="Contraseña"
            @keydown="handleKeydown"
            :disabled="loading"
            required
          />
        </div>

        <div class="form-group">
          <label for="password-confirm">Confirmar contraseña</label>
          <input
            id="password-confirm"
            v-model="passwordConfirm"
            type="password"
            class="form-input"
            placeholder="Confirmar contraseña"
            @keydown="handleKeydown"
            :disabled="loading"
            required
          />
        </div>

        <div v-if="error" class="alert alert-danger">
          {{ error }}
        </div>

        <div v-if="success" class="alert alert-success">
          {{ success }}
        </div>

        <button type="submit" class="btn btn-primary" style="width: 100%;" :disabled="loading">
          {{ loading ? 'Registrando...' : 'Registrarse' }}
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
  background: linear-gradient(135deg, var(--green-900) 0%, var(--green-850) 100%);
  padding: 1rem;
}

.login-box {
  width: 100%;
  max-width: 420px;
  background-color: var(--white);
  border: 1px solid var(--gray-200);
  border-radius: var(--radius-lg);
  padding: 2.5rem;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
}

h1 {
  text-align: center;
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
  color: var(--green-700);
  font-weight: 700;
}

.subtitle {
  text-align: center;
  color: var(--gray-600);
  font-size: 0.95rem;
  margin-bottom: 1.5rem;
  line-height: 1.4;
}

.auth-tabs {
  display: flex;
  gap: 0;
  margin-bottom: 2rem;
  border-bottom: 2px solid var(--gray-200);
}

.tab {
  flex: 1;
  padding: 0.75rem;
  background: none;
  border: none;
  color: var(--gray-500);
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  border-bottom: 3px solid transparent;
  margin-bottom: -2px;
  transition: var(--transition);
}

.tab:hover {
  color: var(--green-600);
}

.tab.active {
  color: var(--green-600);
  border-bottom-color: var(--green-600);
}

.form-group {
  margin-bottom: 1.25rem;
}

.form-input {
  width: 100%;
  padding: 0.75rem 0.85rem;
  font-size: 0.95rem;
  border: 1.5px solid var(--gray-300);
  border-radius: var(--radius-md);
  background-color: var(--white);
  color: var(--gray-900);
  transition: var(--transition);
  font-family: inherit;
}

.form-input:focus {
  border-color: var(--green-600);
  box-shadow: 0 0 0 3px var(--green-100);
  outline: none;
}

.form-input::placeholder {
  color: var(--gray-400);
}

.form-input:disabled {
  background-color: var(--gray-50);
  color: var(--gray-500);
  cursor: not-allowed;
}

.alert {
  margin-bottom: 1.25rem;
}

.alert-success {
  background-color: var(--success-bg);
  border: 1px solid var(--success-border);
  color: var(--success-text);
  padding: 0.75rem 1rem;
  border-radius: var(--radius-md);
  font-size: 0.875rem;
}

.hint {
  margin-top: 1.5rem;
  text-align: center;
  color: var(--gray-500);
  font-size: 0.8rem;
  line-height: 1.4;
}
</style>
