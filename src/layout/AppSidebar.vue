<script setup>
import { ref, computed } from 'vue';
import { useAuth } from '@/composables/useAuth';
import { useRouter } from 'vue-router';

const { user, logout } = useAuth();
const router = useRouter();
const showUserMenu = ref(false);

const userInitials = computed(() => {
  if (!user.value) return '';
  const parts = user.value.email.split('@')[0].split('.');
  return parts.map(p => p.charAt(0).toUpperCase()).join('');
});

const roleNames = {
  admin: 'Administrador',
  coordinator: 'Coordinador Pedagógico',
  teacher: 'Profesor',
  tutor: 'Tutor'
};

const formattedRole = computed(() => {
  if (!user.value) return '';
  return roleNames[user.value.role] || user.value.role;
});

async function handleLogout() {
  showUserMenu.value = false;
  await logout();
  router.push('/login');
}
</script>

<template>
  <aside class="app-sidebar">
    <!-- Header con logo -->
    <div class="sidebar-header">
      <div class="logo-section">
        <div class="logo-icon">
          <img src="/logo-hares.png" alt="HARE-S" class="logo-image" />
        </div>
        <div class="logo-text">
          <h2 class="logo-title">HARE-S</h2>
          <span class="logo-badge">EDU</span>
        </div>
      </div>
      <p class="foundation-text">Fundación Peñascal</p>
    </div>

    <!-- Botón Nueva Evaluación -->
    <div class="action-section">
      <button class="btn-new-evaluation">
        ➕ Nueva Evaluación
      </button>
    </div>

    <!-- Navegación -->
    <nav class="sidebar-nav">
      <router-link to="/" class="nav-link" active-class="active">
        <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="3" width="7" height="7"></rect>
          <rect x="14" y="3" width="7" height="7"></rect>
          <rect x="14" y="14" width="7" height="7"></rect>
          <rect x="3" y="14" width="7" height="7"></rect>
        </svg>
        <span class="nav-text">Dashboard</span>
      </router-link>

      <router-link to="/centers" class="nav-link" active-class="active">
        <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
          <polyline points="9 22 9 12 15 12 15 22"></polyline>
          <line x1="9" y1="5" x2="9" y2="9"></line>
          <line x1="15" y1="5" x2="15" y2="9"></line>
        </svg>
        <span class="nav-text">Centros</span>
      </router-link>

      <router-link to="/tests" class="nav-link" active-class="active">
        <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M6 9l6-6 6 6M3 9v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9"></path>
          <path d="M9 13v4M15 13v4"></path>
        </svg>
        <span class="nav-text">Catálogo de Pruebas</span>
      </router-link>

      <router-link to="/bulk-entry" class="nav-link" active-class="active">
        <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="3" width="18" height="18" rx="2"></rect>
          <path d="M3 9h18M9 9v12M15 9v12"></path>
        </svg>
        <span class="nav-text">Registro en Aula</span>
      </router-link>

      <router-link to="/books" class="nav-link" active-class="active">
        <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
          <line x1="10" y1="5" x2="10" y2="15"></line>
        </svg>
        <span class="nav-text">Biblioteca de Libros</span>
      </router-link>

      <router-link to="/reports" class="nav-link" active-class="active">
        <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="3" width="18" height="18" rx="2"></rect>
          <path d="M7 12h10M7 15h10M7 9h10"></path>
          <rect x="4" y="4" width="3" height="3" fill="currentColor"></rect>
        </svg>
        <span class="nav-text">Informes</span>
      </router-link>

      <router-link v-if="user?.role === 'admin'" to="/users-admin" class="nav-link" active-class="active">
        <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
          <circle cx="9" cy="7" r="4"></circle>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
        </svg>
        <span class="nav-text">Usuarios</span>
      </router-link>
    </nav>

    <!-- Footer -->
    <div class="sidebar-footer">
      <!-- Course Info -->
      <div class="course-info">
        <div class="course-dot"></div>
        <div class="course-text">
          <p class="course-name">Curso 2024-25</p>
          <p class="course-status">Sincronizado</p>
        </div>
      </div>

      <!-- User Avatar -->
      <div v-if="user" class="user-section">
        <button class="user-button" @click="showUserMenu = !showUserMenu">
          <div class="user-avatar">
            {{ userInitials }}
          </div>
          <div class="user-info">
            <p class="user-name-label">{{ user.name }}</p>
            <p class="user-role-label">{{ formattedRole }}</p>
          </div>
        </button>

        <div v-if="showUserMenu" class="user-menu">
          <div class="menu-header">
            <p class="user-name">{{ user.email }}</p>
            <p class="user-role">{{ user.role }}</p>
          </div>

          <div class="menu-divider"></div>

          <div class="menu-actions">
            <button class="menu-action-btn">
              <span class="action-icon">❓</span>
              <span class="action-label">Soporte</span>
            </button>
            <button class="menu-action-btn">
              <span class="action-icon">⚙️</span>
              <span class="action-label">Configuración</span>
            </button>
          </div>

          <div class="menu-divider"></div>

          <button @click="handleLogout" class="logout-btn">
            🚪 Cerrar sesión
          </button>
        </div>
      </div>
    </div>
  </aside>
