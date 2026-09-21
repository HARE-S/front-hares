<script setup>
import { ref, computed } from 'vue';
import { ChevronDown } from 'lucide-vue-next';

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

function toggleDropdown() {
  isOpen.value = !isOpen.isOpen;
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
      <div class="course-selector__content">
        <div class="course-selector__icon">📅</div>
        <div class="course-selector__text">
          <span class="course-selector__label">Curso</span>
          <span class="course-selector__value">{{ selectedCourse?.name }}</span>
        </div>
      </div>
      <ChevronDown
        :size="18"
        class="course-selector__chevron"
        :class="{ 'course-selector__chevron--rotated': isOpen }"
      />
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
  justify-content: space-between;
  gap: 1rem;
  padding: 0.75rem 1rem;
  background: linear-gradient(135deg, var(--gray-900) 0%, var(--gray-800) 100%);
  border: 1px solid var(--gray-700);
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.95rem;
  font-weight: 500;
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

.course-selector__content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.course-selector__icon {
  font-size: 1.25rem;
  opacity: 0.8;
}

.course-selector__text {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
  text-align: left;
}

.course-selector__label {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--gray-400);
  font-weight: 400;
}

.course-selector__value {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--green-400);
}

.course-selector__chevron {
  flex-shrink: 0;
  color: var(--gray-400);
  transition: transform 0.2s ease;
}

.course-selector__chevron--rotated {
  transform: rotate(180deg);
  color: var(--green-400);
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
