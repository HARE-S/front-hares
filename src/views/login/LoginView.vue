<script setup>
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { login } from '@/services/authService';
import { useAuth } from '@/composables/useAuth';

const router = useRouter();
const route = useRoute();
const { setUser } = useAuth();

const mode = ref('login'); // 'login', 'register', 'forgot'
const email = ref('');
const password = ref('');
const passwordConfirm = ref('');
const firstName = ref('');
const lastName = ref('');
const center = ref('');
const role = ref('');
const error = ref('');
const success = ref('');
const loading = ref(false);
const forgotEmail = ref('');
const showPassword = ref(false);
const showPasswordConfirm = ref(false);
const sessionExpired = ref(route?.query?.expired === 'true');

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
      // Establecer usuario inmediatamente para que el router guard lo detecte
      setUser(response);
      const next = route.query.next || '/dashboard';
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
      loading.value = false;
      return;
    }

    if (!email.value.endsWith('@grupopenascal.com')) {
      error.value = 'Solo se permiten correos @grupopenascal.com';
      loading.value = false;
      return;
    }

    if (!password.value) {
      error.value = 'La contraseña es requerida';
      loading.value = false;
      return;
    }

    if (password.value.length < 8) {
      error.value = 'La contraseña debe tener al menos 8 caracteres';
      loading.value = false;
      return;
    }

    if (password.value !== passwordConfirm.value) {
      error.value = 'Las contraseñas no coinciden';
      loading.value = false;
      return;
    }

    const res = await fetch('/api/v1/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: email.value,
        password: password.value,
        firstName: firstName.value || email.value.split('@')[0],
        lastName: lastName.value || '',
        center: center.value || '',
        role: role.value || ''
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
    firstName.value = '';
    lastName.value = '';
    center.value = '';
    role.value = '';

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

async function handleForgot() {
  error.value = '';
  success.value = '';
  loading.value = true;

  try {
    if (!forgotEmail.value) {
      error.value = 'Ingresa tu correo';
      loading.value = false;
      return;
    }

    if (!forgotEmail.value.endsWith('@grupopenascal.com')) {
      error.value = 'Solo se permiten correos @grupopenascal.com';
      loading.value = false;
      return;
    }

    const res = await fetch('/api/v1/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: forgotEmail.value })
    });

    const data = await res.json();

    if (!res.ok) {
      error.value = data.error || 'Error al enviar enlace';
      return;
    }

    success.value = data.message || 'Se envió un enlace de recuperación a tu correo.';
    forgotEmail.value = '';

    setTimeout(() => {
      mode.value = 'login';
      success.value = '';
    }, 4000);
  } catch (err) {
    error.value = err.message || 'Error al procesar solicitud';
  } finally {
    loading.value = false;
  }
}

function handleKeydown(e) {
  if (e.key === 'Enter' && !loading.value) {
    if (mode.value === 'login') handleLogin();
    else if (mode.value === 'register') handleRegister();
    else if (mode.value === 'forgot') handleForgot();
  }
}
</script>

