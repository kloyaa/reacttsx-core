export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

//
export const API_LOGIN = `${API_BASE_URL}/api/auth/v1/login`;
export const API_VERIFY_TOKEN = `${API_BASE_URL}/api/auth/v1/token/verify`;

export const API_GET_PROFILES = `${API_BASE_URL}/api/clients/v1/profiles`;