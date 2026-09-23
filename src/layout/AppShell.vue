<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useCourse } from '@/composables/useCourse';
import { CheckCircle2, Calendar, ChevronDown, Check } from 'lucide-vue-next';
import AppSidebar from './AppSidebar.vue';
import RegisterResultModal from '@/components/results/RegisterResultModal.vue';

const router = useRouter();
const { selectedCourse, courses, getCurrentCourseName } = useCourse();

const isCourseDropdownOpen = ref(false);
const courseSelectorRef = ref(null);
const showRegisterResultModal = ref(false);
const toastNotification = ref(null);

function showToast(message) {
  toastNotification.value = message;
  setTimeout(() => {
    toastNotification.value = null;
  }, 5000);
}

function handleResultSaved(result) {
  showToast(`Prueba registrada para ${result.studentName || 'alumno'}: ${result.ppm} PPM (${result.band})`);
}

function handleViewSectionHistory(sectionId) {
  if (sectionId) {
    router.push({ name: 'section-detail', params: { sectionId } });
  }
}

function handleSelectCourse(courseId) {
  selectedCourse.value = courseId;
  isCourseDropdownOpen.value = false;
}

function handleClickOutside(event) {
  if (courseSelectorRef.value && !courseSelectorRef.value.contains(event.target)) {
    isCourseDropdownOpen.value = false;
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<template>
  <div class="stitch-app">
    <AppSidebar />
    <div class="stitch-main-layout">
      <!-- Barra superior global (TopBar) con selector de curso y contexto -->
      <header class="stitch-topbar">
        <div class="topbar-inner">
          <div class="topbar-left">
            <div class="topbar-brand-chip">
              <span class="chip-pulse-dot"></span>
              <span class="chip-text">Fundación Peñascal</span>
            </div>
          </div>

          <div class="topbar-right">
            <!-- Selector global de Curso Escolar -->
            <div ref="courseSelectorRef" class="course-selector-container">
              <button
                type="button"
                class="course-selector-btn"
                :class="{ 'course-selector-btn--open': isCourseDropdownOpen }"
                aria-label="Seleccionar curso escolar"
                aria-haspopup="listbox"
                :aria-expanded="isCourseDropdownOpen"
                @click="isCourseDropdownOpen = !isCourseDropdownOpen"
              >
                <div class="course-btn-icon-wrap">
                  <Calendar :size="15" />
                </div>
                <span class="course-btn-text">{{ getCurrentCourseName() }}</span>
                <ChevronDown :size="14" class="course-btn-chevron" :class="{ 'chevron-flipped': isCourseDropdownOpen }" />
              </button>

              <transition name="dropdown-pop">
                <div v-if="isCourseDropdownOpen" class="course-dropdown-menu" role="listbox">
                  <div class="dropdown-title-row">
                    <span>Curso Escolar</span>
                  </div>
                  <div class="dropdown-options-list">
                    <button
                      v-for="course in courses"
                      :key="course.id"
                      type="button"
                      class="course-dropdown-option"
                      :class="{ 'course-dropdown-option--active': course.id === selectedCourse }"
                      role="option"
                      :aria-selected="course.id === selectedCourse"
                      @click="handleSelectCourse(course.id)"
                    >
                      <span class="option-name">{{ course.name }}</span>
                      <Check v-if="course.id === selectedCourse" :size="16" class="option-check-icon" />
                    </button>
                  </div>
                </div>
              </transition>
            </div>
          </div>
        </div>
      </header>

      <main class="stitch-content-canvas">
        <div class="content-container">
          <!-- Notificación Toast global -->
          <div v-if="toastNotification" class="alert alert-success toast-banner" role="alert">
            <CheckCircle2 :size="18" />
            <span>{{ toastNotification }}</span>
          </div>

          <router-view v-slot="{ Component }">
            <transition name="fade" mode="out-in">
              <component
                :is="Component"
                :course="selectedCourse"
                @new-assessment="showRegisterResultModal = true"
                @view-history="handleViewSectionHistory"
              />
            </transition>
          </router-view>

          <!-- Modal global de registro de resultado (FE-18) -->
          <RegisterResultModal
            :is-open="showRegisterResultModal"
            @close="showRegisterResultModal = false"
            @saved="handleResultSaved"
          />
        </div>
      </main>
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

.stitch-main-layout {
  flex: 1;
  margin-left: 260px;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.stitch-content-canvas {
  flex: 1;
  padding: 2rem 1.75rem;
  max-width: 1280px;
  width: 100%;
  margin: 0 auto;
  animation: fadeIn 0.3s ease-in-out;
}

.content-container {
  width: 100%;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.stitch-footer {
  border-top: 1px solid var(--outline-variant);
  background-color: var(--surface-container-lowest);
  padding: 1rem 1.5rem;
  text-align: center;
  font-size: 0.75rem;
  color: var(--on-surface-variant);
}

.stitch-footer p {
  margin: 0;
}

/* Barra Superior Global (TopBar) */
.stitch-topbar {
  background-color: var(--surface-container-lowest, #ffffff);
  border-bottom: 1px solid var(--outline-variant, #e2e8f0);
  padding: 0 1.75rem;
  height: 56px;
  display: flex;
  align-items: center;
  position: sticky;
  top: 0;
  z-index: 30;
  backdrop-filter: blur(8px);
}

.topbar-inner {
  width: 100%;
  max-width: 1280px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.topbar-left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.topbar-brand-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0.75rem;
  background-color: var(--surface-container, #f1f5f9);
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--on-surface-variant, #475569);
  border: 1px solid var(--outline-variant, #e2e8f0);
}

.chip-pulse-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background-color: var(--primary, #059669);
  box-shadow: 0 0 0 2px rgba(5, 150, 105, 0.2);
}

.chip-text {
  letter-spacing: 0.02em;
}

.topbar-right {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.course-selector-container {
  position: relative;
}

.course-selector-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.4rem 0.85rem;
  background: var(--surface-container-lowest, #ffffff);
  border: 1px solid var(--outline-variant, #cbd5e1);
  border-radius: 9999px;
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--on-surface, #1e293b);
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
}

.course-selector-btn:hover {
  border-color: var(--primary, #059669);
  background-color: #f0fdf4;
  color: #065f46;
}

.course-selector-btn--open {
  border-color: var(--primary, #059669);
  background-color: #ecfdf5;
  color: #065f46;
  box-shadow: 0 0 0 3px rgba(5, 150, 105, 0.15);
}

.course-btn-icon-wrap {
  display: flex;
  align-items: center;
  color: var(--primary, #059669);
}

.course-btn-chevron {
  color: var(--on-surface-variant, #64748b);
  transition: transform 0.2s ease;
}

.chevron-flipped {
  transform: rotate(180deg);
}

/* Menú flotante de cursos */
.course-dropdown-menu {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  min-width: 190px;
  background: #ffffff;
  border: 1px solid var(--outline-variant, #e2e8f0);
  border-radius: 12px;
  padding: 0.375rem;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.04);
  z-index: 50;
  transform-origin: top right;
}

.dropdown-title-row {
  padding: 0.5rem 0.75rem 0.35rem;
  font-size: 0.6875rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #64748b;
  border-bottom: 1px solid #f1f5f9;
  margin-bottom: 0.25rem;
}

.dropdown-options-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.course-dropdown-option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: none;
  background: transparent;
  border-radius: 8px;
  font-size: 0.8125rem;
  font-weight: 500;
  color: #334155;
  cursor: pointer;
  transition: all 0.15s ease;
  text-align: left;
}

.course-dropdown-option:hover {
  background-color: #f1f5f9;
  color: #0f172a;
}

.course-dropdown-option--active {
  background-color: #ecfdf5;
  color: #065f46;
  font-weight: 600;
}

.option-check-icon {
  color: var(--primary, #059669);
  flex-shrink: 0;
}

/* Animaciones Dropdown */
.dropdown-pop-enter-active,
.dropdown-pop-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.dropdown-pop-enter-from,
.dropdown-pop-leave-to {
  opacity: 0;
  transform: scale(0.95) translateY(-4px);
}

/* Rail de iconos en tableta (< 1280px - FE-13 Escenario 1) */
@media (max-width: 1279px) {
  .stitch-main-layout {
    margin-left: 72px;
  }

  .stitch-topbar {
    padding: 0 1rem;
  }

  .stitch-content-canvas {
    padding: 1.5rem 1rem;
  }
}

/* Modo móvil (< 768px - FE-13 Escenario 5) */
@media (max-width: 767px) {
  .stitch-main-layout {
    margin-left: 0;
  }

  .stitch-topbar {
    padding: 0 0.75rem;
    height: 52px;
  }

  .topbar-brand-chip {
    padding: 0.2rem 0.5rem;
    font-size: 0.7rem;
  }

  .stitch-content-canvas {
    padding: 1rem 0.75rem;
  }
}

.toast-banner {
  margin-bottom: 1.5rem;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>