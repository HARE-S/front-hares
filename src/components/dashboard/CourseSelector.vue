<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  modelValue: {
    type: String,
    default: '2024-25'
  },
  courses: {
    type: Array,
    default: () => [
      { id: '2024-25', name: 'Curso 2024-25' },
      { id: '2023-24', name: 'Curso 2023-24' },
      { id: '2022-23', name: 'Curso 2022-23' },
      { id: '2021-22', name: 'Curso 2021-22' }
    ]
  }
});

const emit = defineEmits(['update:modelValue']);

const isOpen = ref(false);

const selectedCourse = computed(() =>
  props.courses.find(c => c.id === props.modelValue)
);

function selectCourse(courseId) {
  emit('update:modelValue', courseId);
  isOpen.value = false;
}
</script>

<template>
  <div class="course-selector">
    <button
      @click="isOpen = !isOpen"
      class="course-selector__trigger"
      :class="{ 'course-selector__trigger--open': isOpen }"
      type="button"
    >
      <div class="course-selector__dot"></div>
      <div class="course-selector__content">
        <span class="course-selector__title">{{ selectedCourse?.name }}</span>
        <span class="course-selector__status">Sincronizado</span>
      </div>
      <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" class="course-selector__cloud">
        <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4c-1.48 0-2.85.43-4.01 1.17l1.46 1.46C10.21 5.23 11.08 5 12 5c3.04 0 5.5 2.46 5.5 5.5v.5H19c2.21 0 4 1.79 4 4 0 2.05-1.53 3.76-3.56 3.97l1.07-1.07c.21-.2.33-.48.33-.79 0-.55-.45-1-1-1h-1.5v-2c0-1.66-1.34-3-3-3-.35 0-.69.06-1.01.16l1.5 1.5c.09-.01.18-.02.27-.02 1.1 0 2 .9 2 2v1H9c-1.66 0-3-1.34-3-3V9h3V7H6c-2.21 0-4 1.79-4 4 0 2.05 1.53 3.76 3.56 3.97L4.5 17c-2.64 0-4.8-2.16-4.8-4.8 0-2.4 1.79-4.4 4.1-4.75.51-3.5 3.58-6.15 7.3-6.15 2.5 0 4.72 1.37 5.9 3.4l1.35-1.35z"/>
      </svg>
    </button>

    <transition name="dropdown">
      <div v-if="isOpen" class="course-selector__dropdown">
        <button
          v-for="course in courses"
          :key="course.id"
          @click="selectCourse(course.id)"
          class="course-selector__option"
          :class="{ 'course-selector__option--active': course.id === modelValue }"
          type="button"
        >
          <span class="course-selector__option-name">{{ course.name }}</span>
          <svg
            v-if="course.id === modelValue"
            viewBox="0 0 24 24"
            width="18"
            height="18"
            fill="currentColor"
            class="course-selector__checkmark"
          >
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
          </svg>
        </button>
      </div>
    </transition>
  </div>
</template>

<style scoped>
.course-selector {
  position: relative;
  z-index: 10;
}

.course-selector__trigger {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem 1rem;
  background: linear-gradient(135deg, var(--gray-900) 0%, var(--gray-800) 100%);
  border: 1px solid var(--gray-700);
  border-radius: 8px;
  cursor: pointer;
  color: var(--white);
  transition: all 0.2s ease;
  min-width: 200px;
}

.course-selector__trigger:hover {
  border-color: var(--green-500);
  box-shadow: 0 0 12px rgba(34, 197, 94, 0.1);
}

.course-selector__trigger--open {
  border-color: var(--green-500);
  box-shadow: 0 0 16px rgba(34, 197, 94, 0.15);
}

.course-selector__dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: var(--green-400);
  flex-shrink: 0;
}

.course-selector__content {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
  text-align: left;
  flex: 1;
}

.course-selector__title {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--green-400);
  line-height: 1.2;
}

.course-selector__status {
  font-size: 0.75rem;
  color: var(--gray-400);
  font-weight: 400;
}

.course-selector__cloud {
  flex-shrink: 0;
  color: var(--gray-400);
  transition: transform 0.2s ease;
}

.course-selector__dropdown {
  position: absolute;
  top: calc(100% + 0.5rem);
  left: 0;
  right: 0;
  background: var(--white);
  border: 1px solid var(--gray-200);
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  min-width: 200px;
}

.course-selector__option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 0.875rem 1rem;
  background: transparent;
  border: none;
  border-bottom: 1px solid var(--gray-100);
  cursor: pointer;
  font-size: 0.95rem;
  color: var(--gray-800);
  text-align: left;
  transition: background-color 0.15s ease;
}

.course-selector__option:last-child {
  border-bottom: none;
}

.course-selector__option:hover {
  background-color: var(--gray-50);
}

.course-selector__option--active {
  background-color: var(--green-50);
  color: var(--green-950);
  font-weight: 600;
}

.course-selector__option-name {
  flex: 1;
}

.course-selector__checkmark {
  flex-shrink: 0;
  color: var(--green-500);
  margin-left: 0.5rem;
}

/* Animations */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s ease;
}

.dropdown-enter-from {
  opacity: 0;
  transform: translateY(-8px);
}

.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
