import { API_BASE_URL } from "../config";

// Wrapper for fetch that includes credentials
export const apiFetch = async (endpoint, options = {}) => {
  const url = endpoint.startsWith("http") ? endpoint : `${API_BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  return response;
};

// Convenience methods
export const api = {
  get: (endpoint) => apiFetch(endpoint),

  post: (endpoint, data) =>
    apiFetch(endpoint, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  patch: (endpoint, data) =>
    apiFetch(endpoint, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  put: (endpoint, data) =>
    apiFetch(endpoint, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  delete: (endpoint) =>
    apiFetch(endpoint, {
      method: "DELETE",
    }),
};