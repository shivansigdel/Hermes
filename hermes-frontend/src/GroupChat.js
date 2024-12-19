// GroupChat.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './App.css';

function GroupChat() {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/dashboard');
  };

  // Dummy group members
  const groupMembers = [
    { name: 'Zeus' },
    { name: 'Hera' },
    { name: 'Poseidon' },
    { name: 'Athena' },
    // Add more members as needed
  ];

  // Dummy messages
  const messages = [
    { sender: 'Zeus', text: 'Welcome to Mt. Olympus!' },
    { sender: 'Athena', text: 'Glad to be here.' },
    { sender: 'Poseidon', text: 'The sea is calm today.' },
    { sender: 'Hera', text: 'Let’s discuss our next move.' },
    // Add more messages as needed
  ];

  return (
    <div className="groupchat">
      {/* Header */}
      <header className="groupchat-header">
        <button className="back-button" onClick={handleBack}>
          ← Back
        </button>
        <div className="group-title">
          <h2>Mt. Olympus</h2>
        </div>
      </header>

      {/* Group Members */}
      <div className="group-members">
        {groupMembers.map((member, index) => (
          <div className="member" key={index}>
            <div className="profile-picture">{/* Placeholder circle */}</div>
            <span>{member.name}</span>
          </div>
        ))}
      </div>

      {/* Chat Area */}
      <div className="groupchat-area">
        <div className="groupchat-messages">
          {messages.map((message, index) => (
            <div className="group-message" key={index}>
              <strong>{message.sender}:</strong>
              <p>{message.text}</p>
            </div>
          ))}
        </div>

        {/* Message Input */}
        <div className="group-message-input">
          <input type="text" placeholder="Type a message..." />
          <button className="send-button">Send</button>
        </div>
      </div>
    </div>
  );
}

export default GroupChat;