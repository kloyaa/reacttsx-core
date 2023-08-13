export const API_BASE_URL = import.meta.env.VITE_ENV === "development" ? 
    import.meta.env.VITE_API_BASE_URL_LOCAL : 
    import.meta.env.VITE_API_BASE_URL ;

//
export const API_LOGIN = `${API_BASE_URL}/api/auth/v1/login`;
export const API_VERIFY_TOKEN = `${API_BASE_URL}/api/auth/v1/token/verify`;

export const API_GET_PROFILES = `${API_BASE_URL}/api/clients/v1/profiles`;

// Admin priveleges
export const API_VERIFY_PROFILE = `${API_BASE_URL}/api/employee/v1/profile-verification`;
export const API_GET_ACTIVITIES = `${API_BASE_URL}/api/activity/v1/activities`;
export const API_GET_ALL_BETS = `${API_BASE_URL}/api/bet/v1/bets`;

export const API_CREATE_DAILY_RESULT = `${API_BASE_URL}/api/bet/v1/result`;
export const API_GET_DAILY_RESULTS = `${API_BASE_URL}/api/bet/v1/daily-result`;
export const API_GET_DAILY_TOTAL = `${API_BASE_URL}/api/bet/v1/daily-total`;
export const API_DELETE_DAILY_RESULT = `${API_BASE_URL}/api/bet/v1/remove`;

export const API_GET_ALL_TRANSACTIONS = `${API_BASE_URL}/api/transaction/v1/all`;

