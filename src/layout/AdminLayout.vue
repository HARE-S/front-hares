<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '@/composables/useAuth';
import { Users } from 'lucide-vue-next';

const router = useRouter();
const { logout, user } = useAuth();
const showUserMenu = ref(false);

async function handleLogout() {
  showUserMenu.value = false;
  await logout();
  router.push({ name: 'login' });
}
</script>

<template>
  <div class="stitch-app">
    <aside class="stitch-sidebar">
      <div class="sidebar-top">
        <div class="brand-header">
          <div class="brand-icon-box">
            <img src="/logo-hare.png" alt="HARE-S" class="brand-logo" />
          </div>
          <div class="brand-text">
            <div class="brand-title-row">
              <span class="brand-name">HARE-S</span>
              <span class="brand-edu-chip">Edu</span>
            </div>
            <span class="brand-org">Fundación Peñascal</span>
          </div>
        </div>

        <nav class="sidebar-nav">
          <button class="nav-item active">
            <Users :size="18" />
            <span>Gestión de Usuarios</span>
            <span class="nav-active-dot"></span>
          </button>
        </nav>
      </div>

      <div class="sidebar-bottom">
        <div class="user-section">
          <button class="user-avatar-wrapper" @click="showUserMenu = !showUserMenu">
            <div class="user-avatar">{{ user?.firstName?.substring(0, 2).toUpperCase() || 'A' }}</div>
            <div class="user-info">
              <p class="user-name">{{ user?.firstName }} {{ user?.lastName }}</p>
              <p class="user-role">Administrador</p>
            </div>
          </button>

          <div v-if="showUserMenu" class="user-menu">
            <div class="menu-header">
              <p class="user-name">{{ user?.firstName }} {{ user?.lastName }}</p>
              <p class="user-role">{{ user?.email }}</p>
            </div>
            <div class="menu-divider"></div>
            <button class="logout-btn" @click="handleLogout">
              <span>🚪</span>
              <span>Cerrar sesión</span>
            </button>
          </div>
        </div>
      </div>
    </aside>

    <div class="stitch-main-layout">
      <main class="stitch-content-canvas">
        <div class="content-container">
          <slot />
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

.stitch-sidebar {
  width: 260px;
  background-color: var(--tertiary);
  color: var(--on-tertiary-container);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 1.5rem 1rem;
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  z-index: 40;
  border-right: 1px solid rgba(255, 255, 255, 0.08);
  overflow-y: auto;
}

.sidebar-top {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.brand-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0 0.5rem 1.25rem 0.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.brand-icon-box {
  width: 44px;
  height: 44px;
  border-radius: var(--radius-lg);
  background-color: white;
  border: 1px solid rgba(111, 251, 190, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--secondary-fixed);
  padding: 4px;
  flex-shrink: 0;
}

.brand-logo {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.brand-text {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
}

.brand-title-row {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.brand-name {
  font-family: var(--font-headline);
  font-size: 1.2rem;
  font-weight: 800;
  color: var(--surface-container-lowest);
  letter-spacing: -0.02em;
}

.brand-edu-chip {
  background-color: rgba(111, 251, 190, 0.15);
  color: var(--secondary-fixed);
  font-size: 0.6rem;
  font-weight: 700;
  padding: 0.15rem 0.45rem;
  border-radius: 3px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.brand-org {
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.6);
  font-weight: 500;
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding-top: 0.5rem;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 0.75rem;
  min-height: var(--touch-target-min, 44px);
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.2s;
  text-align: left;
  position: relative;
}

.nav-item:hover {
  background-color: rgba(255, 255, 255, 0.08);
  color: white;
}

.nav-item.active {
  background-color: rgba(111, 251, 190, 0.15);
  color: var(--secondary-fixed);
}

.nav-active-dot {
  position: absolute;
  right: 8px;
  width: 8px;
  height: 8px;
  background-color: var(--secondary-fixed);
  border-radius: 50%;
}

.sidebar-bottom {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.user-section {
  position: relative;
}

.user-avatar-wrapper {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  min-height: var(--touch-target-min, 44px);
  background: none;
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 8px;
  cursor: pointer;
  width: 100%;
  transition: all 0.2s;
}

.user-avatar-wrapper:hover {
  background-color: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.3);
}

.user-avatar {
  width: 36px;
  height: 36px;
  background: linear-gradient(135deg, var(--secondary-fixed) 0%, var(--secondary) 100%);
  color: var(--on-secondary);
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.85rem;
  flex-shrink: 0;
}

.user-info {
  flex: 1;
  text-align: left;
  min-width: 0;
}

.user-name {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--surface-container-lowest);
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-role {
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.6);
  margin: 0;
}

.user-menu {
  position: absolute;
  bottom: 100%;
  left: 0;
  right: 0;
  background-color: var(--tertiary);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 0.5rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  z-index: 50;
}

.menu-header {
  padding: 0 0 0.75rem 0;
}

.menu-divider {
  height: 1px;
  background-color: rgba(255, 255, 255, 0.1);
  margin: 0.75rem 0;
}

.logout-btn {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  min-height: var(--touch-target-min, 44px);
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.2s;
  text-align: left;
}

.logout-btn:hover {
  background-color: rgba(255, 255, 255, 0.1);
  color: white;
}

.stitch-main-layout {
  margin-left: 260px;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.stitch-content-canvas {
  flex: 1;
  overflow-y: auto;
  padding: 2rem;
  max-width: 100%;
}

.content-container {
  max-width: 80rem;
  margin: 0 auto;
}

.stitch-footer {
  background: var(--surface-container);
  border-top: 1px solid var(--outline-variant);
  padding: 1rem 2rem;
  text-align: center;
  font-size: 0.8rem;
  color: var(--on-surface-variant);
  margin-left: 260px;
}

.stitch-footer p {
  margin: 0;
  font-weight: 500;
  letter-spacing: 0.01em;
}

/* Rail de iconos en tableta (< 1280px - FE-13 Escenario 1) */
@media (max-width: 1279px) and (min-width: 768px) {
  .stitch-sidebar {
    width: 72px;
    padding: 1rem 0.5rem;
  }
  .brand-text,
  .nav-item span:not(.nav-active-dot),
  .user-info {
    display: none;
  }
  .brand-header {
    padding: 0.5rem;
    justify-content: center;
  }
  .nav-item {
    justify-content: center;
  }
  .user-avatar-wrapper {
    justify-content: center;
    padding: 0.35rem;
  }
  .stitch-main-layout {
    margin-left: 72px;
  }
  .stitch-footer {
    margin-left: 72px;
  }
}

@media (max-width: 767px) {
  .stitch-sidebar {
    width: 100%;
    position: relative;
    padding: 1rem;
  }

  .stitch-main-layout {
    margin-left: 0;
  }

  .stitch-footer {
    margin-left: 0;
  }
}
</style>
