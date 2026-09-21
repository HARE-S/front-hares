<script setup>
import { ref, computed } from 'vue';
import { useAuth } from '@/composables/useAuth';
import { useRouter, useRoute } from 'vue-router';
import { LayoutDashboard, School, Users, Cloud, LogOut } from 'lucide-vue-next';

const { user, logout } = useAuth();
const router = useRouter();
const route = useRoute();
const showUserMenu = ref(false);
const isOpen = ref(false);
const courses = ref([
  { id: '2024-25', name: 'Curso 2024-25' },
  { id: '2023-24', name: 'Curso 2023-24' },
  { id: '2022-23', name: 'Curso 2022-23' },
  { id: '2021-22', name: 'Curso 2021-22' }
]);

function selectCourse(courseId) {
  isOpen.value = false;
}

const userInitials = computed(() => {
  if (!user.value) return '';
  if (user.value.name) {
    return user.value.name.substring(0, 2).toUpperCase();
  }
  const email = user.value.email || '';
  return email.split('@')[0].substring(0, 2).toUpperCase();
});

const roleNames = {
  admin: 'Administrador',
  coordinator: 'Coordinador Pedagógico',
  coordinador: 'Coordinador Pedagógico',
  teacher: 'Profesor',
  tutor: 'Tutor',
  superadmin: 'Administrador'
};

const formattedRole = computed(() => {
  if (!user.value) return '';
  return roleNames[user.value.role] || user.value.role;
});

const isAdmin = computed(() => ['admin', 'superadmin'].includes(user.value?.role));
const isCentersActive = computed(() => route.path.startsWith('/centers'));

async function handleLogout() {
  showUserMenu.value = false;
  await logout();
  router.push({ name: 'login' });
}
</script>

<template>
  <aside class="stitch-sidebar">
    <div class="sidebar-top">
      <!-- Branding -->
      <router-link to="/dashboard" class="brand-header">
        <div class="brand-icon-box">
          <img src="/logo-hare.png" alt="HARE-S" class="brand-logo" />
        </div>
        <div class="brand-text">
          <div class="brand-title-row">
            <span class="brand-name">HARE-S</span>
            <span class="brand-edu-chip">Edu</span>
          </div>
          <span class="brand-org">Fundación Peñascal</span>
        </div>
      </router-link>

      <!-- Navegación principal -->
      <nav class="sidebar-nav">
        <router-link to="/dashboard" class="nav-item" active-class="active">
          <LayoutDashboard :size="18" />
          <span class="flex-1">Dashboard</span>
        </router-link>

        <router-link to="/centers" class="nav-item" active-class="active">
          <School :size="18" />
          <span class="flex-1">Centros</span>
          <span v-if="isCentersActive" class="nav-active-dot"></span>
        </router-link>

        <router-link
          v-if="isAdmin"
          to="/admin/approval"
          class="nav-item"
          active-class="active"
        >
          <Users :size="18" />
          <span class="flex-1">Usuarios</span>
        </router-link>
      </nav>
    </div>

    <!-- Pie de la barra lateral -->
    <div class="sidebar-bottom">
      <button @click="isOpen = !isOpen" class="academic-session-card" :class="{ 'academic-session-card--open': isOpen }">
        <div class="session-info">
          <div class="pulse-indicator">
            <span class="pulse-dot"></span>
          </div>
          <div class="session-labels">
            <span class="session-year">Curso 2024-25</span>
            <span class="session-status">Sincronizado</span>
          </div>
        </div>
        <Cloud :size="16" class="session-icon" />
      </button>

      <!-- Dropdown -->
      <transition name="dropdown">
        <div v-if="isOpen" class="courses-dropdown">
          <button
            v-for="course in courses"
            :key="course.id"
            @click="selectCourse(course.id)"
            class="course-option"
            :class="{ 'course-option--active': course.id === '2024-25' }"
          >
            {{ course.name }}
            <svg v-if="course.id === '2024-25'" viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
            </svg>
          </button>
        </div>
      </transition>

      <!-- User Section -->
      <div class="user-section">
        <button class="user-avatar-wrapper" @click="showUserMenu = !showUserMenu">
          <div class="user-avatar">{{ userInitials || 'U' }}</div>
          <div class="user-info">
            <p class="user-name">{{ user?.name || userInitials || 'Usuario' }}</p>
            <p class="user-role">{{ formattedRole }}</p>
          </div>
        </button>

        <div v-if="showUserMenu" class="user-menu">
          <div class="menu-header">
            <p class="user-name">{{ user?.name || 'Usuario' }}</p>
            <p class="user-role">{{ user?.email || 'Sin email' }}</p>
          </div>

          <div class="menu-divider"></div>

          <button class="logout-btn" @click="handleLogout">
            <LogOut :size="16" />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </div>
    </div>
  </aside>
