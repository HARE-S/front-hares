<script setup>
import { ref } from 'vue';
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
  School
} from 'lucide-vue-next';

const currentTab = ref('statistics'); // 'statistics' | 'catalog' | 'books' | 'bulk-entry' | 'section-detail' | 'form'
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
    <aside class="stitch-sidebar">
      <div class="sidebar-top">
        <!-- Logo & Branding -->
        <div class="brand-header">
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
        </div>

        <!-- Quick Action CTA -->
        <div v-if="userRole !== 'tutor'" class="sidebar-cta-wrap">
          <button
            class="sidebar-cta-btn"
            @click="handleOpenCreate"
          >
            <PlusCircle :size="16" />
            <span>{{ testToEdit ? 'Editar Prueba' : 'Nueva Prueba' }}</span>
          </button>
        </div>

        <!-- Navegación Principal -->
        <nav class="sidebar-nav">
          <button
            class="nav-item"
            :class="{ active: currentTab === 'statistics' }"
            @click="currentTab = 'statistics'"
          >
            <LayoutDashboard :size="18" />
            <span>Estadísticas</span>
          </button>

          <button
            class="nav-item"
            :class="{ active: route.path.startsWith('/centers') }"
            @click="router.push('/centers')"
          >
            <School :size="18" />
            <span class="flex-1">Alumnado</span>
            <span v-if="route.path.startsWith('/centers')" class="nav-active-dot"></span>
          </button>

          <button
            class="nav-item"
            :class="{ active: currentTab === 'catalog' && !testToEdit }"
            @click="currentTab = 'catalog'; testToEdit = null;"
          >
            <Layers :size="18" />
            <span class="flex-1">Catálogo de Pruebas</span>
            <span v-if="currentTab === 'catalog'" class="nav-active-dot"></span>
          </button>

          <button
            class="nav-item"
            :class="{ active: currentTab === 'bulk-entry' || currentTab === 'section-detail' }"
            @click="currentTab = 'bulk-entry'; testToEdit = null;"
          >
            <Edit3 :size="18" />
            <span class="flex-1">Registro en Aula</span>
            <span v-if="currentTab === 'bulk-entry' || currentTab === 'section-detail'" class="nav-active-dot"></span>
          </button>

          <button
            class="nav-item"
            :class="{ active: currentTab === 'books' }"
            @click="currentTab = 'books'; testToEdit = null;"
          >
            <Library :size="18" />
            <span class="flex-1">Biblioteca de Libros</span>
            <span v-if="currentTab === 'books'" class="nav-active-dot"></span>
          </button>

          <button
            class="nav-item"
            :class="{ active: currentTab === 'reports' }"
            @click="currentTab = 'reports'; testToEdit = null;"
          >
            <BarChart3 :size="18" />
            <span class="flex-1">Informes y Exportación</span>
            <span v-if="currentTab === 'reports'" class="nav-active-dot"></span>
          </button>
        </nav>
      </div>

      <!-- Pie de la barra lateral con estado académico -->
      <div class="sidebar-bottom">
        <div class="academic-session-card">
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
  gap: 0.75rem;
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

/* Rail de iconos en tableta (< 1280px - FE-13 Escenario 1) */
@media (max-width: 1279px) {
  .stitch-sidebar {
    width: 72px;
    padding: 1rem 0.5rem;
  }
  .brand-text,
  .sidebar-cta-btn span,
  .nav-item span,
  .academic-session-card,
  .sidebar-secondary-links {
    display: none;
  }
  .sidebar-cta-btn {
    padding: 0.5rem;
    border-radius: 50%;
  }
  .stitch-main-layout {
    margin-left: 72px;
  }
  .stitch-content-canvas {
    padding: 1.5rem 1rem;
  }
  .hidden-sm {
    display: none;
  }

  /* En tablet: ocultar nombre y rol, solo mostrar avatar */
  .user-info {
    display: none;
  }

  .user-avatar-wrapper {
    justify-content: center;
    padding: 0.35rem;
  }

  .user-avatar {
    width: 44px;
    height: 44px;
    font-size: 1rem;
  }

  .user-menu {
    left: 75px;
    width: 280px;
    bottom: 75px;
  }
}

/* Modo móvil (< 768px - FE-13 Escenario 5) */
@media (max-width: 767px) {
  .stitch-sidebar {
    width: 100%;
    position: relative;
    padding: 0.75rem 1rem;
  }
  .stitch-main-layout {
    margin-left: 0;
  }
  .stitch-content-canvas {
    padding: 1rem 0.75rem;
  }
  .header-left,
  .header-right {
    flex-wrap: wrap;
    gap: 0.5rem;
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
