<script setup>
import { ref, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuth } from '@/composables/useAuth';
import DashboardView from '@/views/dashboard/DashboardView.vue';
import BooksCatalogView from '@/views/books-catalog/BooksCatalogView.vue';
import BulkEntryView from '@/views/bulk-entry/BulkEntryView.vue';
import SectionDetailView from '@/views/section-detail/SectionDetailView.vue';
import ReportsView from '@/views/reports/ReportsView.vue';
import TestForm from '@/components/TestForm.vue';
import TestList from '@/components/TestList.vue';
import TestsCatalogView from '@/views/tests-catalog/TestsCatalogView.vue';
import RegisterResultModal from '@/components/results/RegisterResultModal.vue';

const router = useRouter();
const route = useRoute();
const { logout, user } = useAuth();

import {
  BookOpen,
  Layers,
  Edit3,
  PlusCircle,
  Library,
  BarChart3,
  CheckCircle2,
  Cloud,
  LayoutDashboard,
  School,
  Menu,
  X
} from 'lucide-vue-next';

const currentTab = ref('statistics'); // 'statistics' | 'catalog' | 'books' | 'bulk-entry' | 'section-detail' | 'form'
const isMobileNavOpen = ref(false);

const currentTabName = computed(() => {
  if (route.path.startsWith('/centers')) return 'Alumnado';
  switch (currentTab.value) {
    case 'statistics': return 'Estadísticas';
    case 'catalog': return 'Catálogo de Pruebas';
    case 'bulk-entry': return 'Registro en Aula';
    case 'section-detail': return 'Detalle de Grupo';
    case 'books': return 'Biblioteca de Libros';
    case 'reports': return 'Informes';
    default: return 'Panel Docente';
  }
});
const activeSectionId = ref('sec-1');
const testListRef = ref(null);
const testsCatalogRef = ref(null);
const testToEdit = ref(null);
const userRole = ref('coordinator'); // 'coordinator' | 'tutor'
const toastNotification = ref(null);
const showRegisterResultModal = ref(false);

function handleViewSectionHistory(sectionId) {
  if (sectionId) activeSectionId.value = sectionId;
  currentTab.value = 'section-detail';
}

function showToast(message) {
  toastNotification.value = message;
  setTimeout(() => {
    toastNotification.value = null;
  }, 5000);
}

function handleResultSavedFromDashboard(result) {
  showToast(`Prueba registrada para ${result.studentName || 'alumno'}: ${result.ppm} PPM (${result.band})`);
}

function handleOpenCreate() {
  testToEdit.value = null;
  currentTab.value = 'catalog';
  testsCatalogRef.value?.openCreate?.();
}

function handleEditTest(test) {
  testToEdit.value = test;
  currentTab.value = 'form';
}

function handleTestCreated(newTest) {
  showToast(`Prueba "${newTest.name}" (${newTest.code}) registrada correctamente.`);
  testToEdit.value = null;
  currentTab.value = 'catalog';
  if (testListRef.value) {
    testListRef.value.refresh();
  }
}

function handleTestUpdated(updatedTest) {
  showToast(`Prueba "${updatedTest.name}" (${updatedTest.code}) actualizada correctamente.`);
  testToEdit.value = null;
  currentTab.value = 'catalog';
  if (testListRef.value) {
    testListRef.value.refresh();
  }
}

function handleCancelEdit() {
  testToEdit.value = null;
  currentTab.value = 'catalog';
}

const showUserMenu = ref(false);

async function handleLogout() {
  showUserMenu.value = false;
  await logout();
  router.push({ name: 'login' });
}
</script>

