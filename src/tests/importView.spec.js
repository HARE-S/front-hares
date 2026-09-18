import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import ImportView from '@/views/import/ImportView.vue';

const { mockRole } = vi.hoisted(() => ({ mockRole: { current: 'admin' } }));

vi.mock('@/composables/useAuth', () => ({
  useAuth: () => ({
    user: { value: { role: mockRole.current } },
  }),
}));

vi.mock('@/services/importService', () => ({
  uploadImport: vi.fn(),
  confirmImport: vi.fn(),
  downloadImportReport: vi.fn(),
}));

import { uploadImport, confirmImport, downloadImportReport } from '@/services/importService';

function makeUploadResponse(overrides = {}) {
  return {
    token: 'tk-1',
    filename: 'alumnado.csv',
    preview: [
      { student_id: 'A-001', student_name: 'María García', sections: ['1º ESO A'], center: 'Peñascal Norte' },
      { student_id: 'A-002', student_name: 'Lucía Fernández', sections: [null], center: null },
    ],
    total_rows: 2,
    errors: 0,
    error_details: [],
    allowed_extensions: ['.csv'],
    max_bytes: 10 * 1024 * 1024,
    ...overrides,
  };
}

function makeFile(name = 'alumnado.csv', size = 1024) {
  return new File(['id,name'], name, { type: 'text/csv' });
}

async function selectFile(wrapper) {
  const input = wrapper.find('input[type="file"]');
  Object.defineProperty(input.element, 'files', { value: [makeFile()], configurable: true });
  await input.trigger('change');
}

describe('FE-23 — Pantalla de importación (Alexia)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('FE-23 Escenario 6: Un tutor NO ve la pantalla de importación y recibe acceso denegado', () => {
    mockRole.current = 'tutor';

    const wrapper = mount(ImportView);
    expect(wrapper.text()).toContain('No tienes permiso');
    expect(wrapper.find('.file-picker').exists()).toBe(false);

    mockRole.current = 'admin';
  });

  it('FE-23 Escenario 4: Rechaza un fichero con extensión no admitida ANTES de subirlo', async () => {
    const wrapper = mount(ImportView);
    const input = wrapper.find('input[type="file"]');
    Object.defineProperty(input.element, 'files', {
      value: [makeFile('datos.txt')],
      configurable: true,
    });
    await input.trigger('change');

    expect(wrapper.text()).toContain('Extensión no permitida');
    expect(uploadImport).not.toHaveBeenCalled();
  });

  it('FE-23 Escenario 5: Rechaza un fichero que supera el tamaño máximo', async () => {
    const wrapper = mount(ImportView);
    const input = wrapper.find('input[type="file"]');
    const big = makeFile('grande.csv');
    Object.defineProperty(big, 'size', { value: 11 * 1024 * 1024 });
    Object.defineProperty(input.element, 'files', { value: [big], configurable: true });
    await input.trigger('change');

    expect(wrapper.text()).toContain('tamaño máximo permitido');
    expect(uploadImport).not.toHaveBeenCalled();
  });

  it('FE-23 Escenario 1: Previsualiza las primeras filas y NO escribe en BD', async () => {
    uploadImport.mockResolvedValue(makeUploadResponse());
    const wrapper = mount(ImportView);

    await selectFile(wrapper);
    await wrapper.find('.btn-primary').trigger('click');
    await flushPromises();

    expect(uploadImport).toHaveBeenCalledTimes(1);
    expect(wrapper.text()).toContain('María García');
    expect(wrapper.find('.data-table').exists()).toBe(true);
    expect(wrapper.text()).toContain('Todavía no se ha escrito nada');
  });

  it('FE-23 Escenario 2: Confirma la importación y muestra el resumen', async () => {
    uploadImport.mockResolvedValue(makeUploadResponse());
    confirmImport.mockResolvedValue({
      message: 'Importación completada',
      report_id: 'r-1',
      summary: { total: 6, processed: 5, errors: 1, students_created: 3, students_updated: 2 },
    });
    downloadImportReport.mockResolvedValue({
      text: 'linea;columna;motivo',
      filename: 'informe.csv',
    });

    const wrapper = mount(ImportView);
    await selectFile(wrapper);
    await wrapper.find('.btn-primary').trigger('click');
    await flushPromises();

    const confirmBtn = wrapper.findAll('button').find((b) => b.text().includes('Confirmar importación'));
    await confirmBtn.trigger('click');
    await flushPromises();

    expect(wrapper.text()).toContain('Importación completada');
    expect(wrapper.text()).toContain('3 creados');
    expect(wrapper.text()).toContain('2 actualizados');
  });

  it('FE-23 Escenario 3: El botón queda deshabilitado mientras el proceso corre', async () => {
    uploadImport.mockResolvedValue(makeUploadResponse());
    let resolveConfirm;
    confirmImport.mockReturnValue(new Promise((resolve) => { resolveConfirm = resolve; }));
    downloadImportReport.mockResolvedValue({ text: '', filename: 'informe.csv' });

    const wrapper = mount(ImportView);
    await selectFile(wrapper);
    await wrapper.find('.btn-primary').trigger('click');
    await flushPromises();

    const confirmBtn = wrapper.findAll('button').find((b) => b.text().includes('Confirmar importación'));
    await confirmBtn.trigger('click');

    const disabledBtn = wrapper.findAll('button').find((b) => b.text().includes('Importando…'));
    expect(disabledBtn.attributes('disabled')).toBeDefined();

    resolveConfirm({
      message: 'Importación completada',
      report_id: 'r-1',
      summary: { total: 6, processed: 6, errors: 0, students_created: 4, students_updated: 2 },
    });
    await flushPromises();
    expect(wrapper.text()).toContain('Importación completada');
  });
});

