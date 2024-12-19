// Account.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Account.css'; // CSS file for the Account page
import { useNavigate } from 'react-router-dom';
import { getAuthToken, clearAuthData } from './auth'; // Import auth functions

function Account() {
  const [userData, setUserData] = useState(null);
  const [profilePicture, setProfilePicture] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = getAuthToken(); // Use getAuthToken from auth.js
        const response = await axios.get('/api/user/me', {
          headers: { 'auth-token': token },
        });
        setUserData(response.data);
      } catch (error) {
        console.error('Error fetching user data:', error);
        alert('Error fetching user data. Please log in again.');
        clearAuthData(); // Clear auth data on error
        navigate('/login');
      }
    };
    fetchUserData();
  }, [navigate]);

  const handleProfilePictureChange = (e) => {
    setProfilePicture(e.target.files[0]);
  };

  const handleProfilePictureUpload = async () => {
    try {
      if (!profilePicture) {
        alert('Please select a file to upload.');
        return;
      }

      const token = getAuthToken();
      const formData = new FormData();
      formData.append('profilePicture', profilePicture);

      await axios.post('/api/user/upload-profile-picture', formData, {
        headers: {
          'auth-token': token,
          'Content-Type': 'multipart/form-data',
        },
      });

      alert('Profile picture uploaded successfully.');
      // Refresh user data to display the new profile picture
      const response = await axios.get('/api/user/me', {
        headers: { 'auth-token': token },
      });
      setUserData(response.data);
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      alert('Error uploading profile picture.');
    }
  };

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  return (
    <div className="account-page">
      <header className="account-header">
        <div className="logo-container">
          <img src="/logo192.png" alt="Logo" className="logo-image" />
          <h1>Your Account</h1>
        </div>
        <button className="back-button" onClick={handleBackToDashboard}>
          Back to Dashboard
        </button>
      </header>
      {userData && (
        <div className="account-card">
          <div className="account-container">
            <div className="profile-section">
              <div className="profile-picture-container">
                {userData.profilePicture ? (
                  <img
                    src={`/${userData.profilePicture.replace(/\\/g, '/')}`}
                    alt="Profile"
                    className="profile-picture"
                  />
                ) : (
                  <div className="placeholder-picture">
                    {/* Placeholder for users without a profile picture */}
                    <span>{userData.username.charAt(0).toUpperCase()}</span>
                  </div>
                )}
              </div>
              <div className="profile-info">
                <h2>
                  {userData.username}#{userData.discriminator}
                </h2>
                <p>{userData.email}</p>
              </div>
            </div>
            <div className="upload-section">
              <h3>Update Profile Picture</h3>
              <input
                type="file"
                accept="image/*"
                onChange={handleProfilePictureChange}
              />
              <button onClick={handleProfilePictureUpload}>Upload</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Account;