<template>
  <div class="login-page">
    <div class="login-box">
      <div class="logo-header">
        <img src="/logo-hares.png" alt="HARE-S" class="logo-img" />
        <h1>HARES</h1>
      </div>
      <p class="subtitle">Plataforma de Gestión de Comprensión Lectora</p>

      <!-- Mensaje de sesión expirada -->
      <div v-if="sessionExpired" class="alert alert-info">
        Tu sesión ha expirado. Por favor, vuelve a acceder.
      </div>

      <!-- Tabs -->
      <div class="auth-tabs" v-if="mode !== 'forgot'">
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
          <div class="password-wrapper">
            <input
              id="password-login"
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              class="form-input"
              placeholder="Contraseña"
              @keydown="handleKeydown"
              :disabled="loading"
            />
            <button
              type="button"
              class="password-toggle"
              @click="showPassword = !showPassword"
              :disabled="loading"
              :title="showPassword ? 'Ocultar' : 'Mostrar'"
            >
              <svg v-if="!showPassword" viewBox="0 0 24 24" class="icon-eye">
                <path d="M12 5C7 5 2.73 8.11 1 12.46c1.73 4.35 6 7.54 11 7.54s9.27-3.19 11-7.54C21.27 8.11 17 5 12 5m0 9c-1.38 0-2.5-1.12-2.5-2.5S10.62 8.5 12 8.5s2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
              <svg v-else viewBox="0 0 24 24" class="icon-eye">
                <path d="M11.83 9L15.64 12.81c.04-.25.08-.5.08-.81 0-1.66-1.34-3-3-3-.29 0-.54.04-.81.08M7.4 6.9L6.1 5.6C3.12 7.97 1 11.3 1 12.46c1.73 4.35 6 7.54 11 7.54 1.25 0 2.45-.2 3.6-.57l-2.64-2.64c-.9.36-1.95.58-3.1.58-1.66 0-3-1.34-3-3 0-1.13.22-2.2.57-3.1zM21 4.45L19.55 3 3 19.55 4.45 21 21 4.45M12 4c5 0 9.27 3.19 11 7.54-1.73 4.35-6 7.54-11 7.54S2.73 16.35 1 12c1.73-4.35 6-7.54 11-7.54z"/>
              </svg>
            </button>
          </div>
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
        <div class="form-row">
          <div class="form-group">
            <label for="firstName">Nombre</label>
            <input
              id="firstName"
              v-model="firstName"
              type="text"
              class="form-input"
              placeholder="Juan"
              @keydown="handleKeydown"
              :disabled="loading"
            />
          </div>
          <div class="form-group">
            <label for="lastName">Apellido</label>
            <input
              id="lastName"
              v-model="lastName"
              type="text"
              class="form-input"
              placeholder="Pérez"
              @keydown="handleKeydown"
              :disabled="loading"
            />
          </div>
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

        <div class="form-row">
          <div class="form-group">
            <label for="center">Centro (opcional)</label>
            <input
              id="center"
              v-model="center"
              type="text"
              class="form-input"
              placeholder="Ej: Botusbaru, Centro 2"
              @keydown="handleKeydown"
              :disabled="loading"
            />
          </div>
          <div class="form-group">
            <label for="role">Rol (opcional)</label>
            <select
              id="role"
              v-model="role"
              class="form-input"
              :disabled="loading"
            >
              <option value="">Selecciona un rol</option>
              <option value="teacher">Docente</option>
              <option value="coordinator">Coordinador</option>
              <option value="director">Director</option>
              <option value="admin">Administrador</option>
              <option value="superadmin">Super Administrador</option>
            </select>
          </div>
        </div>

        <div class="form-group">
          <label for="password-register">Contraseña</label>
          <div class="password-wrapper">
            <input
              id="password-register"
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              class="form-input"
              placeholder="Contraseña"
              @keydown="handleKeydown"
              :disabled="loading"
              required
            />
            <button
              type="button"
              class="password-toggle"
              @click="showPassword = !showPassword"
              :disabled="loading"
              :title="showPassword ? 'Ocultar' : 'Mostrar'"
            >
              <svg v-if="!showPassword" viewBox="0 0 24 24" class="icon-eye">
                <path d="M12 5C7 5 2.73 8.11 1 12.46c1.73 4.35 6 7.54 11 7.54s9.27-3.19 11-7.54C21.27 8.11 17 5 12 5m0 9c-1.38 0-2.5-1.12-2.5-2.5S10.62 8.5 12 8.5s2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
              <svg v-else viewBox="0 0 24 24" class="icon-eye">
                <path d="M11.83 9L15.64 12.81c.04-.25.08-.5.08-.81 0-1.66-1.34-3-3-3-.29 0-.54.04-.81.08M7.4 6.9L6.1 5.6C3.12 7.97 1 11.3 1 12.46c1.73 4.35 6 7.54 11 7.54 1.25 0 2.45-.2 3.6-.57l-2.64-2.64c-.9.36-1.95.58-3.1.58-1.66 0-3-1.34-3-3 0-1.13.22-2.2.57-3.1zM21 4.45L19.55 3 3 19.55 4.45 21 21 4.45M12 4c5 0 9.27 3.19 11 7.54-1.73 4.35-6 7.54-11 7.54S2.73 16.35 1 12c1.73-4.35 6-7.54 11-7.54z"/>
              </svg>
            </button>
          </div>
        </div>

        <div class="form-group">
          <label for="password-confirm">Confirmar contraseña</label>
          <div class="password-wrapper">
            <input
              id="password-confirm"
              v-model="passwordConfirm"
              :type="showPasswordConfirm ? 'text' : 'password'"
              class="form-input"
              placeholder="Confirmar contraseña"
              @keydown="handleKeydown"
              :disabled="loading"
              required
            />
            <button
              type="button"
              class="password-toggle"
              @click="showPasswordConfirm = !showPasswordConfirm"
              :disabled="loading"
              :title="showPasswordConfirm ? 'Ocultar' : 'Mostrar'"
            >
              <svg v-if="!showPasswordConfirm" viewBox="0 0 24 24" class="icon-eye">
                <path d="M12 5C7 5 2.73 8.11 1 12.46c1.73 4.35 6 7.54 11 7.54s9.27-3.19 11-7.54C21.27 8.11 17 5 12 5m0 9c-1.38 0-2.5-1.12-2.5-2.5S10.62 8.5 12 8.5s2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
              <svg v-else viewBox="0 0 24 24" class="icon-eye">
                <path d="M11.83 9L15.64 12.81c.04-.25.08-.5.08-.81 0-1.66-1.34-3-3-3-.29 0-.54.04-.81.08M7.4 6.9L6.1 5.6C3.12 7.97 1 11.3 1 12.46c1.73 4.35 6 7.54 11 7.54 1.25 0 2.45-.2 3.6-.57l-2.64-2.64c-.9.36-1.95.58-3.1.58-1.66 0-3-1.34-3-3 0-1.13.22-2.2.57-3.1zM21 4.45L19.55 3 3 19.55 4.45 21 21 4.45M12 4c5 0 9.27 3.19 11 7.54-1.73 4.35-6 7.54-11 7.54S2.73 16.35 1 12c1.73-4.35 6-7.54 11-7.54z"/>
              </svg>
            </button>
          </div>
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

      <!-- Formulario Recuperar Contraseña -->
      <form v-if="mode === 'forgot'" @submit.prevent="handleForgot">
        <button type="button" class="back-link" @click="mode = 'login'; error = ''; success = ''">
          ← Volver a acceder
        </button>

        <div class="form-group">
          <label for="forgot-email">Correo corporativo</label>
          <input
            id="forgot-email"
            v-model="forgotEmail"
            type="email"
            class="form-input"
            placeholder="usuario@grupopenascal.com"
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
          {{ loading ? 'Enviando...' : 'Enviar enlace de recuperación' }}
        </button>
      </form>

      <!-- Link de recuperación de contraseña (solo en login) -->
      <button v-if="mode === 'login'" type="button" class="forgot-link" @click="mode = 'forgot'; error = ''; success = ''">
        ¿Olvidaste tu contraseña?
      </button>

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

