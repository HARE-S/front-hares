<script setup>
import { useAuth } from '@/composables/useAuth';

const { user } = useAuth();
</script>

<template>
  <div class="dashboard">
    <h1>Dashboard</h1>
    <p v-if="user">Bienvenido, {{ user.email }}</p>
    <p class="placeholder">Contenido en construcción...</p>
  </div>
</template>

<style scoped>
.dashboard {
  max-width: 1200px;
  margin: 0 auto;
}

h1 {
  margin-top: 0;
  color: #333;
}

.placeholder {
  color: #999;
  font-style: italic;
}
</style>
