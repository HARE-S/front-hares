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
  background-color: #2c3e50;
  color: white;
  display: flex;
  flex-direction: column;
  height: 100vh;
  border-right: 1px solid #1a1a1a;
}

.sidebar-header {
  padding: 1.5rem;
  border-bottom: 1px solid #34495e;
}

.sidebar-header h2 {
  margin: 0;
  font-size: 1.5rem;
  color: #667eea;
}

.sidebar-nav {
  flex: 1;
  overflow-y: auto;
  padding: 1rem 0;
}

.nav-link {
  display: block;
  padding: 0.75rem 1.5rem;
  color: #ecf0f1;
  text-decoration: none;
  transition: all 0.2s;
  border-left: 3px solid transparent;
}

.nav-link:hover {
  background-color: #34495e;
  padding-left: 1.75rem;
}

.nav-link.active {
  background-color: #34495e;
  border-left-color: #667eea;
  color: #667eea;
  font-weight: 600;
}

.sidebar-footer {
  padding: 1rem;
  border-top: 1px solid #34495e;
}

.user-info {
  margin-bottom: 1rem;
  padding: 0.75rem;
  background-color: #34495e;
  border-radius: 4px;
  font-size: 0.85rem;
}

.user-email {
  margin: 0 0 0.25rem;
  font-weight: 600;
}

.user-role {
  margin: 0;
  color: #bdc3c7;
  font-size: 0.8rem;
  text-transform: uppercase;
}

.logout-btn {
  width: 100%;
  padding: 0.75rem;
  background-color: #e74c3c;
  color: white;
  border: none;
  border-radius: 4px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}

.logout-btn:hover {
  background-color: #c0392b;
}
</style>
