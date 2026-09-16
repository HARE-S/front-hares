<script setup>
import { useAuth } from '@/composables/useAuth';
import { useRouter } from 'vue-router';

const { logout } = useAuth();
const router = useRouter();

async function handleLogout() {
  await logout();
  router.push('/login');
}
</script>

<template>
  <div class="pending-container">
    <div class="pending-box">
      <div class="icon">⏳</div>
      <h1>Cuenta Pendiente de Activación</h1>
      <p>
        Tu cuenta ha sido creada, pero aún no ha sido activada por un administrador.
      </p>
      <p class="secondary">
        Por favor, contacta con tu coordinador para completar la activación.
      </p>

      <button @click="handleLogout" class="logout-btn">
        Cerrar sesión
      </button>
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
  padding: 2rem;
  width: 100%;
  max-width: 500px;
  text-align: center;
}

.icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

h1 {
  margin: 0 0 1rem;
  color: var(--green-950);
  font-size: 1.5rem;
  font-weight: 700;
}

p {
  margin: 0.5rem 0;
  color: var(--gray-600);
  line-height: 1.6;
}

.secondary {
  color: var(--gray-500);
  font-size: 0.9rem;
  margin: 1.5rem 0 0;
}

.logout-btn {
  margin-top: 2rem;
  padding: 0.65rem 1.25rem;
  background-color: var(--green-600);
  color: var(--white);
  border: 1.5px solid var(--green-600);
  border-radius: var(--radius-md);
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: var(--transition);
}

.logout-btn:hover {
  background-color: var(--green-700);
  border-color: var(--green-700);
}
</style>
