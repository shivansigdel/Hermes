// auth.js

// Function to set authentication data
export function setAuthData(token, userData, rememberMe) {
    // Clear previous auth data
    clearAuthData();
  
    // Decide where to store the auth data based on "Remember Me"
    const storage = rememberMe ? localStorage : sessionStorage;
  
    // Store auth token and user data
    storage.setItem('auth-token', token);
    storage.setItem('userEmail', userData.email);
    storage.setItem('userId', userData._id);
    storage.setItem('username', userData.username);
    storage.setItem('discriminator', userData.discriminator);
  }
  
  // Function to get the authentication token
  export function getAuthToken() {
    // Prioritize sessionStorage over localStorage
    return sessionStorage.getItem('auth-token') || localStorage.getItem('auth-token');
  }
  
  // Function to get user data
  export function getUserData() {
    const userData = {
      userEmail: sessionStorage.getItem('userEmail') || localStorage.getItem('userEmail'),
      userId: sessionStorage.getItem('userId') || localStorage.getItem('userId'),
      username: sessionStorage.getItem('username') || localStorage.getItem('username'),
      discriminator: sessionStorage.getItem('discriminator') || localStorage.getItem('discriminator'),
    };
    return userData;
  }
  
  // Function to clear authentication data
  export function clearAuthData() {
    // Clear auth data from both storages
    sessionStorage.removeItem('auth-token');
    sessionStorage.removeItem('userEmail');
    sessionStorage.removeItem('userId');
    sessionStorage.removeItem('username');
    sessionStorage.removeItem('discriminator');
  
    localStorage.removeItem('auth-token');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    localStorage.removeItem('discriminator');
  }