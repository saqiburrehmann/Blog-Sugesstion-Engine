export const BASE_URL = "http://localhost:3001";

export const api = {
  signup: `${BASE_URL}/auth/signup`,
  login: `${BASE_URL}/auth/login`,
  logout: `${BASE_URL}/auth/logout`,
  refresh: `${BASE_URL}/auth/refresh`,
  suggestions: `${BASE_URL}/suggestions`,
  profile: `${BASE_URL}/auth/profile`,
  blogDetail: "http://localhost:3001/blogs",
  readingHistory: `${BASE_URL}/interactions/history`,
};