</template>

<style scoped>
.app-sidebar {
  width: 320px;
  background: linear-gradient(180deg, #1a3a35 0%, #0f2e26 50%, #022c22 100%);
  color: var(--white);
  display: flex;
  flex-direction: column;
  height: 100vh;
  border-right: 1px solid var(--green-900);
  box-shadow: 2px 0 12px rgba(0, 0, 0, 0.3);
}

/* Header */
.sidebar-header {
  padding: 2rem 1.5rem 1.5rem;
  border-bottom: 1px solid var(--green-900);
}

.logo-section {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
}

.logo-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--white);
  border: 1.5px solid var(--green-500);
  border-radius: var(--radius-md);
  overflow: hidden;
  padding: 4px;
}

.logo-icon svg {
  width: 32px;
  height: 32px;
}

.logo-image {
  width: 38px;
  height: 38px;
  object-fit: contain;
}

.logo-text {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.logo-title {
  margin: 0;
  font-size: 1.3rem;
  font-weight: 800;
  color: var(--white);
  letter-spacing: -0.5px;
}

.logo-badge {
  background: linear-gradient(135deg, var(--green-500), var(--green-400));
  color: var(--green-950);
  padding: 0.2rem 0.6rem;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.05em;
}

.foundation-text {
  margin: 0.5rem 0 0;
  font-size: 0.8rem;
  color: var(--green-300);
  font-weight: 500;
}

/* Botón Nueva Evaluación */
.action-section {
  padding: 1rem 1rem;
  border-bottom: 1px solid var(--green-900);
}

.btn-new-evaluation {
  width: 100%;
  padding: 0.85rem 1rem;
  background: linear-gradient(135deg, var(--green-500), var(--green-400));
  color: var(--green-950);
  border: 1px solid var(--green-400);
  border-radius: var(--radius-md);
  font-weight: 700;
  font-size: 0.9rem;
  cursor: pointer;
  transition: var(--transition);
  text-align: center;
}

.btn-new-evaluation:hover {
  background: linear-gradient(135deg, var(--green-400), var(--green-300));
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

/* Navegación */
.sidebar-nav {
  flex: 1;
  overflow-y: auto;
  padding: 1rem 0;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.5rem;
  color: var(--green-200);
  text-decoration: none;
  transition: var(--transition);
  border-left: 3px solid transparent;
  font-size: 0.95rem;
  font-weight: 500;
}

.nav-icon {
  width: 24px;
  height: 24px;
  flex-shrink: 0;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.nav-text {
  flex: 1;
}

.nav-link:hover {
  background-color: rgba(16, 185, 129, 0.1);
  border-left-color: var(--green-400);
  color: var(--green-100);
}

.nav-link.active {
  background-color: rgba(16, 185, 129, 0.15);
  border-left-color: var(--green-400);
  color: var(--green-100);
  font-weight: 700;
}

.nav-link.active::after {
  content: '•';
  position: absolute;
  right: 1.5rem;
  color: var(--green-400);
  font-size: 1.5rem;
}

/* Footer */
.sidebar-footer {
  padding: 1.5rem;
  border-top: 1px solid var(--green-900);
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}


/* Course Info */
.course-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: rgba(16, 185, 129, 0.05);
  border: 1px solid var(--green-900);
  border-radius: var(--radius-md);
}

.course-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #10b981;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.course-text {
  flex: 1;
}

.course-name {
  margin: 0;
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--green-100);
}

