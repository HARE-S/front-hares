import { http, HttpResponse } from 'msw';

/**
 * Simulacros MSW del Bloque A (Marlen) — importación de Alexia (REPARTO §2).
 * Replican EXACTAMENTE el contrato de back-hares/app/api/v1/imports.py
 * (BE-08 y BE-09): subida/previsualización, confirmación e informe.
 *
 * Regla: al desplegar el backend real, quitar estos handlers debe bastar.
 */

const PREVIEW_MAX_ROWS = 5;

/** Filas de ejemplo interpretables por el backend (cabecera esperada). */
const MOCK_ROWS = [
  { student_id: 'A-001', student_name: 'María García López', sections: ['1º ESO A'], center: 'Peñascal Norte' },
  { student_id: 'A-002', student_name: 'Lucía Fernández Ortiz', sections: ['1º ESO A'], center: 'Peñascal Norte' },
  { student_id: 'A-003', student_name: 'Daniel Martínez Ruiz', sections: ['2º ESO B'], center: 'Peñascal Norte' },
  { student_id: 'A-004', student_name: 'Carmen Sánchez Vega', sections: [null], center: null },
  { student_id: 'A-005', student_name: 'Álvaro Pérez Gil', sections: ['3º ESO A'], center: 'Peñascal Sur' },
  { student_id: 'A-006', student_name: 'Elena Torres Díaz', sections: ['3º ESO A'], center: 'Peñascal Sur' },
];

let uploadStore = new Map();
let uploadCounter = 0;

function makeToken() {
  uploadCounter += 1;
  return `mock-token-${uploadCounter}`;
}

export const importHandlers = [
  http.post('/api/v1/import/upload', async ({ request }) => {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!(file instanceof File) && !(file && file.name)) {
      return HttpResponse.json(
        { error: "El campo 'file' es obligatorio" },
        { status: 400 }
      );
    }

    const name = file.name;
    const allowedExtensions = ['.csv'];
    const maxBytes = 10 * 1024 * 1024; // 10 MB (configuración del proxy)

    const extension = name.slice(name.lastIndexOf('.')).toLowerCase();
    if (!allowedExtensions.includes(extension)) {
      return HttpResponse.json(
        {
          error:
            'Extensión no permitida. Extensiones válidas: ' +
            allowedExtensions.join(', '),
        },
        { status: 400 }
      );
    }

    const size = file.size || new Blob([file]).size;
    if (size > maxBytes) {
      return HttpResponse.json(
        { error: `El fichero supera el tamaño máximo permitido (${maxBytes} bytes)` },
        { status: 400 }
      );
    }

    const text = await file.text();
    const errors = [];
    const rows = [...MOCK_ROWS];
    const token = makeToken();
    uploadStore.set(token, { filename: name, content: text || '' });

    return HttpResponse.json({
      token,
      filename: name,
      preview: rows.slice(0, PREVIEW_MAX_ROWS),
      total_rows: rows.length + errors.length,
      errors: errors.length,
      error_details: errors.slice(0, 5),
      allowed_extensions: allowedExtensions,
      max_bytes: maxBytes,
    });
  }),

  http.post('/api/v1/import/confirm', async ({ request }) => {
    const body = await request.json().catch(() => null);
    const token = body?.token;

    if (!token) {
      return HttpResponse.json(
        { error: "El campo 'token' es obligatorio" },
        { status: 400 }
      );
    }

    if (!uploadStore.has(token)) {
      return HttpResponse.json(
        { error: 'El fichero subido no existe o ha caducado' },
        { status: 404 }
      );
    }

    uploadStore.delete(token);

    return HttpResponse.json({
      message: 'Importación completada',
      report_id: 'reporte-mock-1',
      summary: {
        total: 6,
        processed: 5,
        errors: 1,
        students_created: 3,
        students_updated: 2,
      },
    });
  }),

  http.get('/api/v1/import/report', () => {
    const csv = [
      'linea;columna;motivo',
      '4;seccion;La sección indicada no existe en el centro',
      '7;student_name;El nombre no puede estar vacío',
    ].join('\n');

    return HttpResponse.text(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition':
          'attachment; filename="informe_errores_importacion.csv"',
      },
    });
  }),
];