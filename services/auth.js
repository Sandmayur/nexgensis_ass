import api from './api';

/**
 * Authenticates a user against the DummyJSON API.
 * @param {Object} credentials - { username, password }
 * @returns {Promise<Object>} The authenticated user and token
 */
export const login = async (credentials) => {
  // Intercept the custom credentials since DummyJSON won't recognize them natively
  if (credentials.username === 'mayur' && credentials.password === '12345678') {
    return {
      accessToken: "mock-custom-token-for-mayur",
      id: 999,
      username: "mayur",
      email: "mayur@example.com",
      firstName: "Mayur",
      lastName: "Admin",
      image: "https://dummyjson.com/icon/mayur/128" // Fallback placeholder
    };
  }

 
  throw new Error("Invalid credentials. Please use mayur / 12345678");
};

/**
 * Validates the current token by fetching the current user info.
 * @returns {Promise<Object>} The current user details
 */
export const getCurrentUser = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};
