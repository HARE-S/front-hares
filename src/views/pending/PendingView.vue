<script setup>
import { useAuth } from '@/composables/useAuth';
import { useRouter } from 'vue-router';
import { ref } from 'vue';

const { user, logout } = useAuth();
const router = useRouter();
const showResendInfo = ref(false);
const resendLoading = ref(false);
const resendMessage = ref('');

async function handleLogout() {
  await logout();
  router.push('/login');
}

async function handleResendVerification() {
  resendLoading.value = true;
  resendMessage.value = '';

  try {
    const res = await fetch('/api/v1/auth/resend-verification', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: user.value.email })
    });

    const data = await res.json();

    if (res.ok) {
      resendMessage.value = '✅ Correo de verificación reenviado. Revisa tu bandeja.';
    } else {
      resendMessage.value = '❌ Error al reenviar. Intenta más tarde.';
    }
  } catch (err) {
    resendMessage.value = '❌ Error de conexión.';
  } finally {
    resendLoading.value = false;
  }
}
</script>

<template>
  <div class="pending-container">
    <div class="pending-box">
      <div class="icon">⏳</div>
      <h1>Cuenta Pendiente de Activación</h1>

      <p class="email-info">
        <strong>{{ user?.email }}</strong>
      </p>

      <p>
        Tu cuenta ha sido creada, pero aún no ha sido activada por un administrador.
      </p>

      <div class="checklist">
        <div class="checklist-item">
          <span class="check-icon">✓</span>
          <span>Cuenta registrada</span>
        </div>
        <div class="checklist-item pending">
          <span class="check-icon">⏳</span>
          <span>Activación por administrador</span>
        </div>
      </div>

      <div class="help-section">
        <h3>¿Qué puedo hacer?</h3>
        <ul>
          <li>Contacta a tu coordinador académico</li>
          <li>Verifica tu bandeja de entrada y spam</li>
          <li>Espera a que un administrador active tu cuenta</li>
        </ul>
      </div>

      <div class="actions">
        <button
          @click="handleResendVerification"
          class="btn btn-secondary"
          :disabled="resendLoading"
        >
          {{ resendLoading ? 'Reenviando...' : 'Reenviar verificación' }}
        </button>

        <button @click="handleLogout" class="btn btn-primary">
          Cerrar sesión
        </button>
      </div>

      <div v-if="resendMessage" :class="['resend-message', resendMessage.includes('✅') ? 'success' : 'error']">
        {{ resendMessage }}
      </div>

      <p class="secondary">
        ¿Problemas? Contacta a support@grupopenascal.com
      </p>
    </div>
  </div>
</template>

<style scoped>
.pending-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: var(--gray-50);
  padding: 1rem;
}

.pending-box {
  background-color: var(--white);
  border: 1px solid var(--gray-200);
  border-radius: var(--radius-lg);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  padding: 2.5rem;
  width: 100%;
  max-width: 520px;
  text-align: center;
}

.icon {
  font-size: 4rem;
  margin-bottom: 1.5rem;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}

h1 {
  margin: 0 0 1.5rem;
  color: var(--green-950);
  font-size: 1.75rem;
  font-weight: 700;
  line-height: 1.2;
}

h3 {
  margin: 0 0 1rem;
  color: var(--green-950);
  font-size: 1rem;
  font-weight: 600;
}

p {
  margin: 0.75rem 0;
  color: var(--gray-600);
  line-height: 1.6;
  font-size: 0.95rem;
}

.email-info {
  background-color: var(--green-50);
  border: 1px solid var(--green-200);
  padding: 0.75rem;
  border-radius: var(--radius-md);
  margin: 1rem 0 1.5rem;
  color: var(--green-900);
  font-weight: 600;
}

.checklist {
  margin: 2rem 0;
  text-align: left;
  background-color: var(--gray-50);
  border-radius: var(--radius-md);
  padding: 1.5rem;
}

.checklist-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.75rem;
  font-size: 0.95rem;
  color: var(--gray-700);
}

.checklist-item:last-child {
  margin-bottom: 0;
}

.checklist-item.pending {
  color: var(--gray-600);
  font-weight: 500;
}

.check-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  font-size: 1.2rem;
  flex-shrink: 0;
}

.checklist-item:not(.pending) .check-icon {
  background-color: var(--success-bg);
  color: var(--success-text);
}

.checklist-item.pending .check-icon {
  background-color: var(--gray-200);
  color: var(--gray-600);
}

.help-section {
  margin: 2rem 0;
  text-align: left;
  padding: 1.5rem;
  background-color: var(--green-50);
  border-left: 3px solid var(--green-600);
  border-radius: var(--radius-md);
}

.help-section ul {
  margin: 0;
  padding-left: 1.5rem;
  list-style: none;
}

.help-section li {
  margin: 0.5rem 0;
  color: var(--gray-700);
  font-size: 0.95rem;
}

.help-section li::before {
  content: '→ ';
  color: var(--green-600);
  font-weight: 600;
  margin-right: 0.5rem;
}

.actions {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin: 2rem 0;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-family: inherit;
  font-size: 0.9rem;
  font-weight: 600;
  padding: 0.75rem 1.5rem;
  border-radius: var(--radius-md);
  border: 1.5px solid transparent;
  cursor: pointer;
  transition: var(--transition);
  text-decoration: none;
}

.btn-primary {
  background-color: var(--green-600);
  color: var(--white);
  border-color: var(--green-600);
}

.btn-primary:hover:not(:disabled) {
  background-color: var(--green-700);
  border-color: var(--green-700);
}

.btn-secondary {
  background-color: var(--white);
  color: var(--green-600);
  border-color: var(--gray-300);
}

.btn-secondary:hover:not(:disabled) {
  background-color: var(--green-50);
  border-color: var(--green-300);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.resend-message {
  padding: 0.75rem;
  border-radius: var(--radius-md);
  font-size: 0.9rem;
  margin: 1rem 0 0;
}

.resend-message.success {
  background-color: var(--success-bg);
  color: var(--success-text);
  border: 1px solid var(--success-border);
}

.resend-message.error {
  background-color: var(--danger-bg);
  color: var(--danger-text);
  border: 1px solid var(--danger-border);
}

.secondary {
  color: var(--gray-500);
  font-size: 0.85rem;
  margin: 2rem 0 0;
}

@media (max-width: 600px) {
  .pending-box {
    padding: 1.5rem;
  }

  h1 {
    font-size: 1.5rem;
  }

  .icon {
    font-size: 3rem;
  }

  .actions {
    flex-direction: column;
  }

  .btn {
    width: 100%;
  }
}
</style>
