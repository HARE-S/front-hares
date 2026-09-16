<script setup>
defineProps({
  title: {
    type: String,
    required: true,
  },
  value: {
    type: [String, Number],
    required: true,
  },
  subtext: String,
  badge: Object, // { label, type: 'success'|'danger'|'info' }
  icon: String, // emoji o clase
});
</script>

<template>
  <div class="metric-card">
    <div class="metric-header">
      <h3 class="metric-title">{{ title }}</h3>
      <span v-if="icon" class="metric-icon">{{ icon }}</span>
    </div>

    <div class="metric-value">
      <span class="value">{{ value }}</span>
      <span v-if="subtext" class="subtext">{{ subtext }}</span>
    </div>

    <div v-if="badge" class="metric-badge" :class="`badge-${badge.type}`">
      {{ badge.label }}
    </div>
  </div>
</template>

<style scoped>
.metric-card {
  background-color: var(--white);
  border: 1px solid var(--gray-200);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.metric-header {
  display: flex;
  justify-content: space-between;
  align-items: start;
}

.metric-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--gray-600);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: 0;
}

.metric-icon {
  font-size: 1.25rem;
}

.metric-value {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.value {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--green-950);
}

.subtext {
  font-size: 0.8rem;
  color: var(--gray-500);
}

.metric-badge {
  align-self: flex-start;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.7rem;
  font-weight: 600;
  padding: 0.35rem 0.65rem;
  border-radius: 999px;
  text-transform: uppercase;
  letter-spacing: 0.02em;
}

.badge-success {
  background-color: var(--success-bg);
  color: var(--success-text);
  border: 1px solid var(--success-border);
}

.badge-danger {
  background-color: var(--danger-bg);
  color: var(--danger-text);
  border: 1px solid var(--danger-border);
}

.badge-info {
  background-color: var(--green-50);
  color: var(--green-900);
  border: 1px solid var(--green-200);
}
</style>
