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
  background-color: white;
  border-bottom: 1px solid #e0e0e0;
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
  color: #2c3e50;
  font-weight: 600;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-badge {
  padding: 0.5rem 1rem;
  background-color: #f5f5f5;
  border-radius: 20px;
  font-size: 0.9rem;
  color: #666;
}
</style>