describe('FE-24 — Informe de errores de importación', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    downloadImportReport.mockResolvedValue({
      text: [
        'linea;columna;motivo',
        '4;seccion;La sección indicada no existe',
        '7;student_name;El nombre no puede estar vacío',
        '12;student_id;El identificador ya existe',
      ].join('\n'),
      filename: 'informe_errores_importacion.csv',
    });
  });

  it('FE-24 Escenario 1 y 2: Muestra la tabla de errores y deja claro que el resto se procesó', async () => {
    const wrapper = mount(ImportView);
    await wrapper.findAll('button').find((b) => b.text().includes('Informe de errores')).trigger('click');
    await flushPromises();

    expect(wrapper.text()).toContain('La sección indicada no existe');
    expect(wrapper.text()).toContain('El identificador ya existe');
    expect(wrapper.text()).toContain('hay que corregir lo señalado');
  });

  it('FE-24 Escenario 3: Descarga el informe en CSV', async () => {
    if (typeof URL.createObjectURL !== 'function') {
      URL.createObjectURL = vi.fn().mockReturnValue('blob:mock');
      URL.revokeObjectURL = vi.fn();
    }
    const createObjectURL = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock');

    const wrapper = mount(ImportView);
    await wrapper.findAll('button').find((b) => b.text().includes('Informe de errores')).trigger('click');
    await flushPromises();

    await wrapper.findAll('button').find((b) => b.text().includes('Descargar informe')).trigger('click');
    await flushPromises();

    expect(downloadImportReport).toHaveBeenCalled();
    expect(createObjectURL).toHaveBeenCalled();
  });

  it('FE-24 Escenario 4: Sin errores, no se muestra la tabla y se confirma la importación', async () => {
    downloadImportReport.mockResolvedValue({
      text: 'linea;columna;motivo',
      filename: 'informe_errores_importacion.csv',
    });

    const wrapper = mount(ImportView);
    await wrapper.findAll('button').find((b) => b.text().includes('Informe de errores')).trigger('click');
    await flushPromises();

    expect(wrapper.text()).toContain('Sin errores');
    expect(wrapper.find('.data-table').exists()).toBe(false);
  });

  it('FE-24 Escenario 5: Pagina el informe cuando hay más de cincuenta filas', async () => {
    const lines = ['linea;columna;motivo'];
    for (let i = 1; i <= 55; i++) {
      lines.push(`${i};seccion;Error ${i}`);
    }
    downloadImportReport.mockResolvedValue({
      text: lines.join('\n'),
      filename: 'informe_errores_importacion.csv',
    });

    const wrapper = mount(ImportView);
    await wrapper.findAll('button').find((b) => b.text().includes('Informe de errores')).trigger('click');
    await flushPromises();

    expect(wrapper.text()).toContain('Página 1 de 6');
    expect(wrapper.text()).toContain('55 errores');
  });
});