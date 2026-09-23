<script setup>
import { ref, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuth } from '@/composables/useAuth';
import { useCourse } from '@/composables/useCourse';
import {
  LayoutDashboard,
  Users,
  Cloud,
  LogOut,
  Edit3,
  BookOpen,
  FileSpreadsheet,
  PlusCircle,
  CheckCircle2,
  Menu,
  X
} from 'lucide-vue-next';

const props = defineProps({
  currentTab: {
    type: String,
    default: null
  },
  showCta: {
    type: Boolean,
    default: true
  },
  ctaText: {
    type: String,
    default: 'Nueva Prueba'
  }
});

const emit = defineEmits(['update:currentTab', 'openCreate']);

const router = useRouter();
const route = useRoute();
const { user, logout } = useAuth();
const { selectedCourse, courses, getCurrentCourseName } = useCourse();

const isMobileNavOpen = ref(false);
const isDropdownOpen = ref(false);
const showUserMenu = ref(false);

const userInitials = computed(() => {
  if (!user.value) return 'U';
  if (user.value.name) {
    return user.value.name.substring(0, 2).toUpperCase();
  }
  const email = user.value.email || '';
  return email.split('@')[0].substring(0, 2).toUpperCase() || 'U';
});

const roleNames = {
  admin: 'Administrador',
  coordinator: 'Coordinador Pedagógico',
  coordinador: 'Coordinador Pedagógico',
  teacher: 'Profesor',
  tutor: 'Tutor',
  superadmin: 'Administrador'
};

const userRole = computed(() => user.value?.role || 'teacher');

const formattedRole = computed(() => {
  if (!user.value) return '';
  return roleNames[userRole.value] || userRole.value;
});

const isAdmin = computed(() => ['admin', 'superadmin'].includes(userRole.value));

const currentCourseDisplay = computed(() => {
  if (typeof getCurrentCourseName === 'function') {
    return getCurrentCourseName();
  }
  const course = courses.value?.find(c => c.id === selectedCourse.value);
  return course?.name || 'Curso 2024-25';
});

function selectCourse(courseId) {
  selectedCourse.value = courseId;
  isDropdownOpen.value = false;
}

function handleCtaClick() {
  isMobileNavOpen.value = false;
  emit('openCreate');
}

function isTabActive(tabKey) {
  if (props.currentTab !== null && props.currentTab !== undefined) {
    if (tabKey === 'statistics') return props.currentTab === 'statistics';
    if (tabKey === 'bulk-entry') return props.currentTab === 'bulk-entry' || props.currentTab === 'section-detail';
    if (tabKey === 'catalog') return props.currentTab === 'catalog' || props.currentTab === 'books';
    if (tabKey === 'import') return props.currentTab === 'import';
    if (tabKey === 'users') return props.currentTab === 'users';
    if (tabKey === 'students') return props.currentTab === 'students';
  }
  // Detección por ruta canónica o parámetro query legado
  const path = route?.path || '';
  const tab = route?.query?.tab;

  if (tabKey === 'statistics') {
    return path === '/dashboard' && (!tab || tab === 'statistics');
  }
  if (tabKey === 'bulk-entry') {
    return path.startsWith('/classroom') || path.startsWith('/sections') || (path === '/dashboard' && (tab === 'bulk-entry' || tab === 'section-detail'));
  }
  if (tabKey === 'catalog') {
    return path.startsWith('/resources') || (path === '/dashboard' && (tab === 'catalog' || tab === 'books'));
  }
  if (tabKey === 'students') {
    return path.startsWith('/students') || path.startsWith('/centers');
  }
  if (tabKey === 'users') {
    return path === '/admin/users' || path === '/admin/approval';
  }
  if (tabKey === 'import') {
    return path.startsWith('/import') || path.startsWith('/admin/import') || (path === '/dashboard' && tab === 'import');
  }
  return false;
}

function handleNav(tab) {
  isMobileNavOpen.value = false;
  if (props.currentTab !== null && props.currentTab !== undefined) {
    emit('update:currentTab', tab);
  }
}

async function handleLogout() {
  showUserMenu.value = false;
  isMobileNavOpen.value = false;
  await logout();
  router.push({ name: 'login' });
}
</script>

