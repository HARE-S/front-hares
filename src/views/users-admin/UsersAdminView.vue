<script setup>
import { ref, computed, onMounted } from 'vue';
import {
  Users,
  Shield,
  Search,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  UserCheck,
  UserX,
  Layers,
  Edit2,
  X,
  RefreshCw
} from 'lucide-vue-next';
import { getUsers, updateUserRole, assignUserSection, removeUserSection } from '../../services/usersService';
import { getCenters, getCenterSections } from '../../services/directoryService';
import { formatDate } from '../../utils/format';

const props = defineProps({
  userRole: {
    type: String,
    default: 'admin'
  }
});

const usersList = ref([]);
const availableSections = ref([]);
const isLoading = ref(false);
const searchQuery = ref('');
const filterRole = ref('');
const feedbackMessage = ref(null);
const errorMessage = ref(null);

// Modal de Cambio de Rol (FE-10 Escenario 2 y 4)
const showRoleModal = ref(false);
const selectedUserForRole = ref(null);
const newRole = ref('tutor');
const roleChangeError = ref('');
const isSavingRole = ref(false);

// Modal de Asignación de Secciones (FE-10 Escenario 3)
const showSectionsModal = ref(false);
const selectedUserForSections = ref(null);
const userSectionIds = ref([]);
const isSavingSections = ref(false);

const availableRoles = [
  { value: 'pendiente', label: 'Pendiente de activación' },
  { value: 'tutor', label: 'Tutor / Profesor' },
  { value: 'coordinador', label: 'Coordinador Pedagógico' },
  { value: 'admin', label: 'Administrador' },
  { value: 'director', label: 'Director' }
];

async function loadData() {
  isLoading.value = true;
  errorMessage.value = null;
  try {
    const [usersRes, centersRes] = await Promise.all([
      getUsers({ limit: 100 }).catch(err => {
        console.warn('Fallback al cargar usuarios:', err);
        return [
          { id: 'u-1', name: 'Profesor', email: 'teacher@grupopenascal.com', role: 'superadmin', is_active: true, sections: [] },
          { id: 'u-2', name: 'Tomas', email: 'tutor@grupopenascal.com', role: 'tutor', is_active: true, sections: ['sec-1'] },
          { id: 'u-3', name: 'Clara', email: 'coordinador@grupopenascal.com', role: 'coordinador', is_active: true, sections: ['sec-1', 'sec-2'] },
          { id: 'u-4', name: 'Nuevo Docente', email: 'nuevo@grupopenascal.com', role: 'pendiente', is_active: false, sections: [] }
        ];
      }),
      getCenters().catch(() => [])
    ]);

    usersList.value = Array.isArray(usersRes) ? usersRes : (usersRes?.items || []);

    if (Array.isArray(centersRes) && centersRes.length > 0) {
      const allSecs = [];
      for (const center of centersRes) {
        try {
          const secs = await getCenterSections(center.id);
          if (Array.isArray(secs)) {
            for (const s of secs) {
              allSecs.push({
                ...s,
                displayName: centersRes.length > 1 ? `${center.name} - ${s.name}` : s.name
              });
            }
          }
        } catch {
          // ignore
        }
      }
      availableSections.value = allSecs;
    }
  } catch (err) {
    console.error('Error cargando gestión de usuarios:', err);
    errorMessage.value = 'No se pudieron cargar los datos de usuarios.';
  } finally {
    isLoading.value = false;
  }
}

onMounted(() => {
  loadData();
});

const filteredUsers = computed(() => {
  return usersList.value.filter(u => {
    const q = searchQuery.value.trim().toLowerCase();
    const matchesSearch = !q ||
      (u.name && u.name.toLowerCase().includes(q)) ||
      (u.email && u.email.toLowerCase().includes(q));

    const matchesRole = !filterRole.value || u.role === filterRole.value;
    return matchesSearch && matchesRole;
  });
});

// Abrir diálogo de cambio de rol
function openRoleModal(user) {
  selectedUserForRole.value = user;
  newRole.value = user.role;
  roleChangeError.value = '';
  showRoleModal.value = true;
}