</template>

<style scoped>
/* --- BARRA LATERAL STITCH (#192134) --- */
.stitch-sidebar {
  width: 260px;
  background-color: var(--tertiary);
  color: var(--on-tertiary-container);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 1.5rem 1rem;
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  z-index: 40;
  border-right: 1px solid rgba(255, 255, 255, 0.08);
}

.brand-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 0.5rem 1.25rem 0.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  text-decoration: none;
}

.brand-header:hover .brand-name {
  color: var(--secondary-fixed);
}

.brand-icon-box {
  width: 44px;
  height: 44px;
  border-radius: var(--radius-lg);
  background-color: var(--surface-container-lowest);
  border: 1px solid rgba(111, 251, 190, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--secondary-fixed);
  padding: 4px;
}

.brand-logo {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.brand-title-row {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.brand-name {
  font-family: var(--font-headline);
  font-size: 1.2rem;
  font-weight: 800;
  color: var(--surface-container-lowest);
  letter-spacing: -0.02em;
}

.brand-edu-chip {
  background-color: rgba(0, 108, 73, 0.4);
  color: var(--secondary-fixed);
  font-size: 0.65rem;
  font-weight: 700;
  padding: 0.1rem 0.35rem;
  border-radius: var(--radius-xs);
  border: 1px solid rgba(111, 251, 190, 0.3);
  text-transform: uppercase;
}

.brand-org {
  font-size: 0.75rem;
  color: var(--on-tertiary-container);
}

/* Navegación */
.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  padding-top: 1rem;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.65rem 0.85rem;
  border-radius: var(--radius-md);
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--on-tertiary-container);
  background: transparent;
  border: 1px solid transparent;
  cursor: pointer;
  transition: var(--transition-fast);
  text-align: left;
  width: 100%;
  text-decoration: none;
}

.nav-item:hover {
  background-color: var(--tertiary-container);
  color: var(--surface-container-lowest);
}

.nav-item.active {
  background-color: var(--primary-container);
  color: var(--secondary-fixed);
  border-color: rgba(111, 251, 190, 0.25);
  font-weight: 600;
}

.nav-active-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: var(--secondary-fixed);
}

.flex-1 {
  flex: 1;
}

/* Pie de la barra */
.academic-session-card {
  background-color: rgba(46, 54, 75, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: var(--radius-md);
  padding: 0.75rem 0.85rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  margin-bottom: 0.85rem;
  width: 100%;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  z-index: 50;
}

.session-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
}

.pulse-indicator {
  display: flex;
  position: relative;
  width: 8px;
  height: 8px;
  flex-shrink: 0;
}

.pulse-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: var(--secondary-fixed);
}

.session-labels {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
}

.session-year {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--secondary-fixed);
  line-height: 1.2;
}

.session-status {
  font-size: 0.7rem;
  color: var(--on-tertiary-container);
  line-height: 1.2;
}

.session-icon {
  color: var(--on-tertiary-container);
  flex-shrink: 0;
}

/* User Section */
.user-section {
  position: relative;
  padding: 0 0.75rem;
}

.user-avatar-wrapper {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: var(--radius-md);
  transition: background-color 0.3s ease;
  width: 100%;
  overflow: hidden;
}

.user-avatar-wrapper:hover {
  background-color: rgba(75, 85, 99, 0.2);
}

