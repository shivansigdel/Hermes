import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { setAuthData } from "./auth";
import "./App.css";

function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  async function handleSubmit(event) {
    event.preventDefault();
    try {
      const response = await axios.post("/api/user/register", {
        email: email,
        password: password,
        username: username,
      });

      console.log("Registered successfully");
      console.log(response.data);

      const login_response = await axios.post("/api/user/login", {
        email: email,
        password: password,
      });

      // Set auth data; default rememberMe to false (sessionStorage)
      setAuthData(login_response.data.token, login_response.data.user, false);

      console.log('Logged in successfully');

      // Redirect to dashboard
      navigate("/dashboard");
    } catch (error) {
      console.error("Error registering: ", error.response?.data || error);
      if (error.response && error.response.data === "Email already registered.") {
        setErrorMessage(
          <>
            Email already registered.{' '}
            <Link to="/login" className="login-link">
              Log In?
            </Link>
          </>
        );
      } else {
        setErrorMessage(error.response.data || "An error occurred during registration.");
      }
    }
  }

  return (
    <div className="App">
      <div className="register-container">
        <h1 className="title">Register</h1>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Enter username"
            className="input-field"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            type="email"
            placeholder="Enter email"
            className="input-field"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Enter password"
            className="input-field"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {/* Error Message */}
          {errorMessage && <div className="error-message">{errorMessage}</div>}
          <button type="submit" className="register-button">
            Register
          </button>
      </form>
      </div>
    </div>
  );
}

export default Register;