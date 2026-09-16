import { request } from './api';

export async function login(email, password = '') {
  try {
    const response = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    return response;
  } catch (err) {
    throw err;
  }
}

export async function getCurrentUser() {
  try {
    const response = await request('/auth/me', {
      method: 'GET'
    });
    return response;
  } catch (err) {
    return null;
  }
}

export async function logout() {
  try {
    await request('/auth/logout', {
      method: 'POST'
    });
  } catch (err) {
    console.error('Error during logout:', err);
  }
}
