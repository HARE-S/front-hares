import { http, HttpResponse } from 'msw';

/**
 * Simulaciones de autenticación (dominio de Santiago).
 * Copiadas de la especificación OpenAPI (BE-48): la forma de los datos
 * debe coincidir con la del backend real, o las pruebas pasan en verde
 * y la pantalla se rompe al conectar.
 */
export const authHandlers = [
  http.get('/api/v1/auth/me', () =>
    HttpResponse.json({
      id: 'u-1',
      name: 'Santiago Patiño',
      email: 'santiago.patino@grupopenascal.com',
      role: 'coordinator',
      sections: ['sec-1']
    })
  )
];