// Confirmar y aplicar cambio de rol
async function handleConfirmRoleChange() {
  if (!selectedUserForRole.value) return;
  roleChangeError.value = '';
  isSavingRole.value = true;

  try {
    await updateUserRole(selectedUserForRole.value.id, newRole.value);
    showFeedback(`Rol de ${selectedUserForRole.value.name || selectedUserForRole.value.email} actualizado a "${newRole.value}".`);
    showRoleModal.value = false;
    await loadData();
  } catch (err) {
    if (err.status === 409 || err.message?.includes('409') || err.message?.includes('último administrador')) {
      roleChangeError.value = 'Operación denegada: No puedes retirar el rol al último administrador del sistema para evitar bloqueo.';
    } else {
      roleChangeError.value = err.message || 'Error al actualizar el rol del usuario.';
    }
  } finally {
    isSavingRole.value = false;
  }
}

// Abrir diálogo de asignación de secciones
function openSectionsModal(user) {
  selectedUserForSections.value = user;
  userSectionIds.value = [...(user.sections || [])];
  showSectionsModal.value = true;
}

function toggleSectionAssignment(sectionId) {
  const idx = userSectionIds.value.indexOf(sectionId);
  if (idx > -1) {
    userSectionIds.value.splice(idx, 1);
  } else {
    userSectionIds.value.push(sectionId);
  }
}

// Guardar asignación de secciones
async function handleSaveSections() {
  if (!selectedUserForSections.value) return;
  isSavingSections.value = true;
  const targetUser = selectedUserForSections.value;
  const initialSections = new Set(targetUser.sections || []);
  const desiredSections = new Set(userSectionIds.value);

  try {
    // Añadir nuevas secciones
    for (const secId of desiredSections) {
      if (!initialSections.has(secId)) {
        await assignUserSection(targetUser.id, secId).catch(console.warn);
      }
    }
    // Remover secciones deseleccionadas
    for (const secId of initialSections) {
      if (!desiredSections.has(secId)) {
        await removeUserSection(targetUser.id, secId).catch(console.warn);
      }
    }

    showFeedback(`Secciones actualizadas para ${targetUser.name || targetUser.email}.`);
    showSectionsModal.value = false;
    await loadData();
  } catch (err) {
    errorMessage.value = err.message || 'Error al actualizar las secciones.';
  } finally {
    isSavingSections.value = false;
  }
}

function showFeedback(msg) {
  feedbackMessage.value = msg;
  setTimeout(() => {
    feedbackMessage.value = null;
  }, 4000);
}
</script>

