<template>
  <span 
    :class="['book-level-badge', badgeClass]" 
    :title="`Nivel pedagógico: ${level}`"
  >
    <span class="badge-dot"></span>
    <span class="badge-text">Nivel {{ level }}</span>
  </span>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  level: {
    type: String,
    required: true,
    validator: (val) => ['0', '0-I', 'I', 'I/II', 'II'].includes(val) || true
  }
});

const badgeClass = computed(() => {
  switch (props.level) {
    case '0':
      return 'badge-level-0';
    case '0-I':
      return 'badge-level-0-1';
    case 'I':
      return 'badge-level-1';
    case 'I/II':
      return 'badge-level-1-2';
    case 'II':
      return 'badge-level-2';
    default:
      return 'badge-level-default';
  }
});
</script>

<style scoped>
.book-level-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.2rem 0.55rem;
  border-radius: var(--radius-full, 9999px);
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.02em;
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
  border: 1px solid transparent;
}

.badge-dot {
  width: 0.375rem;
  height: 0.375rem;
  border-radius: 9999px;
  background-color: currentColor;
}

.badge-level-0 {
  background-color: #fef3c7;
  color: #92400e;
  border-color: #fde68a;
}

.badge-level-0-1 {
  background-color: #e0f2fe;
  color: #0369a1;
  border-color: #bae6fd;
}

.badge-level-1 {
  background-color: rgba(142, 247, 199, 0.4);
  color: var(--color-on-primary-fixed-variant, #005136);
  border-color: rgba(0, 108, 73, 0.2);
}

.badge-level-1-2 {
  background-color: rgba(111, 251, 190, 0.25);
  color: var(--color-secondary, #006c49);
  border-color: rgba(0, 108, 73, 0.3);
}

.badge-level-2 {
  background-color: var(--color-primary-fixed, #8ef7c7);
  color: var(--color-primary, #0f3e2e);
  border-color: rgba(15, 62, 46, 0.25);
}

.badge-level-default {
  background-color: var(--color-surface-container-high, #e2e9e2);
  color: var(--color-on-surface-variant, #3f4943);
  border-color: var(--color-outline-variant, #bdc9c0);
}
</style>