<template>
  <aside class="stitch-sidebar" :class="{ 'mobile-nav-open': isMobileNavOpen }">
    <div class="sidebar-top">
      <!-- Logo & Branding + Botón Toggle Móvil -->
      <div class="brand-header">
        <router-link
          to="/dashboard"
          class="brand-left flex items-center gap-3"
          @click="handleNav('statistics')"
        >
          <div class="brand-icon-box">
            <img src="/logo-hare.png" alt="HARE-S" class="brand-logo" />
          </div>
          <div class="brand-text">
            <div class="brand-title-row">
              <span class="brand-name">HARE-S</span>
              <span class="brand-edu-chip hidden sm:inline-block">Edu</span>
            </div>
            <span class="brand-org hidden xl:block">Fundación Peñascal</span>
          </div>
        </router-link>

        <!-- Botón Toggle Menú Móvil (< 1280px) -->
        <button
          type="button"
          class="mobile-menu-toggle"
          :aria-expanded="isMobileNavOpen"
          aria-label="Abrir menú de navegación"
          @click="isMobileNavOpen = !isMobileNavOpen"
        >
          <X v-if="isMobileNavOpen" :size="20" />
          <Menu v-else :size="20" />
        </button>
      </div>

      <!-- Quick Action CTA (Solo escritorio >= 1280px) -->
      <div v-if="showCta && userRole !== 'tutor'" class="sidebar-cta-wrap hidden xl:block">
        <button
          type="button"
          class="sidebar-cta-btn"
          @click="handleCtaClick"
        >
          <PlusCircle :size="16" />
          <span>{{ ctaText }}</span>
        </button>
      </div>

      <!-- Navegación Principal (Rediseñada: 4 accesos docentes limpios) -->
      <nav class="sidebar-nav" :class="{ 'is-collapsed-mobile': !isMobileNavOpen }">
        <router-link
          to="/dashboard"
          class="nav-item"
          :class="{ active: isTabActive('statistics') }"
          title="Dashboard"
          @click="handleNav('statistics')"
        >
          <div class="nav-item-left">
            <div class="nav-item-icon">
              <LayoutDashboard :size="18" />
            </div>
            <span class="nav-label">Dashboard</span>
          </div>
          <span v-if="isTabActive('statistics')" class="nav-active-pill">Activo</span>
        </router-link>

        <router-link
          to="/students"
          class="nav-item"
          :class="{ active: route?.path?.startsWith('/students') || route?.path?.startsWith('/centers') }"
          title="Centros"
          @click="handleNav('students')"
        >
          <div class="nav-item-left">
            <div class="nav-item-icon">
              <Users :size="18" />
            </div>
            <span class="nav-label">Alumnado</span>
          </div>
          <span v-if="route?.path?.startsWith('/students') || route?.path?.startsWith('/centers')" class="nav-active-pill">Activo</span>
        </router-link>

        <router-link
          to="/classroom"
          class="nav-item"
          :class="{ active: isTabActive('bulk-entry') }"
          title="Registro en Aula"
          @click="handleNav('bulk-entry')"
        >
          <div class="nav-item-left">
            <div class="nav-item-icon">
              <Edit3 :size="18" />
            </div>
            <span class="nav-label">Registro en Aula</span>
          </div>
          <span v-if="isTabActive('bulk-entry')" class="nav-active-pill">Activo</span>
        </router-link>

        <router-link
          to="/resources"
          class="nav-item"
          :class="{ active: isTabActive('catalog') }"
          title="Recursos"
          @click="handleNav('catalog')"
        >
          <div class="nav-item-left">
            <div class="nav-item-icon">
              <BookOpen :size="18" />
            </div>
            <span class="nav-label">Recursos</span>
          </div>
          <span v-if="isTabActive('catalog')" class="nav-active-pill">Activo</span>
        </router-link>

        <router-link
          to="/import"
          class="nav-item"
          :class="{ active: isTabActive('import') }"
          title="Importar Excel / Alexia"
          @click="handleNav('import')"
        >
          <div class="nav-item-left">
            <div class="nav-item-icon">
              <FileSpreadsheet :size="18" />
            </div>
            <span class="nav-label">Importar Excel</span>
          </div>
          <span v-if="isTabActive('import')" class="nav-active-pill">Activo</span>
        </router-link>

        <!-- Bloque Administración (Solo Admin / Superadmin) -->
        <template v-if="isAdmin">
          <div class="sidebar-section-divider"></div>
          <div class="sidebar-section-title">
            <span>Administración</span>
          </div>

          <router-link
            to="/admin/users"
            class="nav-item"
            :class="{ active: route?.path === '/admin/users' }"
            title="Gestión de Usuarios"
            @click="handleNav('users')"
          >
            <div class="nav-item-left">
              <div class="nav-item-icon">
                <Users :size="18" />
              </div>
              <span class="nav-label">Usuarios</span>
            </div>
            <span v-if="route?.path === '/admin/users'" class="nav-active-pill">Activo</span>
          </router-link>
        </template>
      </nav>
    </div>

    <!-- Pie de la barra lateral -->
    <div class="sidebar-bottom" :class="{ 'is-collapsed-mobile': !isMobileNavOpen }">
      <!-- Selector de cursos trasladado al TopBar global de AppShell.vue (oculto en sidebar) -->
      <div class="academic-session-card hidden xl:flex" style="display: none !important;" aria-hidden="true"></div>

      <!-- User Section -->
      <div class="user-section">
        <!-- Mobile user profile card (visible when mobile nav is open) -->
        <div class="user-profile-card xl:hidden">
          <div class="flex items-center gap-3 min-w-0">
            <div class="user-avatar">{{ userInitials }}</div>
            <div class="user-info min-w-0">
              <p class="user-name truncate">{{ user?.name || 'Usuario' }}</p>
              <p class="user-role truncate">{{ formattedRole }}</p>
            </div>
          </div>
          <button type="button" class="mobile-logout-btn" @click="handleLogout" title="Cerrar sesión">
            <span>Cerrar sesión</span>
            <LogOut :size="14" />
          </button>
        </div>

        <!-- Desktop user avatar button & dropdown (>= 1280px) -->
        <div class="desktop-user-menu-wrap hidden xl:block">
          <button type="button" class="user-avatar-wrapper" @click="showUserMenu = !showUserMenu">
            <div class="user-avatar">{{ userInitials }}</div>
            <div class="user-info">
              <p class="user-name">{{ user?.name || 'Usuario' }}</p>
              <p class="user-role">{{ formattedRole }}</p>
            </div>
          </button>

          <!-- Menú desplegable flotante de usuario -->
          <div v-if="showUserMenu" class="user-menu">
            <div class="menu-header">
              <p class="user-name">{{ user?.name || 'Usuario' }}</p>
              <p class="user-role">{{ user?.email || formattedRole }}</p>
            </div>

            <div class="menu-divider"></div>

            <button type="button" class="logout-btn" @click="handleLogout">
              <LogOut :size="16" />
              <span>Cerrar sesión</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </aside>
