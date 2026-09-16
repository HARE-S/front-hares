<script setup>
import { useAuth } from '@/composables/useAuth';

const { user } = useAuth();
</script>

<template>
  <header class="app-header">
    <div class="header-content">
      <h1 class="page-title">HARES</h1>
      <div class="header-right">
        <span v-if="user" class="user-badge">
          {{ user.email }}
        </span>
      </div>
    </div>
  </header>
</template>

<style scoped>
.app-header {
  background-color: var(--white);
  border-bottom: 1px solid var(--gray-200);
  padding: 1rem 1.5rem;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1400px;
  margin: 0 auto;
}

.page-title {
  margin: 0;
  font-size: 1.25rem;
  color: var(--green-950);
  font-weight: 700;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-badge {
  padding: 0.5rem 1rem;
  background-color: var(--green-50);
  border: 1px solid var(--green-200);
  border-radius: 9999px;
  font-size: 0.875rem;
  color: var(--green-900);
  font-weight: 500;
}
</style>