.course-status {
  margin: 0;
  font-size: 0.75rem;
  color: var(--green-400);
}

/* User Section */
.user-section {
  position: relative;
}

.user-button {
  display: flex;
  align-items: center;
  gap: 0.875rem;
  padding: 0.5rem 0.75rem;
  width: 100%;
  background: transparent;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: var(--radius-md);
  text-align: left;
}

.user-button:hover {
  background-color: rgba(16, 185, 129, 0.1);
}

.user-avatar {
  width: 52px;
  height: 52px;
  min-width: 52px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--green-500), var(--green-400));
  color: var(--green-950);
  border: 2px solid var(--green-300);
  font-weight: 800;
  font-size: 1.2rem;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.25);
}

.user-avatar::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: radial-gradient(circle at 35% 35%, rgba(255, 255, 255, 0.15), transparent);
  pointer-events: none;
}

.user-button:hover .user-avatar {
  background: linear-gradient(135deg, var(--green-400), var(--green-300));
  transform: scale(1.08);
  box-shadow: 0 6px 16px rgba(16, 185, 129, 0.35);
  border-color: var(--green-200);
}

.user-info {
  display: flex;
  flex-direction: column;
  gap: 0;
  flex: 1;
  text-align: left;
}

.user-name-label {
  margin: 0;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--green-100);
  word-break: break-word;
  line-height: 1.2;
}

.user-role-label {
  margin: 0;
  font-size: 0.75rem;
  color: var(--green-300);
  letter-spacing: 0.02em;
  line-height: 1.2;
}

/* Responsive: ocultar texto en tablet/mobile */
@media (max-width: 1024px) {
  .user-info {
    display: none;
  }

  .user-button {
    padding: 0.5rem;
    justify-content: center;
  }
}

.user-menu {
  position: absolute;
  bottom: calc(100% + 0.75rem);
  left: 0;
  right: 0;
  background-color: var(--green-900);
  border: 1px solid var(--green-800);
  border-radius: var(--radius-md);
  overflow: hidden;
  box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.4);
  z-index: 10;
  min-width: 220px;
}

.menu-header {
  padding: 0.875rem 1rem;
}

.user-name {
  margin: 0 0 0.25rem;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--green-100);
  word-break: break-all;
}

.user-role {
  margin: 0;
  font-size: 0.75rem;
  color: var(--green-300);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.menu-divider {
  height: 1px;
  background: var(--green-800);
  margin: 0.5rem 0;
}

.menu-actions {
  padding: 0.5rem 0;
  display: flex;
  flex-direction: column;
  gap: 0;
}

.menu-action-btn {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  background: transparent;
  border: none;
  color: var(--green-200);
  cursor: pointer;
  transition: var(--transition);
  text-align: left;
  font-size: 0.9rem;
  font-weight: 500;
}

.menu-action-btn:hover {
  background-color: rgba(16, 185, 129, 0.1);
  color: var(--green-100);
}

.action-icon {
  font-size: 1.1rem;
}

.action-label {
  flex: 1;
}

.logout-btn {
  width: 100%;
  padding: 0.75rem 1rem;
  background-color: transparent;
  color: #fca5a5;
  border: none;
  cursor: pointer;
  transition: var(--transition);
  font-size: 0.9rem;
  font-weight: 500;
  text-align: left;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.logout-btn:hover {
  background-color: rgba(220, 38, 38, 0.15);
  color: #fca5a5;
}

/* Scrollbar */
.sidebar-nav::-webkit-scrollbar {
  width: 6px;
}

.sidebar-nav::-webkit-scrollbar-track {
  background: transparent;
}

.sidebar-nav::-webkit-scrollbar-thumb {
  background: var(--green-700);
  border-radius: 3px;
}

.sidebar-nav::-webkit-scrollbar-thumb:hover {
  background: var(--green-600);
}
</style>
