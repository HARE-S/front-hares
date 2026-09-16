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
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.pending-box {
  background: white;
  border-radius: 8px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
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
  color: #333;
  font-size: 1.5rem;
}

p {
  margin: 0.5rem 0;
  color: #666;
  line-height: 1.5;
}

.secondary {
  color: #999;
  font-size: 0.9rem;
  margin: 1.5rem 0 0;
}

.logout-btn {
  margin-top: 2rem;
  padding: 0.75rem 1.5rem;
  background-color: #667eea;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}

.logout-btn:hover {
  background-color: #5568d3;
}
</style>
