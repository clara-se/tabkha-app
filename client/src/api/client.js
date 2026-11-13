const API_URL = import.meta.env.VITE_API_URL;

export async function apiFetch(path, options = {}) {
  const token = localStorage.getItem('token');
  const res = await fetch(API_URL + path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });
  if (res.status === 401) {
    window.dispatchEvent(new Event('auth:expired'));
  }
  if (!res.ok) throw new Error((await res.json()).error);
  return res.status === 204 ? null : res.json();
}