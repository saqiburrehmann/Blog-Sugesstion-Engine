export const BASE_URL = "http://localhost:3001";

export const api = {
  signup: `${BASE_URL}/auth/signup`,
  login: `${BASE_URL}/auth/login`,
  logout: `${BASE_URL}/auth/logout`,
  refresh: `${BASE_URL}/auth/refresh`,
  suggestions: `${BASE_URL}/suggestions`,
  popular: `${BASE_URL}/suggestions/popular`,
  profile: `${BASE_URL}/auth/profile`,
  blogDetail: `${BASE_URL}/blogs`,
  readingHistory: `${BASE_URL}/interactions/history`,
};
