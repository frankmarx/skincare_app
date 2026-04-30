const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

let accessToken = null;
let idToken = null;

export function setTokens(access, id) {
  accessToken = access;
  idToken = id;
  if (access && id) {
    localStorage.setItem('skincare_tokens', JSON.stringify({ access, id }));
  } else {
    localStorage.removeItem('skincare_tokens');
  }
}

export function getTokens() {
  return { accessToken, idToken };
}

export function clearTokens() {
  setTokens(null, null);
}

export function loadStoredTokens() {
  const stored = localStorage.getItem('skincare_tokens');
  if (stored) {
    const { access, id } = JSON.parse(stored);
    accessToken = access;
    idToken = id;
    return true;
  }
  return false;
}

function authHeaders() {
  return idToken ? { 'Authorization': `Bearer ${idToken}` } : {};
}

async function handleResponse(response) {
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw err;
  }
  return response.json();
}

export async function signUp(email, password) {
  const response = await fetch(`${API_URL}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return handleResponse(response);
}

export async function confirmSignUp(email, code) {
  const response = await fetch(`${API_URL}/auth/confirm`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, code }),
  });
  return handleResponse(response);
}

export async function signIn(email, password) {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await handleResponse(response);
  setTokens(data.accessToken, data.idToken);
  return data;
}

export async function signOut() {
  clearTokens();
}

export async function getUser() {
  const response = await fetch(`${API_URL}/auth/me`, {
    headers: authHeaders(),
  });
  return handleResponse(response);
}

export async function getProfiles() {
  const response = await fetch(`${API_URL}/profiles`, {
    headers: authHeaders(),
  });
  return handleResponse(response);
}

export async function createProfile(name) {
  const response = await fetch(`${API_URL}/profiles`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ name }),
  });
  return handleResponse(response);
}

export async function deleteProfile(profileId) {
  const response = await fetch(`${API_URL}/profiles/${profileId}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  return handleResponse(response);
}

export async function getProductSuggestions(query) {
  const response = await fetch(`${API_URL}/rituals/suggest`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  });
  return handleResponse(response);
}

export async function analyzeRoutine(products) {
  const response = await fetch(`${API_URL}/rituals/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ products }),
  });
  return handleResponse(response);
}

export async function getRituals() {
  const url = new URL(`${API_URL}/rituals`);
  // We could add profileId query param here if we pass it
  const response = await fetch(url, {
    headers: authHeaders(),
  });
  return handleResponse(response);
}

export async function getRitual(profileId) {
  const response = await fetch(`${API_URL}/rituals/${profileId}`, {
    headers: authHeaders(),
  });
  return handleResponse(response);
}

export async function saveRitual(profileId, products, result) {
  const response = await fetch(`${API_URL}/rituals`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ profileId, products, result }),
  });
  return handleResponse(response);
}
