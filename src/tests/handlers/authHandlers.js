import { http, HttpResponse } from 'msw';

const mockUsers = [
  {
    id: '1',
    email: 'admin@grupopenascal.com',
    password: 'admin123',
    role: 'admin',
    name: 'Administrador'
  },
  {
    id: '2',
    email: 'coordinator@grupopenascal.com',
    password: 'coord123',
    role: 'coordinator',
    name: 'Coordinador'
  },
  {
    id: '3',
    email: 'teacher@grupopenascal.com',
    password: 'teacher123',
    role: 'teacher',
    name: 'Profesor'
  }
];

// Estado de sesión: recuperar del sessionStorage si existe (para persistencia al recargar)
let currentSession = null;

// Intentar recuperar sesión guardada (permite persistencia al recargar página)
if (typeof sessionStorage !== 'undefined') {
  try {
    const stored = sessionStorage.getItem('__hares_session_dev__');
    if (stored) {
      currentSession = JSON.parse(stored);
      console.log('[MSW] ✅ Sesión recuperada del sessionStorage');
    }
  } catch (err) {
    console.log('[MSW] Sesión anterior no válida');
  }
}

console.log('[MSW] Handlers de autenticación listos');

export const authHandlers = [
  http.post('/api/v1/auth/register', async ({ request }) => {
    const body = await request.json();
    const { email, password, name } = body;

    if (!email.endsWith('@grupopenascal.com')) {
      return HttpResponse.json(
        { error: 'Solo se permiten correos @grupopenascal.com' },
        { status: 400 }
      );
    }

    if (mockUsers.find(u => u.email === email)) {
      return HttpResponse.json(
        { error: 'El correo ya está registrado' },
        { status: 409 }
      );
    }

    const newUser = {
      id: String(mockUsers.length + 1),
      email,
      password,
      name: name || email.split('@')[0],
      role: 'pending'
    };

    mockUsers.push(newUser);

    return HttpResponse.json(
      {
        message: 'Usuario registrado exitosamente. Espera a que un administrador active tu cuenta.'
      },
      { status: 201 }
    );
  }),

  http.post('/api/v1/auth/login', async ({ request }) => {
    const body = await request.json();
    const { email, password } = body;

    if (!email) {
      return HttpResponse.json(
        { error: 'El correo es requerido' },
        { status: 400 }
      );
    }

    if (!email.endsWith('@grupopenascal.com')) {
      return HttpResponse.json(
        { error: 'Solo se permiten correos @grupopenascal.com' },
        { status: 400 }
      );
    }

    const user = mockUsers.find(u => u.email === email);

    if (!user) {
      return HttpResponse.json(
        { error: 'Correo o contraseña incorrectos' },
        { status: 401 }
      );
    }

    if (password && password !== user.password) {
      return HttpResponse.json(
        { error: 'Correo o contraseña incorrectos' },
        { status: 401 }
      );
    }

    currentSession = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    };

    return HttpResponse.json(
      {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      },
      {
        status: 200,
        headers: {
          'Set-Cookie': `session=${user.id}; Path=/; HttpOnly; SameSite=Strict`
        }
      }
    );
  }),

  http.get('/api/v1/auth/me', () => {
    if (!currentSession) {
      return HttpResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }

    return HttpResponse.json({
      id: currentSession.id,
      email: currentSession.email,
      name: currentSession.name,
      role: currentSession.role
    });
  }),

  http.post('/api/v1/auth/logout', () => {
    currentSession = null;

    return HttpResponse.json(
      { message: 'Sesión cerrada' },
      {
        status: 200,
        headers: {
          'Set-Cookie': 'session=; Path=/; Max-Age=0'
        }
      }
    );
  }),

  http.post('/api/v1/auth/forgot-password', async ({ request }) => {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return HttpResponse.json(
        { error: 'El correo es requerido' },
        { status: 400 }
      );
    }

    if (!email.endsWith('@grupopenascal.com')) {
      return HttpResponse.json(
        { error: 'Solo se permiten correos @grupopenascal.com' },
        { status: 400 }
      );
    }

    const user = mockUsers.find(u => u.email === email);

    if (!user) {
      return HttpResponse.json(
        { message: 'Si el correo existe, recibirás un enlace de recuperación.' },
        { status: 200 }
      );
    }

    return HttpResponse.json(
      {
        message: 'Se envió un enlace de recuperación a tu correo. Revisa tu bandeja de entrada.'
      },
      { status: 200 }
    );
  }),

  http.post('/api/v1/auth/resend-verification', async ({ request }) => {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return HttpResponse.json(
        { error: 'El correo es requerido' },
        { status: 400 }
      );
    }

    const user = mockUsers.find(u => u.email === email);

    if (!user) {
      return HttpResponse.json(
        { error: 'Correo no encontrado' },
        { status: 404 }
      );
    }

    return HttpResponse.json(
      {
        message: 'Se reenviaron las instrucciones de verificación. Revisa tu correo.'
      },
      { status: 200 }
    );
  })
];