.user-avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background-color: var(--secondary);
  color: var(--surface-container-lowest);
  border: 2px solid rgba(111, 251, 190, 0.3);
  font-weight: 800;
  font-size: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.25);
}

.user-avatar-wrapper:hover .user-avatar {
  border-color: rgba(111, 251, 190, 0.5);
}

.user-info {
  display: flex;
  flex-direction: column;
  gap: 0;
  flex: 1;
  min-width: 0;
  overflow: hidden;
}

.user-info .user-name {
  margin: 0;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--surface-container-lowest);
  line-height: 1.1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-info .user-role {
  margin: 0;
  font-size: 0.65rem;
  color: var(--on-tertiary-container);
  text-transform: capitalize;
  line-height: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-menu {
  position: fixed;
  bottom: 75px;
  left: 75px;
  width: 280px;
  background-color: var(--tertiary-container);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: var(--radius-md);
  overflow: hidden;
  box-shadow: 0 -8px 24px rgba(0, 0, 0, 0.4);
  z-index: 1000;
  animation: slideRight 0.3s ease-out;
}

/* Dropdown de cursos */

.academic-session-card:hover {
  border-color: rgba(111, 251, 190, 0.3);
  background-color: rgba(46, 54, 75, 0.9);
}

.academic-session-card--open {
  border-color: rgba(111, 251, 190, 0.5);
  background-color: rgba(46, 54, 75, 0.95);
}

.courses-dropdown {
  position: fixed;
  background: white;
  border: 1px solid rgba(200, 200, 200, 0.3);
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  z-index: 1001;
  min-width: 220px;
  bottom: auto;
  top: auto;
}

.course-option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 0.75rem 1rem;
  background: transparent;
  border: none;
  border-bottom: 1px solid rgba(200, 200, 200, 0.1);
  cursor: pointer;
  font-size: 0.9rem;
  color: #1a1a1a;
  text-align: left;
  transition: background-color 0.15s ease;
  font-weight: 500;
}

.course-option:last-child {
  border-bottom: none;
}

.course-option:hover {
  background-color: rgba(200, 200, 200, 0.1);
}

.course-option--active {
  background-color: rgba(111, 251, 190, 0.1);
  color: #006c49;
  font-weight: 600;
}

.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s ease;
}

.dropdown-enter-from {
  opacity: 0;
  transform: translateY(8px);
}

.dropdown-leave-to {
  opacity: 0;
  transform: translateY(8px);
}

@keyframes slideRight {
  from {
    opacity: 0;
    transform: translateX(-10px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.menu-header {
  padding: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);
}

.user-menu .user-name {
  margin: 0 0 0.25rem;
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--surface-container-lowest);
  word-break: break-all;
}

.user-menu .user-role {
  margin: 0;
  font-size: 0.75rem;
  color: var(--on-tertiary-container);
}

.menu-divider {
  height: 1px;
  background: rgba(255, 255, 255, 0.12);
  margin: 0.5rem 0;
}

.logout-btn {
  width: 100%;
  padding: 0.75rem 1rem;
  background-color: transparent;
  color: var(--surface-container-lowest);
  border: none;
  cursor: pointer;
  transition: var(--transition-fast);
  font-size: 0.9rem;
  font-weight: 500;
  text-align: left;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.logout-btn svg {
  color: var(--level-low-dot);
}

.logout-btn:hover {
  background-color: rgba(220, 38, 38, 0.2);
}

@media (max-width: 1024px) {
  .stitch-sidebar {
    width: 72px;
    padding: 1rem 0.5rem;
  }

  .brand-text,
  .nav-item span,
  .academic-session-card {
    display: none;
  }

  .brand-header {
    padding: 0.5rem;
    justify-content: center;
  }

  .nav-item {
    justify-content: center;
  }

  .user-info {
    display: none;
  }

  .user-avatar-wrapper {
    justify-content: center;
    padding: 0.35rem;
  }

  .user-avatar {
    width: 48px;
    height: 48px;
    font-size: 1.1rem;
  }

  .user-menu {
    left: 75px;
    width: 280px;
    bottom: 75px;
  }
}
</style>