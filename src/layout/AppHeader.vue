<script setup>
import { useAuth } from '@/composables/useAuth';
</script>

<template>
  <header class="app-header">
    <div class="header-content">
      <h1 class="page-title">HARES</h1>
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
</style>