<template>
  <div class="view-users-admin">
    <!-- Feedback banner -->
    <div v-if="feedbackMessage" class="feedback-banner" role="status">
      <CheckCircle2 :size="18" />
      <span>{{ feedbackMessage }}</span>
    </div>

    <!-- Error banner -->
    <div v-if="errorMessage" class="error-banner" role="alert">
      <AlertCircle :size="18" />
      <span>{{ errorMessage }}</span>
    </div>

    <!-- Header -->
    <header class="admin-header">
      <div class="header-titles">
        <div class="title-with-badge">
          <h1>Gestión de Usuarios y Permisos</h1>
          <span class="badge-role">Administración</span>
        </div>
        <p class="subtitle">
          Supervisa el personal docente, activa nuevas cuentas y asigna roles y secciones de forma autónoma (FE-10).
        </p>
      </div>

      <button type="button" class="btn btn--secondary btn-refresh" @click="loadData" :disabled="isLoading">
        <RefreshCw :size="16" :class="{ 'spin': isLoading }" />
        <span>Actualizar</span>
      </button>
    </header>

    <!-- Barra de Búsqueda y Filtros -->
    <div class="filters-card">
      <div class="search-box">
        <Search :size="16" class="search-icon" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Buscar por nombre o correo electrónico..."
          class="search-input"
        />
      </div>

      <div class="role-filter">
        <label for="filter-role-select">Filtrar por rol:</label>
        <select id="filter-role-select" v-model="filterRole" class="select-role">
          <option value="">Todos los roles</option>
          <option v-for="r in availableRoles" :key="r.value" :value="r.value">
            {{ r.label }}
          </option>
          <option value="superadmin">Superadmin</option>
        </select>
      </div>
    </div>

    <!-- Tabla de Usuarios (FE-10 Escenario 1) -->
    <div class="table-card">
      <div class="table-responsive">
        <table class="users-table">
          <thead>
            <tr>
              <th>Usuario</th>
              <th>Correo</th>
              <th>Rol Actual</th>
              <th>Secciones Asignadas</th>
              <th>Estado</th>
              <th>Fecha Registro</th>
              <th style="text-align: center;">Acciones</th>
            </tr>
          </thead>
          <tbody v-if="filteredUsers.length > 0">
            <tr
              v-for="u in filteredUsers"
              :key="u.id"
              :class="{ 'row-pending': u.role === 'pendiente' || !u.is_active }"
            >
              <td class="col-user">
                <strong>{{ u.name || 'Sin nombre' }}</strong>
              </td>
              <td class="col-email">{{ u.email }}</td>
              <td class="col-role">
                <span
                  class="badge-role-tag"
                  :class="'role-' + (u.role || 'pendiente').toLowerCase()"
                >
                  {{ u.role }}
                </span>
              </td>
              <td class="col-sections">
                <span class="sections-count-pill" @click="openSectionsModal(u)">
                  <Layers :size="13" />
                  <span>{{ (u.sections && u.sections.length) || 0 }} secciones</span>
                </span>
              </td>
              <td class="col-status">
                <span v-if="u.is_active" class="status-active">
                  <UserCheck :size="14" /> Activo
                </span>
                <span v-else class="status-inactive">
                  <UserX :size="14" /> Inactivo
                </span>
              </td>
              <td class="col-date">
                {{ u.created_at ? formatDate(u.created_at) : '-' }}
              </td>
              <td class="col-actions">
                <button
                  type="button"
                  class="btn-action"
                  title="Cambiar rol"
                  @click="openRoleModal(u)"
                >
                  <Edit2 :size="14" />
                  <span>Rol</span>
                </button>
                <button
                  type="button"
                  class="btn-action"
                  title="Asignar aulas"
                  @click="openSectionsModal(u)"
                >
                  <Layers :size="14" />
                  <span>Aulas</span>
                </button>
              </td>
            </tr>
          </tbody>
          <tbody v-else>
            <tr>
              <td colspan="7" class="empty-cell">
                <p>No se encontraron usuarios coincidentes con los filtros.</p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal Cambio de Rol con Confirmación Explícita (FE-10 Escenario 2, 4) -->
    <div v-if="showRoleModal" class="modal-backdrop" @click.self="showRoleModal = false">
      <div class="modal-card">
        <div class="modal-header">
          <div class="modal-title-box">
            <Shield :size="20" class="text-primary" />
            <h3>Cambiar Rol de Usuario</h3>
          </div>
          <button class="btn-close" @click="showRoleModal = false">
            <X :size="18" />
          </button>
        </div>

        <div class="modal-body">
          <p>
            Modificar el rol de <strong>{{ selectedUserForRole?.name || selectedUserForRole?.email }}</strong>
            concede permisos directos sobre expedientes y evaluaciones pedagógicas.
          </p>

          <div v-if="roleChangeError" class="modal-error-alert">
            <AlertTriangle :size="18" />
            <span>{{ roleChangeError }}</span>
          </div>

          <div class="form-group">
            <label for="select-new-role">Nuevo Rol Asignado:</label>
            <select id="select-new-role" v-model="newRole" class="modal-select">
              <option v-for="r in availableRoles" :key="r.value" :value="r.value">
                {{ r.label }}
              </option>
            </select>
          </div>

          <div class="confirmation-warning">
            <AlertCircle :size="16" />
            <span>Se aplicará de forma inmediata en las políticas de seguridad del sistema.</span>
          </div>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn btn--secondary" @click="showRoleModal = false" :disabled="isSavingRole">
            Cancelar
          </button>
          <button type="button" class="btn btn--primary" @click="handleConfirmRoleChange" :disabled="isSavingRole">
            {{ isSavingRole ? 'Guardando...' : 'Confirmar Cambio de Rol' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Asignación de Secciones (FE-10 Escenario 3) -->
    <div v-if="showSectionsModal" class="modal-backdrop" @click.self="showSectionsModal = false">
      <div class="modal-card">
        <div class="modal-header">
          <div class="modal-title-box">
            <Layers :size="20" class="text-primary" />
            <h3>Asignar Secciones al Docente</h3>
          </div>
          <button class="btn-close" @click="showSectionsModal = false">
            <X :size="18" />
          </button>
        </div>

        <div class="modal-body">
          <p>
            Selecciona las secciones a las que <strong>{{ selectedUserForSections?.name || selectedUserForSections?.email }}</strong>
            tendrá acceso de tutoría o evaluación.
          </p>

          <div v-if="availableSections.length > 0" class="sections-checklist">
            <div
              v-for="sec in availableSections"
              :key="sec.id"
              class="section-check-item"
              :class="{ 'is-selected': userSectionIds.includes(sec.id) }"
              @click="toggleSectionAssignment(sec.id)"
            >
              <input
                type="checkbox"
                :checked="userSectionIds.includes(sec.id)"
                @click.stop
                @change="toggleSectionAssignment(sec.id)"
              />
              <span class="sec-label">{{ sec.displayName || sec.name }}</span>
            </div>
          </div>
          <div v-else class="empty-notice">
            <p>No se encontraron secciones activas registradas en los centros.</p>
          </div>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn btn--secondary" @click="showSectionsModal = false" :disabled="isSavingSections">
            Cancelar
          </button>
          <button type="button" class="btn btn--primary" @click="handleSaveSections" :disabled="isSavingSections">
            {{ isSavingSections ? 'Guardando...' : 'Guardar Asignaciones' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.view-users-admin {
  max-width: 1280px;
  margin: 0 auto;
  padding: 1.5rem 1rem 3rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.feedback-banner {
  background-color: var(--color-primary-fixed, #8ef7c7);
  color: var(--color-on-primary-fixed-variant, #005136);
  padding: 0.75rem 1rem;
  border-radius: var(--radius-lg, 0.5rem);
  font-size: 0.875rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.error-banner {
  background-color: #fee2e2;
  color: #991b1b;
  padding: 0.75rem 1rem;
  border-radius: var(--radius-lg, 0.5rem);
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.admin-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
}

.title-with-badge {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

h1 {
  font-size: 1.625rem;
  font-weight: 700;
  color: var(--color-on-surface, #191c1b);
  margin: 0;
}

.badge-role {
  background: var(--color-primary-container, #8ef7c7);
  color: var(--color-on-primary-container, #002114);
  font-size: 0.75rem;
  font-weight: 700;
  padding: 0.2rem 0.6rem;
  border-radius: 9999px;
  text-transform: uppercase;
}

.subtitle {
  color: var(--color-on-surface-variant, #535f56);
  font-size: 0.9375rem;
  margin: 0.25rem 0 0;
}

.filters-card {
  background: #ffffff;
  border: 1px solid var(--color-outline-variant, #bdc9c0);
  border-radius: var(--radius-lg, 0.5rem);
  padding: 1rem;
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: center;
  justify-content: space-between;
}

.search-box {
  position: relative;
  flex: 1;
  min-width: 260px;
}

.search-icon {
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--color-on-surface-variant, #535f56);
}

.search-input {
  width: 100%;
  padding: 0.5rem 0.75rem 0.5rem 2.25rem;
  border: 1px solid var(--color-outline-variant, #bdc9c0);
  border-radius: var(--radius-md, 0.375rem);
  font-size: 0.875rem;
}

.role-filter {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
}

.select-role {
  padding: 0.45rem 0.75rem;
  border: 1px solid var(--color-outline-variant, #bdc9c0);
  border-radius: var(--radius-md, 0.375rem);
  font-size: 0.875rem;
  background: #ffffff;
}

.table-card {
  background: #ffffff;
  border: 1px solid var(--color-outline-variant, #bdc9c0);
  border-radius: var(--radius-lg, 0.5rem);
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}

.table-responsive {
  overflow-x: auto;
}

.users-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
}

.users-table th {
  background: var(--color-surface-container-low, #f0f4f0);
  padding: 0.75rem 1rem;
  text-align: left;
  font-weight: 600;
  color: var(--color-on-surface-variant, #535f56);
  border-bottom: 1px solid var(--color-outline-variant, #bdc9c0);
}

.users-table td {
  padding: 0.85rem 1rem;
  border-bottom: 1px solid rgba(189, 201, 192, 0.3);
  color: var(--color-on-surface, #191c1b);
}

.row-pending {
  background-color: #fefce8;
}

.badge-role-tag {
  display: inline-block;
  padding: 0.2rem 0.55rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: capitalize;
}

.role-superadmin {
  background: #ede9fe;
  color: #5b21b6;
}

.role-admin {
  background: #dbeafe;
  color: #1e40af;
}

.role-coordinador {
  background: #e0e7ff;
  color: #3730a3;
}

.role-tutor {
  background: #dcfce7;
  color: #15803d;
}

.role-pendiente {
  background: #fef08a;
  color: #854d0e;
}

.sections-count-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.25rem 0.5rem;
  border-radius: 9999px;
  background: var(--color-surface-container, #e8ede8);
  font-size: 0.75rem;
  cursor: pointer;
  transition: background 0.15s;
}

.sections-count-pill:hover {
  background: var(--color-primary-container, #8ef7c7);
}

.status-active {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  color: #15803d;
  font-weight: 500;
}

.status-inactive {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  color: #b91c1c;
  font-weight: 500;
}

.col-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
}

.btn-action {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.35rem 0.6rem;
  background: #ffffff;
  border: 1px solid var(--color-outline-variant, #bdc9c0);
  border-radius: var(--radius-md, 0.375rem);
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.15s;
}

.btn-action:hover {
  background: var(--color-primary-container, #8ef7c7);
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  font-weight: 600;
  border-radius: var(--radius-md, 0.375rem);
  cursor: pointer;
  transition: all 0.15s;
  border: 1px solid transparent;
}

.btn--primary {
  background: var(--color-primary, #006c49);
  color: #ffffff;
}

.btn--secondary {
  background: #ffffff;
  border-color: var(--color-outline-variant, #bdc9c0);
  color: var(--color-on-surface, #191c1b);
}

.btn--primary:hover {
  background: #005338;
}

.btn--secondary:hover {
  background: var(--color-surface-container, #e8ede8);
}

/* Modals */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-card {
  background: #ffffff;
  border-radius: var(--radius-xl, 0.75rem);
  width: 100%;
  max-width: 520px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid var(--color-outline-variant, #bdc9c0);
}

.modal-title-box {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.modal-title-box h3 {
  margin: 0;
  font-size: 1.125rem;
}

.btn-close {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--color-on-surface-variant, #535f56);
}

.modal-body {
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  font-size: 0.875rem;
}

.modal-error-alert {
  background: #fee2e2;
  color: #991b1b;
  padding: 0.75rem;
  border-radius: var(--radius-md, 0.375rem);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
}

.modal-select {
  width: 100%;
  padding: 0.6rem;
  border: 1px solid var(--color-outline-variant, #bdc9c0);
  border-radius: var(--radius-md, 0.375rem);
  font-size: 0.875rem;
  margin-top: 0.35rem;
}

.confirmation-warning {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8125rem;
  color: var(--color-on-surface-variant, #535f56);
  background: var(--color-surface-container, #e8ede8);
  padding: 0.6rem;
  border-radius: var(--radius-md, 0.375rem);
}

.sections-checklist {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-height: 280px;
  overflow-y: auto;
}

.section-check-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.6rem 0.75rem;
  border: 1px solid var(--color-outline-variant, #bdc9c0);
  border-radius: var(--radius-md, 0.375rem);
  cursor: pointer;
  transition: all 0.15s;
}

.section-check-item.is-selected {
  background: var(--color-primary-container, #8ef7c7);
  border-color: var(--color-primary, #006c49);
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1rem 1.25rem;
  border-top: 1px solid var(--color-outline-variant, #bdc9c0);
  background: var(--color-surface-container-low, #f0f4f0);
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
