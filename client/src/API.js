const SERVER_URL = 'http://localhost:3001/api';

async function getJson(response) {
  if (response.ok) {
    if (response.status === 204) {
      return null;
    }

    return await response.json();
  }

  let error = { error: 'Unknown error' };

  try {
    error = await response.json();
  } catch {
    // Response was not JSON
  }

  throw error;
}

export async function login(username, password) {
  const response = await fetch(`${SERVER_URL}/sessions`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ username, password })
  });

  return await getJson(response);
}

export async function logout() {
  const response = await fetch(`${SERVER_URL}/sessions/current`, {
    method: 'DELETE',
    credentials: 'include'
  });

  return await getJson(response);
}

export async function getCurrentUser() {
  const response = await fetch(`${SERVER_URL}/sessions/current`, {
    credentials: 'include'
  });

  return await getJson(response);
}

export async function getRanking() {
  const response = await fetch(`${SERVER_URL}/ranking`, {
    credentials: 'include'
  });

  return await getJson(response);
}

export async function getNetwork() {
  const response = await fetch(`${SERVER_URL}/network`, {
    credentials: 'include'
  });

  return await getJson(response);
}