<template>
  <div class="stitch-app">
    <!-- BARRA LATERAL PERSISTENTE (Stitch Dark Slate Theme: #192134) -->
    <aside class="stitch-sidebar" :class="{ 'mobile-nav-open': isMobileNavOpen }">
      <div class="sidebar-top">
        <!-- Logo & Branding + Botón Toggle Móvil -->
        <div class="brand-header">
          <div class="brand-left flex items-center gap-3">
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
          </div>

          <!-- Indicador de sección activa (oculto para limpieza visual) -->
          <div class="active-tab-chip hidden">
            <span>{{ currentTabName }}</span>
          </div>

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

        <!-- Quick Action CTA (Solo escritorio >= 1280px, innecesario en tableta y móvil) -->
        <div v-if="userRole !== 'tutor'" class="sidebar-cta-wrap hidden xl:block">
          <button
            class="sidebar-cta-btn"
            @click="handleOpenCreate"
          >
            <PlusCircle :size="16" />
            <span>{{ testToEdit ? 'Editar Prueba' : 'Nueva Prueba' }}</span>
          </button>
        </div>

        <!-- Navegación Principal (Colapsable en móvil y tablet, desliza hacia abajo) -->
        <nav class="sidebar-nav" :class="{ 'is-collapsed-mobile': !isMobileNavOpen }">
          <button
            class="nav-item"
            :class="{ active: currentTab === 'statistics' }"
            title="Estadísticas"
            @click="currentTab = 'statistics'; isMobileNavOpen = false;"
          >
            <div class="nav-item-left">
              <div class="nav-item-icon">
                <LayoutDashboard :size="18" />
              </div>
              <span class="nav-label">Estadísticas</span>
            </div>
            <span v-if="currentTab === 'statistics'" class="nav-active-pill">Activo</span>
          </button>

          <button
            class="nav-item"
            :class="{ active: route.path.startsWith('/centers') }"
            title="Alumnado"
            @click="router.push('/centers'); isMobileNavOpen = false;"
          >
            <div class="nav-item-left">
              <div class="nav-item-icon">
                <School :size="18" />
              </div>
              <span class="nav-label">Alumnado</span>
            </div>
            <span v-if="route.path.startsWith('/centers')" class="nav-active-pill">Activo</span>
          </button>

          <button
            class="nav-item"
            :class="{ active: currentTab === 'catalog' && !testToEdit }"
            title="Catálogo de Pruebas"
            @click="currentTab = 'catalog'; testToEdit = null; isMobileNavOpen = false;"
          >
            <div class="nav-item-left">
              <div class="nav-item-icon">
                <Layers :size="18" />
              </div>
              <span class="nav-label">Catálogo de Pruebas</span>
            </div>
            <span v-if="currentTab === 'catalog'" class="nav-active-pill">Activo</span>
          </button>

          <button
            class="nav-item"
            :class="{ active: currentTab === 'bulk-entry' || currentTab === 'section-detail' }"
            title="Registro en Aula"
            @click="currentTab = 'bulk-entry'; testToEdit = null; isMobileNavOpen = false;"
          >
            <div class="nav-item-left">
              <div class="nav-item-icon">
                <Edit3 :size="18" />
              </div>
              <span class="nav-label">Registro en Aula</span>
            </div>
            <span v-if="currentTab === 'bulk-entry' || currentTab === 'section-detail'" class="nav-active-pill">Activo</span>
          </button>

          <button
            class="nav-item"
            :class="{ active: currentTab === 'books' }"
            title="Biblioteca de Libros"
            @click="currentTab = 'books'; testToEdit = null; isMobileNavOpen = false;"
          >
            <div class="nav-item-left">
              <div class="nav-item-icon">
                <Library :size="18" />
              </div>
              <span class="nav-label">Biblioteca de Libros</span>
            </div>
            <span v-if="currentTab === 'books'" class="nav-active-pill">Activo</span>
          </button>

          <button
            class="nav-item"
            :class="{ active: currentTab === 'reports' }"
            title="Informes y Exportación"
            @click="currentTab = 'reports'; testToEdit = null; isMobileNavOpen = false;"
          >
            <div class="nav-item-left">
              <div class="nav-item-icon">
                <BarChart3 :size="18" />
              </div>
              <span class="nav-label">Informes y Exportación</span>
            </div>
            <span v-if="currentTab === 'reports'" class="nav-active-pill">Activo</span>
          </button>
        </nav>
      </div>

      <!-- Pie de la barra lateral -->
      <div class="sidebar-bottom" :class="{ 'is-collapsed-mobile': !isMobileNavOpen }">
        <!-- Eliminado en responsive: sesión académica oculta bajo 1280px -->
        <div class="academic-session-card hidden xl:flex">
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
        </div>

        <!-- User Section -->
        <div class="user-section">
          <!-- Mobile user profile card (visible when mobile nav is open) -->
          <div class="user-profile-card xl:hidden">
            <div class="flex items-center gap-3 min-w-0">
              <div class="user-avatar">{{ user?.name?.substring(0, 2).toUpperCase() || 'U' }}</div>
              <div class="user-info min-w-0">
                <p class="user-name truncate">{{ user?.name || 'Usuario' }}</p>
                <p class="user-role truncate">{{ userRole === 'coordinator' ? 'Coordinador' : 'Tutor' }}</p>
              </div>
            </div>
            <button class="mobile-logout-btn" @click="handleLogout" title="Cerrar sesión">
              <span>Cerrar sesión</span>
              <span>🚪</span>
            </button>
          </div>

          <!-- Desktop user avatar button & dropdown (>= 1280px) -->
          <div class="desktop-user-menu-wrap hidden xl:block">
            <button class="user-avatar-wrapper" @click="showUserMenu = !showUserMenu">
              <div class="user-avatar">{{ user?.name?.substring(0, 2).toUpperCase() || 'U' }}</div>
              <div class="user-info">
                <p class="user-name">{{ user?.name || 'Usuario' }}</p>
                <p class="user-role">{{ userRole === 'coordinator' ? 'Coordinador' : 'Tutor' }}</p>
              </div>
            </button>

            <div v-if="showUserMenu" class="user-menu">
              <div class="menu-header">
                <p class="user-name">{{ user?.name || 'Usuario' }}</p>
                <p class="user-role">{{ user?.email || 'Sin email' }}</p>
              </div>

              <div class="menu-divider"></div>

              <button class="logout-btn" @click="handleLogout">
                <span>🚪</span>
                <span>Cerrar sesión</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </aside>

    <!-- ÁREA PRINCIPAL: CONTENIDO -->
    <div class="stitch-main-layout">
      <!-- LIENZO DE CONTENIDO -->
      <main class="stitch-content-canvas">
        <div class="content-container">
          <!-- Toast Notification -->
          <div v-if="toastNotification && currentTab === 'catalog'" class="alert alert-success toast-banner" role="alert">
            <CheckCircle2 :size="18" />
            <span>{{ toastNotification }}</span>
          </div>

          <!-- Vistas Activas -->
          <transition name="fade" mode="out-in">
            <DashboardView
              v-if="currentTab === 'statistics'"
              key="statistics"
              @new-assessment="showRegisterResultModal = true"
              @assign-book="showToast('Abriendo asignador de libros...')"
            />
            <TestsCatalogView
              v-else-if="currentTab === 'catalog'"
              ref="testsCatalogRef"
              key="catalog"
              :user-role="userRole"
            />
            <BooksCatalogView
              v-else-if="currentTab === 'books'"
              key="books"
              :user-role="userRole"
            />
            <BulkEntryView
              v-else-if="currentTab === 'bulk-entry'"
              key="bulk-entry"
              :user-role="userRole"
              @view-history="handleViewSectionHistory"
            />
            <SectionDetailView
              v-else-if="currentTab === 'section-detail'"
              key="section-detail"
              :section-id="activeSectionId"
              :user-role="userRole"
            />
            <ReportsView
              v-else-if="currentTab === 'reports'"
              key="reports"
              :user-role="userRole"
            />
            <TestForm
              v-else-if="currentTab === 'form'"
              key="form"
              :test-to-edit="testToEdit"
              :user-role="userRole"
              @test-created="handleTestCreated"
              @test-updated="handleTestUpdated"
              @cancel-edit="handleCancelEdit"
            />
          </transition>

          <!-- Modal para registrar resultado individual (FE-18) -->
          <RegisterResultModal
            :is-open="showRegisterResultModal"
            @close="showRegisterResultModal = false"
            @saved="handleResultSavedFromDashboard"
          />
        </div>
      </main>

      <!-- Pie de página -->
      <footer class="stitch-footer">
        <p>HARE-S · Sistema de Evaluación de Fluidez y Comprensión Lectora · Fundación Peñascal</p>
      </footer>
    </div>
  </div>
</template>

<style scoped>
.stitch-app {
  display: flex;
  min-height: 100vh;
  background-color: var(--background);
}

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
  padding: 0 0.5rem 1.25rem 0.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.brand-icon-box {
  width: 44px;
  height: 44px;
  border-radius: var(--radius-lg);
  background-color: white;
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

.sidebar-cta-wrap {
  margin: 1rem 0;
}

.sidebar-cta-btn {
  width: 100%;
  background-color: var(--primary-container);
  color: var(--secondary-fixed);
  border: 1px solid rgba(111, 251, 190, 0.35);
  font-family: var(--font-headline);
  font-size: 0.85rem;
  font-weight: 600;
  padding: 0.65rem 0.85rem;
  min-height: var(--touch-target-min, 44px);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: var(--transition-fast);
}

.sidebar-cta-btn:hover {
  background-color: var(--tertiary-container);
  border-color: var(--secondary-fixed);
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.nav-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.65rem 0.85rem;
  min-height: var(--touch-target-min, 44px);
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
}

.nav-item-left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
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
  background-color: var(--tertiary-container);
  color: var(--surface-container-lowest);
}

.nav-item.active {
  background-color: var(--primary-container);
  color: var(--secondary-fixed);
  border-color: rgba(111, 251, 190, 0.25);
  font-weight: 600;
}

.nav-item.disabled {
  opacity: 0.45;
  cursor: not-allowed;
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

/* Barra inferior del sidebar */
.academic-session-card {
  background-color: rgba(46, 54, 75, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: var(--radius-md);
  padding: 0.65rem 0.85rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.85rem;
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
}

.session-year {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--surface-container-lowest);
}

.session-status {
  font-size: 0.7rem;
  color: var(--on-tertiary-container);
}

.session-icon {
  color: var(--on-tertiary-container);
}

.sidebar-secondary-links {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.nav-item-sm {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.4rem 0.75rem;
  font-size: 0.75rem;
  color: var(--on-tertiary-container);
  background: transparent;
  border: none;
  cursor: pointer;
  border-radius: var(--radius-sm);
  width: 100%;
}

.nav-item-sm.disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

/* --- ÁREA PRINCIPAL --- */
.stitch-main-layout {
  flex: 1;
  margin-left: 260px;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

/* Header superior */
.stitch-header {
  height: 64px;
  background-color: var(--surface-container-lowest);
  border-bottom: 1px solid var(--outline-variant);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1.5rem;
  position: sticky;
  top: 0;
  z-index: 30;
}

.header-left,
.header-right {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.context-chip {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  background-color: var(--surface-container-low);
  border: 1px solid var(--outline-variant);
  border-radius: var(--radius-md);
  padding: 0.35rem 0.75rem;
}

.chip-icon {
  color: var(--secondary);
}

.chip-content {
  display: flex;
  flex-direction: column;
}

.chip-label {
  font-size: 0.6875rem;
  color: var(--on-surface-variant);
  line-height: 1;
}

.chip-value-row {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  margin-top: 0.15rem;
}

.chip-val {
  font-size: 0.825rem;
  font-weight: 600;
  color: var(--secondary);
}

.chip-tag {
  font-size: 0.7rem;
  background-color: var(--surface-container-highest);
  color: var(--on-surface-variant);
  padding: 0.1rem 0.35rem;
  border-radius: var(--radius-xs);
  font-weight: 500;
}

.chip-tag-active {
  font-size: 0.7rem;
  background-color: var(--primary-container);
  color: var(--secondary-fixed);
  padding: 0.1rem 0.35rem;
  border-radius: var(--radius-xs);
  font-weight: 600;
}

.chip-arrow {
  color: var(--on-surface-variant);
}

.role-pill-selector {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  background-color: var(--surface-container-low);
  border: 1px solid var(--outline-variant);
  padding: 0.25rem 0.6rem;
  border-radius: var(--radius-md);
}

.role-icon {
  color: var(--primary-container);
}

.role-pill-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--on-surface-variant);
  margin-bottom: 0;
}

.role-dropdown {
  background-color: var(--surface-container-lowest);
  border: 1px solid #cbd5e1;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--primary-container);
  border-radius: var(--radius-sm);
  padding: 0.2rem 0.4rem;
  cursor: pointer;
}

.teacher-profile {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.25rem 0.5rem;
  border-radius: var(--radius-md);
}

.teacher-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: var(--primary-container);
  color: var(--secondary-fixed);
  font-size: 0.75rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}

.teacher-details {
  display: flex;
  flex-direction: column;
}

.teacher-name {
  font-size: 0.825rem;
  font-weight: 600;
  color: var(--on-surface);
  line-height: 1.1;
}

.teacher-role {
  font-size: 0.7rem;
  color: var(--on-surface-variant);
}

/* Canvas de contenido */
.stitch-content-canvas {
  flex: 1;
  padding: 2rem 1.75rem;
  max-width: 1280px;
  width: 100%;
  margin: 0 auto;
}

.content-container {
  width: 100%;
}

.toast-banner {
  margin-bottom: 1.5rem;
}

.stitch-footer {
  border-top: 1px solid var(--outline-variant);
  background-color: var(--surface-container-lowest);
  padding: 1rem 1.5rem;
  text-align: center;
  font-size: 0.75rem;
  color: var(--on-surface-variant);
}

/* Botón de alternancia de menú en móvil */
.mobile-menu-toggle {
  display: none;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: var(--radius-md, 8px);
  color: var(--surface-container-lowest, #ffffff);
  cursor: pointer;
  transition: all 0.2s ease;
}

.mobile-menu-toggle:hover {
  background-color: var(--tertiary-container, #283149);
}

/* =========================================================================
   DISEÑO RESPONSIVO: DESPLIEGUE VERTICAL HACIA ABAJO (< 1280px)
   ========================================================================= */
@media (max-width: 1279px) {
  /* Contenedor raíz: flujo 100% vertical en móvil y tableta */
  .stitch-app {
    display: flex !important;
    flex-direction: column !important;
    width: 100% !important;
    min-height: 100vh !important;
    overflow-x: hidden !important;
    background-color: var(--background) !important;
  }

  /* Header sticky compacto (60px) cuando el menú está colapsado */
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
    transition: box-shadow 0.2s ease;
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

  .brand-left {
    display: flex !important;
    align-items: center !important;
    gap: 0.65rem !important;
    white-space: nowrap !important;
  }

  .brand-icon-box {
    width: 36px !important;
    height: 36px !important;
    padding: 3px !important;
    border-radius: var(--radius-md, 8px) !important;
  }

  .brand-title-row {
    display: flex !important;
    align-items: center !important;
    gap: 0.35rem !important;
    white-space: nowrap !important;
  }

  .brand-name {
    font-size: 1.15rem !important;
    white-space: nowrap !important;
  }

  .brand-edu-chip {
    font-size: 0.6rem !important;
    padding: 0.05rem 0.35rem !important;
  }

  .brand-org,
  .active-tab-chip {
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

  /* Elementos eliminados en responsive (< 1280px) */
  .academic-session-card,
  .desktop-user-menu-wrap,
  .sidebar-cta-wrap {
    display: none !important;
  }

  /* Estado colapsado: Todo el menú oculto */
  .sidebar-nav.is-collapsed-mobile,
  .sidebar-bottom.is-collapsed-mobile {
    display: none !important;
  }

  /* Estado desplegado: La pantalla completa se desliza suavemente HACIA ABAJO */
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

  .stitch-sidebar.mobile-nav-open .nav-item span {
    display: inline-block !important;
  }

  .nav-active-pill {
    font-size: 0.7rem !important;
    font-weight: 700 !important;
    padding: 0.15rem 0.55rem !important;
    border-radius: 9999px !important;
    background-color: rgba(111, 251, 190, 0.2) !important;
    color: var(--secondary-fixed, #6ffbbe) !important;
    border: 1px solid rgba(111, 251, 190, 0.4) !important;
    text-transform: uppercase !important;
    letter-spacing: 0.05em !important;
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

  /* Lienzo principal: 100% de ancho en responsive */
  .stitch-main-layout {
    margin-left: 0 !important;
    width: 100% !important;
    max-width: 100vw !important;
    min-width: 0 !important;
    flex: 1 !important;
  }

  .stitch-content-canvas {
    padding: 1.25rem 1rem 2.5rem 1rem !important;
    max-width: 100% !important;
    width: 100% !important;
  }

  .header-left,
  .header-right {
    flex-wrap: wrap !important;
    gap: 0.5rem !important;
  }
}

@media (min-width: 1280px) {
  .user-profile-card {
    display: none !important;
  }

  .mobile-menu-toggle {
    display: none !important;
  }

  .active-tab-chip {
    display: none !important;
  }

  .mobile-logout-btn {
    display: none !important;
  }
}

/* Animación de deslizamiento vertical estricto hacia abajo (sin desplazamiento horizontal) */
@keyframes slideDownScreen {
  from {
    opacity: 0.4;
    transform: translateY(-24px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideDownContent {
  from {
    opacity: 0;
    transform: translateY(-12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* User Section Styles */
.user-section {
  position: relative;
  margin-top: auto;
  padding: 0 0.75rem;
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

.user-avatar:hover {
  background: #059669;
  transform: scale(1.08);
  box-shadow: 0 6px 16px rgba(16, 185, 129, 0.35);
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
  border-bottom: 1px solid rgba(75, 85, 99, 0.3);
}

.user-name {
  margin: 0 0 0.25rem;
  font-size: 0.95rem;
  font-weight: 700;
  color: white;
}

.user-role {
  margin: 0;
  font-size: 0.8rem;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.menu-divider {
  height: 1px;
  background: rgba(75, 85, 99, 0.3);
  margin: 0.5rem 0;
}

.logout-btn {
  width: 100%;
  padding: 0.75rem 1rem;
  min-height: var(--touch-target-min, 44px);
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
}
</style>
