export const BASE_URL = "http://localhost:3001";

export const api = {
  signup: `${BASE_URL}/auth/signup`,
  login: `${BASE_URL}/auth/login`,
  logout: `${BASE_URL}/auth/logout`,
  refresh: `${BASE_URL}/auth/refresh`,
  suggestions: `${BASE_URL}/suggestions`,
  profile: `${BASE_URL}/auth/profile`,
};
