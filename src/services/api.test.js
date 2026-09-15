import { describe, it, expect, vi, afterEach } from 'vitest';
import { http, HttpResponse } from 'msw';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { server } from '../tests/setup';
import { request, ApiError, UnauthorizedError, ForbiddenError } from './api';

const SRC_ROOT = join(process.cwd(), 'src');

afterEach(() => {
  vi.restoreAllMocks();
});

/**
 * Sustituye `window.location` por un objeto controlable (jsdom no navega).
 * Devuelve el spy de `assign` para poder comprobar la redirección.
 */
function stubLocation(href) {
  const assign = vi.fn();
  vi.spyOn(window, 'location', 'get').mockReturnValue({ href, assign });
  return assign;
}

describe('escenario 1: petición correcta', () => {
  it('devuelve el cuerpo ya parseado sin manipular la respuesta HTTP', async () => {
    server.use(
      http.get('/api/v1/echo', () => HttpResponse.json({ ok: true, items: [1, 2] }))
    );

    await expect(request('/echo')).resolves.toEqual({ ok: true, items: [1, 2] });
  });
});

describe('escenario 2: la cookie de sesión viaja', () => {
  it('incluye credentials: include y cabeceras JSON en toda petición', async () => {
    const fetchSpy = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(new Response(JSON.stringify({ ok: true }), { status: 200 }));

    await request('/echo');

    const [url, init] = fetchSpy.mock.calls[0];
    expect(url).toBe('/api/v1/echo');
    expect(init.credentials).toBe('include');
    expect(init.headers['Content-Type']).toBe('application/json');
  });
});

describe('escenario 3: sesión caducada (401)', () => {
  it('redirige al login recordando la ruta y lanza UnauthorizedError', async () => {
    server.use(
      http.get('/api/v1/echo', () => new HttpResponse(null, { status: 401 }))
    );

    const assign = stubLocation('https://app.test/students/abc-123');

    await expect(request('/echo')).rejects.toBeInstanceOf(UnauthorizedError);
    expect(assign).toHaveBeenCalledWith(
      `/login?reason=expired&next=${encodeURIComponent('https://app.test/students/abc-123')}`
    );
  });
});

describe('escenario 4: permiso insuficiente (403)', () => {
  it('lanza ForbiddenError y NO redirige al login', async () => {
    server.use(
      http.get('/api/v1/echo', () => new HttpResponse(null, { status: 403 }))
    );

    const assign = stubLocation('https://app.test/students/abc-123');

    await expect(request('/echo')).rejects.toBeInstanceOf(ForbiddenError);
    expect(assign).not.toHaveBeenCalled();
    expect(globalThis.location.assign).not.toBeCalled();
  });
});

describe('escenario 5: respuesta sin contenido (204)', () => {
  it('devuelve null sin intentar parsear un cuerpo vacío', async () => {
    server.use(
      http.delete('/api/v1/echo', () => new HttpResponse(null, { status: 204 }))
    );

    await expect(request('/echo', { method: 'DELETE' })).resolves.toBeNull();
  });
});

describe('escenario 6: error del servidor con forma estable', () => {
  it('expone código, mensaje y campo afectado (422 con field)', async () => {
    server.use(
      http.get('/api/v1/echo', () =>
        HttpResponse.json({ message: 'El tiempo no es un número válido.', field: 'time' }, { status: 422 })
      )
    );

    const err = await request('/echo').catch((e) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect(err.status).toBe(422);
    expect(err.message).toBe('El tiempo no es un número válido.');
    expect(err.field).toBe('time');
  });

  it('interpreta el estilo Flask de errores por campo (400 con errors)', async () => {
    server.use(
      http.get('/api/v1/echo', () =>
        HttpResponse.json({ errors: { time: 'Debe ser un número positivo.' } }, { status: 400 })
      )
    );

    const err = await request('/echo').catch((e) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect(err.status).toBe(400);
    expect(err.field).toBe('time');
    expect(err.message).toBe('Debe ser un número positivo.');
  });
});

describe('escenario 7: ningún fetch fuera de services/', () => {
  it('no encuentra fetch directo en componentes ni vistas', () => {
    const offenders = [];

    function scan(dir) {
      for (const entry of readdirSync(dir, { withFileTypes: true })) {
        if (
          entry.name === 'node_modules' ||
          entry.name === 'services' ||
          entry.name === 'tests' ||
          entry.name.startsWith('.')
        ) {
          continue;
        }
        const full = join(dir, entry.name);
        if (entry.isDirectory()) {
          scan(full);
          continue;
        }
        if (!/\.(js|vue)$/.test(entry.name)) continue;

        const lines = readFileSync(full, 'utf8').split('\n');
        lines.forEach((line, i) => {
          if (/\bfetch\s*\(/.test(line)) offenders.push(`${full}:${i + 1}`);
        });
      }
    }

    scan(SRC_ROOT);
    expect(offenders).toEqual([]);
  });
});