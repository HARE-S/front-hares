<script setup>
import { useAuth } from '@/composables/useAuth';
import { useRouter } from 'vue-router';

const { user, logout } = useAuth();
const router = useRouter();

async function handleLogout() {
  await logout();
  router.push('/login');
}
</script>

<template>
  <aside class="app-sidebar">
    <div class="sidebar-header">
      <h2>HARES</h2>
    </div>

    <nav class="sidebar-nav">
      <router-link to="/" class="nav-link" active-class="active">
        📊 Dashboard
      </router-link>

      <router-link to="/centers" class="nav-link" active-class="active">
        🏫 Centros
      </router-link>

      <router-link to="/tests" class="nav-link" active-class="active">
        📝 Pruebas
      </router-link>

      <router-link to="/books" class="nav-link" active-class="active">
        📚 Libros
      </router-link>

      <router-link to="/bulk-entry" class="nav-link" active-class="active">
        📋 Registro en Lote
      </router-link>

      <router-link to="/reports" class="nav-link" active-class="active">
        📑 Informes
      </router-link>

      <router-link to="/import" class="nav-link" active-class="active">
        ⬆️ Importar
      </router-link>

      <router-link v-if="user?.role === 'admin'" to="/users-admin" class="nav-link" active-class="active">
        👥 Usuarios
      </router-link>
    </nav>

    <div class="sidebar-footer">
      <div class="user-info" v-if="user">
        <p class="user-email">{{ user.email }}</p>
        <p class="user-role">{{ user.role }}</p>
      </div>
      <button @click="handleLogout" class="logout-btn">
        Cerrar sesión
      </button>
    </div>
  </aside>
</template>

<style scoped>
.app-sidebar {
  width: 280px;
  background-color: var(--green-950);
  color: var(--white);
  display: flex;
  flex-direction: column;
  height: 100vh;
  border-right: 1px solid var(--green-900);
}

.sidebar-header {
  padding: 1.5rem;
  border-bottom: 1px solid var(--green-900);
}

.sidebar-header h2 {
  margin: 0;
  font-size: 1.5rem;
  color: var(--green-400);
  font-weight: 700;
}

.sidebar-nav {
  flex: 1;
  overflow-y: auto;
  padding: 1rem 0;
}

.nav-link {
  display: block;
  padding: 0.75rem 1.5rem;
  color: var(--green-100);
  text-decoration: none;
  transition: var(--transition);
  border-left: 3px solid transparent;
}

.nav-link:hover {
  background-color: var(--green-900);
  padding-left: 1.75rem;
}

.nav-link.active {
  background-color: var(--green-900);
  border-left-color: var(--green-400);
  color: var(--green-300);
  font-weight: 600;
}

.sidebar-footer {
  padding: 1rem;
  border-top: 1px solid var(--green-900);
}

.user-info {
  margin-bottom: 1rem;
  padding: 0.75rem;
  background-color: var(--green-900);
  border-radius: var(--radius-md);
  font-size: 0.85rem;
}

.user-email {
  margin: 0 0 0.25rem;
  font-weight: 600;
  color: var(--green-200);
}

.user-role {
  margin: 0;
  color: var(--green-300);
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.logout-btn {
  width: 100%;
  padding: 0.65rem;
  background-color: var(--danger);
  color: var(--white);
  border: 1.5px solid var(--danger);
  border-radius: var(--radius-md);
  font-weight: 600;
  cursor: pointer;
  transition: var(--transition);
  font-size: 0.9rem;
}

.logout-btn:hover {
  background-color: #991b1b;
  border-color: #991b1b;
}
</style>
