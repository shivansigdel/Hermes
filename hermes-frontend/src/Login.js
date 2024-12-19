// Login.js
import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { setAuthData } from "./auth";
import "./App.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [errorMessage, setError] = useState(null);
  const navigate = useNavigate();

  async function handleSubmit(event) {
    event.preventDefault(); // Prevent page reload
    try {
      const response = await axios.post("api/user/login", {
        email: email,
        password: password,
        rememberMe: rememberMe, // Send rememberMe to the server if needed
      });

      // Set auth data and clear old data
      setAuthData(response.data.token, response.data.user, rememberMe);

      console.log('Logged in successfully');
      navigate('/dashboard');
    } catch (error) {
      console.error("Error logging in: ", error.response?.data || error);
      if (error.response && error.response.data === 'Email not found') {
        setError(
          <>
            Email not found.{' '}
            <Link to="/register" className="register-link">
              Register?
            </Link>
          </>
        );
      } else if (error.response && error.response.data === 'Invalid password') {
        setError('Invalid password. Please try again.');
      } else {
        setError('An error occurred. Please try again.');
      }
    }
  }

  return (
    <div className="App">
      <div className="login-container">
        <div className="title">
          <img src="/logo192.png" alt="Logo" className="logo-image" />
          <span className="title-text">ermes</span>
        </div>
        <form onSubmit={handleSubmit}>
          {/* Input for Email */}
          <input
            type="email"
            placeholder="Enter email"
            className="input-field"
            value={email}
            onChange={(e) => setEmail(e.target.value)} // Update email state
          />
          {/* Input for Password */}
          <input
            type="password"
            placeholder="Enter password"
            className="input-field"
            value={password}
            onChange={(e) => setPassword(e.target.value)} // Update password state
          />
          <div className="checkbox-container">
            <input
              type="checkbox"
              id="rememberMe"
              checked={rememberMe}
              onChange={() => setRememberMe(!rememberMe)}
            />
            <label htmlFor="rememberMe">Remember Me</label>
          </div>

          {/* Error Message */}
          {errorMessage && <div className="error-message">{errorMessage}</div>}

          {/* Submit Button */}
          <button type="submit" className="login-button">
            Login
          </button>
        </form>

        {/* Register Button */}
        <p className="register-prompt">
          Don't have an account?{" "}
          <Link to="/register" className="register-link">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;