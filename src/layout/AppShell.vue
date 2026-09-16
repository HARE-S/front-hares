<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import AppSidebar from './AppSidebar.vue';
import AppHeader from './AppHeader.vue';

const route = useRoute();

// Las pantallas fuera del layout (login, 404) no muestran el shell.
const showShell = computed(() => !route.meta.public);
</script>

<template>
  <div v-if="showShell" class="app-shell">
    <AppSidebar />
    <div class="shell-main">
      <AppHeader />
      <main class="shell-content">
        <router-view />
      </main>
    </div>
  </div>
  <router-view v-else />
</template>

<style scoped>
.app-shell {
  display: grid;
  grid-template-columns: auto 1fr;
  min-height: 100vh;
  background-color: var(--gray-50);
}

.shell-main {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.shell-content {
  flex: 1;
  padding: 1.5rem;
  overflow-y: auto;
}
</style>