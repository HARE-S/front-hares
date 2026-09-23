<script setup>
import AppSidebar from '@/layout/AppSidebar.vue';
</script>

<template>
  <div class="stitch-app">
    <!-- Barra Lateral Modular Reutilizable -->
    <AppSidebar />

    <!-- Área Principal de Contenido Estándar de vue-router -->
    <div class="stitch-main-layout">
      <main class="stitch-content-canvas">
        <div class="content-container">
          <router-view />
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

@media (max-width: 1279px) {
  .stitch-main-layout {
    margin-left: 72px;
  }

  .stitch-content-canvas {
    padding: 1.5rem 1rem;
  }
}

@media (max-width: 767px) {
  .stitch-main-layout {
    margin-left: 0;
  }

  .stitch-content-canvas {
    padding: 1rem 0.75rem;
  }
}
</style>
