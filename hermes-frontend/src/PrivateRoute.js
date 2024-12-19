// PrivateRoute.js
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { getAuthToken, clearAuthData } from './auth'; // Import utility functions

function PrivateRoute() {
  const token = getAuthToken(); // Retrieve token from both storages
  let isAuthenticated = false;

  if (token) {
    try {
      const decodedToken = jwtDecode(token);
      const currentTime = Date.now() / 1000; // Time in seconds

      if (decodedToken.exp && decodedToken.exp > currentTime) {
        isAuthenticated = true;
      } else {
        // Token has expired; clear auth data from both storages
        clearAuthData();
      }
    } catch (err) {
      console.error('Invalid token:', err);
      // Token is invalid; clear auth data
      clearAuthData();
    }
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" />;
}

export default PrivateRoute;