</template>

<style scoped>
/* --- BARRA LATERAL STITCH (#192134) --- */
.stitch-sidebar {
  width: 260px;
  background-color: var(--tertiary, #192134);
  color: var(--on-tertiary-container, #bdc9c0);
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
  justify-content: space-between;
  padding: 0 0.5rem 1.25rem 0.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.brand-left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  text-decoration: none;
}

.brand-left:hover .brand-name {
  color: var(--secondary-fixed, #6ffbbe);
}

.brand-icon-box {
  width: 44px;
  height: 44px;
  border-radius: var(--radius-lg, 12px);
  background-color: white;
  border: 1px solid rgba(111, 251, 190, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--secondary-fixed, #6ffbbe);
  padding: 4px;
  flex-shrink: 0;
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
  font-family: var(--font-headline, inherit);
  font-size: 1.2rem;
  font-weight: 800;
  color: var(--surface-container-lowest, #ffffff);
  letter-spacing: -0.02em;
}

.brand-edu-chip {
  background-color: rgba(0, 108, 73, 0.4);
  color: var(--secondary-fixed, #6ffbbe);
  font-size: 0.65rem;
  font-weight: 700;
  padding: 0.1rem 0.35rem;
  border-radius: var(--radius-xs, 4px);
  border: 1px solid rgba(111, 251, 190, 0.3);
  text-transform: uppercase;
}

.brand-org {
  font-size: 0.75rem;
  color: var(--on-tertiary-container, #bdc9c0);
}

.mobile-menu-toggle {
  display: none;
}

/* Quick Action CTA */
.sidebar-cta-wrap {
  margin: 1rem 0;
}

.sidebar-cta-btn {
  width: 100%;
  background-color: var(--primary-container, #0f3e2e);
  color: var(--secondary-fixed, #6ffbbe);
  border: 1px solid rgba(111, 251, 190, 0.35);
  font-family: var(--font-headline, inherit);
  font-size: 0.85rem;
  font-weight: 600;
  padding: 0.65rem 0.85rem;
  min-height: var(--touch-target-min, 44px);
  border-radius: var(--radius-md, 8px);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: var(--transition-fast, 0.15s ease);
}

.sidebar-cta-btn:hover {
  background-color: var(--tertiary-container, #283149);
  border-color: var(--secondary-fixed, #6ffbbe);
}

/* Navegación */
.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  padding-top: 0.5rem;
  transition: all 0.3s ease-in-out;
}

.nav-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.65rem 0.85rem;
  min-height: var(--touch-target-min, 44px);
  border-radius: var(--radius-md, 8px);
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--on-tertiary-container, #bdc9c0);
  background: transparent;
  border: 1px solid transparent;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  text-align: left;
  width: 100%;
  text-decoration: none;
  box-sizing: border-box;
}

.nav-item-left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  min-width: 0;
}

.nav-item-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: var(--radius-sm, 6px);
  background-color: rgba(255, 255, 255, 0.05);
  flex-shrink: 0;
  transition: background-color 0.2s ease;
}

.nav-item:hover:not(.disabled) .nav-item-icon {
  background-color: rgba(255, 255, 255, 0.1);
}

.nav-item.active .nav-item-icon {
  background-color: rgba(111, 251, 190, 0.2);
  color: var(--secondary-fixed, #6ffbbe);
}

.nav-item:hover:not(.disabled) {
  background-color: var(--tertiary-container, #283149);
  color: var(--surface-container-lowest, #ffffff);
}

.nav-item.active {
  background-color: var(--primary-container, #0f3e2e);
  color: var(--secondary-fixed, #6ffbbe);
  border-color: rgba(111, 251, 190, 0.25);
  font-weight: 600;
}

.nav-active-pill {
  font-size: 0.68rem;
  font-weight: 700;
  padding: 0.15rem 0.5rem;
  border-radius: 9999px;
  background-color: rgba(111, 251, 190, 0.2);
  color: var(--secondary-fixed, #6ffbbe);
  border: 1px solid rgba(111, 251, 190, 0.35);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  flex-shrink: 0;
}

.sidebar-section-divider {
  height: 1px;
  background-color: rgba(255, 255, 255, 0.1);
  margin: 0.75rem 0.5rem 0.25rem 0.5rem;
}

.sidebar-section-title {
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: var(--on-tertiary-container, #bdc9c0);
  opacity: 0.65;
  padding: 0.25rem 0.85rem;
  text-transform: uppercase;
}

/* Pie de la barra lateral */
.sidebar-bottom {
  display: flex;
  flex-direction: column;
}

.academic-session-card {
  background-color: rgba(46, 54, 75, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: var(--radius-md, 8px);
  padding: 0.65rem 0.85rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.85rem;
  width: 100%;
  cursor: pointer;
  transition: all 0.2s ease;
}

.academic-session-card:hover {
  border-color: rgba(111, 251, 190, 0.3);
  background-color: rgba(46, 54, 75, 0.9);
}

.session-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
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
  background-color: var(--secondary-fixed, #6ffbbe);
}

.session-labels {
  display: flex;
  flex-direction: column;
}

.session-year {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--surface-container-lowest, #ffffff);
}

.session-status {
  font-size: 0.7rem;
  color: var(--on-tertiary-container, #bdc9c0);
}

.session-icon {
  color: var(--on-tertiary-container, #bdc9c0);
}

/* Dropdown de cursos */
.courses-dropdown {
  position: fixed;
  background: white;
  border: 1px solid rgba(200, 200, 200, 0.3);
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  z-index: 1001;
  min-width: 200px;
  max-width: 280px;
  bottom: 130px;
  left: 20px;
  overflow: hidden;
  animation: slideUp 0.2s ease-out;
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
  font-weight: 500;
  transition: background-color 0.15s ease;
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

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* User Section */
.user-section {
  position: relative;
  padding: 0 0.25rem;
}

.user-avatar-wrapper {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-height: var(--touch-target-min, 44px);
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: var(--radius-md, 8px);
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
  background-color: #10b981;
  color: white;
  border: 2px solid rgba(111, 251, 190, 0.3);
  font-weight: 800;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
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
  color: var(--surface-container-lowest, #ffffff);
  line-height: 1.1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-info .user-role {
  margin: 0;
  font-size: 0.65rem;
  color: var(--on-tertiary-container, #bdc9c0);
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
  background: linear-gradient(180deg, #1f2937 0%, #111827 100%);
  border: 1px solid rgba(75, 85, 99, 0.3);
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 -8px 24px rgba(0, 0, 0, 0.5);
  z-index: 1000;
  animation: slideRight 0.3s ease-out;
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
  color: var(--surface-container-lowest, #ffffff);
  word-break: break-all;
}

.user-menu .user-role {
  margin: 0;
  font-size: 0.75rem;
  color: var(--on-tertiary-container, #bdc9c0);
}

.menu-divider {
  height: 1px;
  background: rgba(255, 255, 255, 0.12);
  margin: 0.5rem 0;
}

.logout-btn {
  width: 100%;
  padding: 0.75rem 1rem;
  min-height: var(--touch-target-min, 44px);
  background-color: transparent;
  color: var(--surface-container-lowest, #ffffff);
  border: none;
  cursor: pointer;
  transition: var(--transition-fast, 0.15s ease);
  font-size: 0.9rem;
  font-weight: 500;
  text-align: left;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.logout-btn:hover {
  background-color: rgba(220, 38, 38, 0.2);
}

/* =========================================================================
   RESPONSIVE (< 1280px): Header sticky y Drawer desplegable a pantalla completa
   ========================================================================= */
@media (max-width: 1279px) {
  .stitch-sidebar {
    width: 100% !important;
    position: sticky !important;
    top: 0 !important;
    left: 0 !important;
    right: 0 !important;
    bottom: auto !important;
    height: 60px !important;
    min-height: 60px !important;
    max-height: 60px !important;
    padding: 0 1rem !important;
    border-right: none !important;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
    background-color: var(--tertiary, #192134) !important;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.25) !important;
    z-index: 50 !important;
    display: flex !important;
    flex-direction: column !important;
    justify-content: center !important;
  }

  .brand-header {
    display: flex !important;
    align-items: center !important;
    justify-content: space-between !important;
    width: 100% !important;
    height: 100% !important;
    padding: 0 !important;
    border-bottom: none !important;
  }

  .brand-icon-box {
    width: 36px !important;
    height: 36px !important;
    padding: 3px !important;
    border-radius: var(--radius-md, 8px) !important;
  }

  .brand-name {
    font-size: 1.15rem !important;
    white-space: nowrap !important;
  }

  .brand-edu-chip {
    font-size: 0.6rem !important;
    padding: 0.05rem 0.35rem !important;
  }

  .brand-org {
    display: none !important;
  }

  .mobile-menu-toggle {
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    width: 40px !important;
    height: 40px !important;
    min-width: 40px !important;
    min-height: 40px !important;
    background: rgba(255, 255, 255, 0.08) !important;
    border: 1px solid rgba(255, 255, 255, 0.18) !important;
    border-radius: var(--radius-md, 8px) !important;
    color: var(--surface-container-lowest, #ffffff) !important;
    cursor: pointer !important;
    transition: all 0.2s ease !important;
  }

  .mobile-menu-toggle:hover {
    background-color: var(--tertiary-container, #283149) !important;
    border-color: var(--secondary-fixed, #6ffbbe) !important;
  }

  /* Elementos ocultos bajo 1280px cuando está colapsado */
  .academic-session-card,
  .desktop-user-menu-wrap,
  .sidebar-cta-wrap {
    display: none !important;
  }

  /* Estado colapsado: menú oculto */
  .sidebar-nav.is-collapsed-mobile,
  .sidebar-bottom.is-collapsed-mobile {
    display: none !important;
  }

  /* Estado desplegado: Drawer móvil a pantalla completa */
  .stitch-sidebar.mobile-nav-open {
    position: fixed !important;
    top: 0 !important;
    left: 0 !important;
    right: 0 !important;
    bottom: 0 !important;
    width: 100% !important;
    height: 100vh !important;
    max-height: 100vh !important;
    min-height: 100vh !important;
    z-index: 100 !important;
    padding: 0 1.25rem 1.75rem 1.25rem !important;
    display: flex !important;
    flex-direction: column !important;
    justify-content: flex-start !important;
    overflow-y: auto !important;
    overflow-x: hidden !important;
    background-color: var(--tertiary, #192134) !important;
    box-shadow: 0 20px 48px rgba(0, 0, 0, 0.65) !important;
    animation: slideDownScreen 0.28s cubic-bezier(0.16, 1, 0.3, 1) forwards !important;
  }

  .stitch-sidebar.mobile-nav-open .brand-header {
    height: 60px !important;
    min-height: 60px !important;
    border-bottom: 1px solid rgba(255, 255, 255, 0.12) !important;
    flex-shrink: 0 !important;
  }

  .stitch-sidebar.mobile-nav-open .sidebar-top {
    display: flex !important;
    flex-direction: column !important;
    width: 100% !important;
  }

  .stitch-sidebar.mobile-nav-open .sidebar-nav {
    display: flex !important;
    flex-direction: column !important;
    gap: 0.6rem !important;
    padding: 1.25rem 0 !important;
    width: 100% !important;
    animation: slideDownContent 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards !important;
  }

  .stitch-sidebar.mobile-nav-open .nav-item {
    display: flex !important;
    align-items: center !important;
    justify-content: space-between !important;
    padding: 0.85rem 1.15rem !important;
    border-radius: var(--radius-lg, 12px) !important;
    background-color: rgba(255, 255, 255, 0.05) !important;
    border: 1px solid rgba(255, 255, 255, 0.08) !important;
    min-height: 52px !important;
    font-size: 0.95rem !important;
    font-weight: 600 !important;
    color: #ffffff !important;
    transition: all 0.18s ease !important;
    cursor: pointer !important;
  }

  .stitch-sidebar.mobile-nav-open .nav-item:hover {
    background-color: var(--tertiary-container, #283149) !important;
    border-color: rgba(111, 251, 190, 0.35) !important;
    transform: translateY(-1px) !important;
  }

  .stitch-sidebar.mobile-nav-open .nav-item.active {
    background-color: var(--primary-container, #0f3e2e) !important;
    color: var(--secondary-fixed, #6ffbbe) !important;
    border-color: rgba(111, 251, 190, 0.5) !important;
    box-shadow: 0 4px 14px rgba(15, 62, 46, 0.4) !important;
  }

  .stitch-sidebar.mobile-nav-open .sidebar-bottom {
    display: flex !important;
    flex-direction: column !important;
    gap: 0.75rem !important;
    margin-top: auto !important;
    padding-top: 1.25rem !important;
    border-top: 1px solid rgba(255, 255, 255, 0.12) !important;
    width: 100% !important;
    flex-shrink: 0 !important;
    animation: slideDownContent 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards !important;
  }

  .stitch-sidebar.mobile-nav-open .user-section {
    padding: 0 !important;
    width: 100% !important;
  }

  .stitch-sidebar.mobile-nav-open .user-profile-card {
    display: flex !important;
    align-items: center !important;
    justify-content: space-between !important;
    padding: 0.75rem 1rem !important;
    background-color: rgba(255, 255, 255, 0.04) !important;
    border-radius: var(--radius-lg, 12px) !important;
    border: 1px solid rgba(255, 255, 255, 0.08) !important;
    gap: 0.75rem !important;
  }

  .stitch-sidebar.mobile-nav-open .user-avatar {
    width: 38px !important;
    height: 38px !important;
    font-size: 0.9rem !important;
    border-radius: 50% !important;
    background-color: #10b981 !important;
    color: white !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    font-weight: 700 !important;
    flex-shrink: 0 !important;
  }

  .stitch-sidebar.mobile-nav-open .user-name {
    margin: 0 !important;
    font-size: 0.85rem !important;
    font-weight: 600 !important;
    color: #ffffff !important;
    line-height: 1.2 !important;
  }

  .stitch-sidebar.mobile-nav-open .user-role {
    margin: 0 !important;
    font-size: 0.7rem !important;
    color: var(--on-tertiary-container, #bdc9c0) !important;
    text-transform: capitalize !important;
  }

  .stitch-sidebar.mobile-nav-open .mobile-logout-btn {
    display: inline-flex !important;
    align-items: center !important;
    gap: 0.45rem !important;
    padding: 0.5rem 0.85rem !important;
    border-radius: var(--radius-md, 8px) !important;
    background-color: rgba(239, 68, 68, 0.15) !important;
    border: 1px solid rgba(239, 68, 68, 0.35) !important;
    color: #fca5a5 !important;
    font-size: 0.8rem !important;
    font-weight: 600 !important;
    cursor: pointer !important;
    transition: all 0.15s ease !important;
    white-space: nowrap !important;
  }

  .stitch-sidebar.mobile-nav-open .mobile-logout-btn:hover {
    background-color: rgba(239, 68, 68, 0.25) !important;
    border-color: rgba(239, 68, 68, 0.6) !important;
  }
}

@keyframes slideDownScreen {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideDownContent {
  from {
    opacity: 0;
    transform: translateY(-6px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>