.logo-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  margin-bottom: 1.5rem;
}

.logo-img {
  width: 100px;
  height: 100px;
  object-fit: contain;
}

h1 {
  text-align: center;
  font-size: 2rem;
  margin: 0;
  color: #0d9488;
  font-weight: 700;
  letter-spacing: -0.5px;
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

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.form-row .form-group {
  margin-bottom: 0;
}

@media (max-width: 480px) {
  .form-row {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }
}

.password-wrapper {
  position: relative;
  display: flex;
  align-items: center;
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

.password-wrapper .form-input {
  padding-right: 3rem;
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

.password-toggle {
  position: absolute;
  right: 0.5rem;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.4rem;
  color: var(--gray-400);
  transition: var(--transition);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
}

.icon-eye {
  width: 24px;
  height: 24px;
  fill: currentColor;
}

.password-toggle:hover:not(:disabled) {
  color: var(--green-600);
}

.password-toggle:focus:not(:disabled) {
  outline: none;
  color: var(--green-600);
}

.password-toggle:disabled {
  opacity: 0.4;
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

.alert-info {
  background-color: var(--green-50);
  border: 1px solid var(--green-200);
  color: var(--green-900);
  padding: 0.75rem 1rem;
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  margin-bottom: 1.25rem;
}

.forgot-link {
  width: 100%;
  padding: 0.75rem;
  margin-top: 1rem;
  background: none;
  border: none;
  color: var(--green-600);
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: var(--transition);
  text-decoration: underline;
}

.forgot-link:hover {
  color: var(--green-700);
}

.back-link {
  display: block;
  margin-bottom: 1.5rem;
  background: none;
  border: none;
  color: var(--green-600);
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  padding: 0;
  transition: var(--transition);
}

.back-link:hover {
  color: var(--green-700);
}

.hint {
  margin-top: 1.5rem;
  text-align: center;
  color: var(--gray-500);
  font-size: 0.8rem;
  line-height: 1.4;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.btn:disabled {
  position: relative;
}

.btn:disabled::after {
  content: '';
  position: absolute;
  width: 16px;
  height: 16px;
  margin: auto;
  border: 2px solid transparent;
  border-radius: 50%;
  border-top-color: currentColor;
  animation: spin 0.8s linear infinite;
  right: 1rem;
}
</style>
