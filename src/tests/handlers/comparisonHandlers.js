import { http, HttpResponse } from 'msw';

/**
 * Simulacros MSW del Bloque A (Marlen) — comparativa de grupos (FE-32 / BE-32).
 * Replican el contrato de back-hares/app/api/v1/comparison.py y de
 * pair_metrics.py (group-progress, BE-31/FE-29):
 *
 *  - GET /comparison/groups?group_by=...&section_ids[]=&center_id=&min_sample=
 *    Respuesta: { group_by, min_sample, groups: [...] }
 *  - GET /pair-metrics/sections/{id}/group-progress
 *    Respuesta: { transitions, global, reading_level_counts, population, ... }
 *
 * Incluye casos ejemplares de los escenarios 3 (poco representativo) y 4/5
 * (grupo sin datos) para que la pantalla se pueda probar sin backend.
 */

const SECTIONS = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    name: '1º ESO A',
    center_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    center_name: 'Peñascal Norte',
    has_data: true,
    students_count: 24,
    results_count: 48,
    mean_ppm: 152.3,
    mean_accuracy: 82.4,
    mean_vef: 125.1
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    name: '1º ESO B',
    center_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    center_name: 'Peñascal Norte',
    has_data: true,
    students_count: 3,
    results_count: 6,
    mean_ppm: 118.9,
    mean_accuracy: 71.2,
    mean_vef: 91.0
  },
  {
    id: '33333333-3333-3333-3333-333333333333',
    name: '1º ESO C',
    center_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    center_name: 'Peñascal Norte',
    has_data: false,
    students_count: 0,
    results_count: 0,
    mean_ppm: null,
    mean_accuracy: null,
    mean_vef: null
  }
];

const CENTERS = [
  {
    id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    name: 'Peñascal Norte',
    has_data: true,
    students_count: 27,
    results_count: 54,
    mean_ppm: 148.1,
    mean_accuracy: 80.8,
    mean_vef: 119.7
  },
  {
    id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    name: 'Peñascal Sur',
    has_data: true,
    students_count: 4,
    results_count: 8,
    mean_ppm: 176.4,
    mean_accuracy: 88.1,
    mean_vef: 149.3
  }
];

const PROFILES = [
  {
    id: 'Funcional',
    name: 'Funcional',
    has_data: true,
    students_count: 18,
    results_count: 32,
    mean_ppm: 158.7,
    mean_accuracy: 84.2,
    mean_vef: 128.0
  },
  {
    id: 'Literario',
    name: 'Literario',
    has_data: true,
    students_count: 15,
    results_count: 28,
    mean_ppm: 133.2,
    mean_accuracy: 78.5,
    mean_vef: 101.3
  },
  {
    id: 'Sin perfil',
    name: 'Sin perfil',
    has_data: false,
    students_count: 0,
    results_count: 0,
    mean_ppm: null,
    mean_accuracy: null,
    mean_vef: null
  }
];

function toItem(group, groupBy) {
  const minSample = 5;
  const is_representative = group.has_data && group.students_count >= minSample;
  let warning = null;
  if (!group.has_data) {
    warning = 'Grupo sin resultados registrados';
  } else if (!is_representative) {
    warning = `Grupo poco representativo: menos de ${minSample} alumnos con resultados`;
  }
  return {
    id: group.id,
    name: group.name,
    group_by: groupBy,
    center_id: group.center_id ?? null,
    center_name: group.center_name ?? null,
    has_data: group.has_data,
    students_count: group.students_count,
    results_count: group.results_count,
    mean_ppm: group.mean_ppm,
    mean_accuracy: group.mean_accuracy,
    mean_vef: group.mean_vef,
    is_representative,
    warning
  };
}

function resolveMinSample(param) {
  const value = parseInt(param, 10);
  return Number.isFinite(value) && value >= 1 ? value : 5;
}

export const comparisonHandlers = [
  http.get('/api/v1/comparison/groups', ({ request }) => {
    const url = new URL(request.url);
    const groupBy = url.searchParams.get('group_by');
    const minSample = resolveMinSample(url.searchParams.get('min_sample'));

    let groups = [];
    if (groupBy === 'center') {
      groups = CENTERS;
    } else if (groupBy === 'profile') {
      groups = PROFILES;
    } else {
      const requested = url.searchParams.getAll('section_ids');
      groups = requested.length
        ? SECTIONS.filter((s) => requested.includes(s.id))
        : SECTIONS;
    }

    return HttpResponse.json({
      group_by: groupBy || 'section',
      min_sample: minSample,
      groups: groups.map((g) => toItem(g, groupBy || 'section'))
    });
  }),

  http.get('/api/v1/pair-metrics/sections/:sectionId/group-progress', ({ params }) => {
    const sectionId = String(params.sectionId);
    const simulated = sectionId.endsWith('3') || sectionId === '33333333-3333-3333-3333-333333333333'
      ? { improved: 0, measurable: 0, percentage: null }
      : { improved: 14, measurable: 20, percentage: 70.0 };

    return HttpResponse.json({
      transitions: {
        'I-A': { transition: 'I-A', improved: 6, measurable: 20, percentage: 30.0 },
        'A-B': { transition: 'A-B', improved: 8, measurable: 20, percentage: 40.0 }
      },
      global: simulated,
      reading_level_counts: { bajo: 3, normal: 12, alto: 9 },
      population: 24,
      anomalous_excluded: 0
    });
  })
];