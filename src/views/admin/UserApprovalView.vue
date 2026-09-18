<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '@/composables/useAuth';
import AdminLayout from '@/layout/AdminLayout.vue';
import { CheckCircle, XCircle, Clock } from 'lucide-vue-next';

const router = useRouter();
const { user } = useAuth();

const pendingUsers = ref([]);
const approvedUsers = ref([]);
const rejectedUsers = ref([]);
const activeTab = ref('pending');
const loading = ref(false);

onMounted(async () => {
  // Verificar que es super admin
  if (user.value?.role !== 'superadmin') {
    router.push('/dashboard');
    return;
  }

  await loadUsers();
});

async function loadUsers() {
  loading.value = true;
  try {
    const [pendingRes, approvedRes, rejectedRes] = await Promise.all([
      fetch('/api/v1/users/pending', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      }),
      fetch('/api/v1/users/approved', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      }),
      fetch('/api/v1/users/rejected', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      })
    ]);

    const pendingData = await pendingRes.json();
    const approvedData = await approvedRes.json();
    const rejectedData = await rejectedRes.json();

    pendingUsers.value = Array.isArray(pendingData) ? pendingData : [];
    approvedUsers.value = Array.isArray(approvedData) ? approvedData : [];
    rejectedUsers.value = Array.isArray(rejectedData) ? rejectedData : [];
  } catch (err) {
    console.error('Error cargando usuarios:', err);
  } finally {
    loading.value = false;
  }
}

async function approveUser(userId) {
  try {
    const response = await fetch(`/api/v1/users/pending/${userId}/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ role: 'tutor' })
    });

    if (response.ok) {
      await loadUsers();
    }
  } catch (err) {
    console.error('Error aprobando usuario:', err);
  }
}

async function rejectUser(userId) {
  try {
    const response = await fetch(`/api/v1/users/pending/${userId}/reject`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include'
    });

    if (response.ok) {
      await loadUsers();
    }
  } catch (err) {
    console.error('Error rechazando usuario:', err);
  }
}

const displayUsers = computed(() => {
  switch (activeTab.value) {
    case 'pending':
      return pendingUsers.value;
    case 'approved':
      return approvedUsers.value;
    case 'rejected':
      return rejectedUsers.value;
    default:
      return [];
  }
});
</script>

<template>
  <AdminLayout>
    <div class="admin-panel">
    <div class="panel-header">
      <h1>Panel de Administración</h1>
      <p class="subtitle">Gestión de solicitudes de acceso</p>
    </div>

    <!-- Tabs -->
    <div class="tabs-section">
      <button
        :class="['tab-btn', { active: activeTab === 'pending' }]"
        @click="activeTab = 'pending'"
      >
        <Clock :size="18" />
        Pendientes ({{ pendingUsers.length }})
      </button>
      <button
        :class="['tab-btn', { active: activeTab === 'approved' }]"
        @click="activeTab = 'approved'"
      >
        <CheckCircle :size="18" />
        Aprobadas ({{ approvedUsers.length }})
      </button>
      <button
        :class="['tab-btn', { active: activeTab === 'rejected' }]"
        @click="activeTab = 'rejected'"
      >
        <XCircle :size="18" />
        Rechazadas ({{ rejectedUsers.length }})
      </button>
    </div>

    <!-- Contenido -->
    <div class="content-section">
      <div v-if="loading" class="loading">Cargando...</div>

      <div v-else-if="displayUsers.length === 0" class="empty-state">
        <p>
          {{
            activeTab === 'pending'
              ? 'No hay solicitudes pendientes'
              : activeTab === 'approved'
              ? 'No hay usuarios aprobados'
              : 'No hay usuarios rechazados'
          }}
        </p>
      </div>

      <div v-else class="users-grid">
        <div v-for="u in displayUsers" :key="u.id" class="user-card">
          <div class="user-info">
            <div class="user-name">{{ u.name }} {{ u.lastname }}</div>
            <div class="user-email">{{ u.email }}</div>
            <div class="user-meta">
              <span class="center" v-if="u.area">{{ u.area }}</span>
              <span class="role">{{ u.role }}</span>
            </div>
          </div>

          <div v-if="activeTab === 'pending'" class="user-actions">
            <button
              class="btn-approve"
              @click="approveUser(u.id)"
              title="Aprobar solicitud"
            >
              <CheckCircle :size="20" />
              Aprobar
            </button>
            <button
              class="btn-reject"
              @click="rejectUser(u.id)"
              title="Rechazar solicitud"
            >
              <XCircle :size="20" />
              Rechazar
            </button>
          </div>

          <div v-else class="user-status">
            <span v-if="activeTab === 'approved'" class="status-badge approved">
              ✓ Aprobado
            </span>
            <span v-else class="status-badge rejected">✗ Rechazado</span>
          </div>
        </div>
      </div>
    </div>
    </div>
  </AdminLayout>
</template>

<style scoped>
.admin-panel {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.panel-header {
  margin-bottom: 2rem;
}

.panel-header h1 {
  font-size: 2rem;
  font-weight: 700;
  color: #0d9488;
  margin: 0 0 0.5rem 0;
}

.subtitle {
  color: #6b7280;
  font-size: 0.95rem;
  margin: 0;
}

.tabs-section {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 2rem;
  border-bottom: 2px solid #e5e7eb;
}

.tab-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: none;
  border: none;
  border-bottom: 3px solid transparent;
  margin-bottom: -2px;
  color: #6b7280;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.95rem;
}

.tab-btn:hover {
  color: #0d9488;
}

.tab-btn.active {
  color: #0d9488;
  border-bottom-color: #0d9488;
}

.content-section {
  background: white;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  padding: 2rem;
  min-height: 400px;
}

.loading,
.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  color: #6b7280;
  font-size: 1rem;
}

.users-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
}

.user-card {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  transition: all 0.2s;
}

.user-card:hover {
  border-color: #0d9488;
  box-shadow: 0 4px 12px rgba(13, 148, 136, 0.1);
}

.user-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.user-name {
  font-weight: 700;
  font-size: 1rem;
  color: #111827;
}

.user-email {
  font-size: 0.85rem;
  color: #6b7280;
}

.user-meta {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  margin-top: 0.25rem;
}

.center,
.role {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 600;
  color: #374151;
}

.user-actions {
  display: flex;
  gap: 0.75rem;
}

.btn-approve,
.btn-reject {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.625rem 1rem;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-approve {
  background: #10b981;
  color: white;
}

.btn-approve:hover {
  background: #059669;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.btn-reject {
  background: #ef4444;
  color: white;
}

.btn-reject:hover {
  background: #dc2626;
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
}

.user-status {
  display: flex;
  justify-content: center;
}

.status-badge {
  display: inline-block;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.85rem;
}

.status-badge.approved {
  background: #d1fae5;
  color: #065f46;
}

.status-badge.rejected {
  background: #fee2e2;
  color: #991b1b;
}
</style>
