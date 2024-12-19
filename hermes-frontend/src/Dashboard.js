// Dashboard.js
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import './App.css'; // or './Dashboard.css' if you have a separate CSS file
import axios from 'axios';
import { io } from 'socket.io-client';
import { getAuthToken, getUserData, clearAuthData } from './auth'; // Adjust the path as necessary

function Dashboard() {
  const navigate = useNavigate();
  const [threads, setThreads] = useState([]);
  const [selectedThread, setSelectedThread] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [showCreateThreadModal, setShowCreateThreadModal] = useState(false);
  const [threadEmail, setThreadEmail] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const messagesEndRef = useRef(null);
  const [socket, setSocket] = useState(null);

  // New state variables for group chat creation
  const [isGroupChat, setIsGroupChat] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [groupParticipants, setGroupParticipants] = useState('');

  // State variable for focus mode
  const [focusMode, setFocusMode] = useState(false);

  // Navigate to account page
  const handleAccountPage = () => {
    navigate('/account');
  };

  // Handle user logout
  const handleLogout = () => {
    clearAuthData(); // Clear user data
    navigate('/login'); // Redirect to login page
  };

  // Fetch chat threads from the server
  const fetchThreads = async () => {
    try {
      const token = getAuthToken();
      const response = await axios.get('/api/threads', {
        headers: { 'auth-token': token },
      });
      setThreads(response.data);
    } catch (error) {
      console.error('Failed to fetch threads', error);
    }
  };

  // Fetch chat threads on component mount
  useEffect(() => {
    fetchThreads();
  }, []);

  // Initialize Socket.IO client
  useEffect(() => {
    const newSocket = io('http://localhost:5001', {
      withCredentials: true,
      transports: ['websocket'], // Force WebSocket
    });

    newSocket.on('connect', () => {
      console.log('Connected to Socket.IO server');
      const { userId } = getUserData();
      newSocket.emit('join_user', userId);
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket.IO connection error:', error);
    });

    setSocket(newSocket);

    return () => {
      if (newSocket) {
        newSocket.disconnect();
        console.log('Socket disconnected');
      }
    };
  }, []);

  // Handle global Socket.IO events
  useEffect(() => {
    if (socket) {
      const handleGlobalMessage = (message) => {
        console.log('Received global message via Socket.IO:', message);

        // Update threads list to include new message
        fetchThreads();

        // If the message is for the currently selected thread, update messages
        if (selectedThread && selectedThread._id === message.thread) {
          setMessages((prevMessages) => {
            // Check if the message already exists
            if (!prevMessages.some((msg) => msg._id === message._id)) {
              // Replace temporary message if exists
              const tempMessageIndex = prevMessages.findIndex(
                (msg) =>
                  msg._id.startsWith('temp-') && msg.content === message.content
              );

              if (tempMessageIndex !== -1) {
                const updatedMessages = [...prevMessages];
                updatedMessages[tempMessageIndex] = message;
                return updatedMessages;
              } else {
                return [...prevMessages, message];
              }
            }
            return prevMessages;
          });
        }
      };

      const handleUpdateThreads = () => {
        console.log('Received update_threads event via Socket.IO');
        fetchThreads();
      };

      socket.on('receive_message_global', handleGlobalMessage);
      socket.on('update_threads', handleUpdateThreads);

      // Clean up event listeners on unmount
      return () => {
        socket.off('receive_message_global', handleGlobalMessage);
        socket.off('update_threads', handleUpdateThreads);
      };
    }
  }, [socket, selectedThread]);

  // Fetch messages for the selected thread
  const fetchMessages = useCallback(async () => {
    if (!selectedThread) {
      return;
    }
    try {
      const token = getAuthToken();
      const response = await axios.get(
        `/api/threads/${selectedThread._id}/messages`,
        {
          headers: { 'auth-token': token },
        }
      );
      setMessages(response.data);
    } catch (err) {
      console.error('Error fetching messages:', err);
    }
  }, [selectedThread]);

  // Join the thread room when a thread is selected
  useEffect(() => {
    if (socket && selectedThread) {
      socket.emit('join_thread', selectedThread._id);
      console.log(`Joined thread ${selectedThread._id}`);

      // Fetch messages for the selected thread
      fetchMessages();

      const handleThreadMessage = (message) => {
        console.log('Received message via Socket.IO:', message);

        setMessages((prevMessages) => {
          // Check if the message is already in the list
          if (!prevMessages.some((msg) => msg._id === message._id)) {
            // Replace temporary message if exists
            const tempMessageIndex = prevMessages.findIndex(
              (msg) =>
                msg._id.startsWith('temp-') && msg.content === message.content
            );

            if (tempMessageIndex !== -1) {
              const updatedMessages = [...prevMessages];
              updatedMessages[tempMessageIndex] = message;
              return updatedMessages;
            } else {
              return [...prevMessages, message];
            }
          }
          return prevMessages;
        });
      };

      // Listen for incoming messages in the thread room
      socket.on('receive_message', handleThreadMessage);

      // Cleanup listener when component unmounts or selectedThread changes
      return () => {
        socket.emit('leave_thread', selectedThread._id);
        socket.off('receive_message', handleThreadMessage);
        console.log(`Left thread ${selectedThread._id}`);
      };
    }
  }, [socket, selectedThread, fetchMessages]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Handle sending a message
  const [isSending, setIsSending] = useState(false);

  const handleSendMessage = async () => {
    if (!newMessage || isSending) {
      return;
    }
    setIsSending(true);
    try {
      const token = getAuthToken();
      const { userId, username, discriminator, profilePicture } = getUserData();

      // Create a temporary message object
      const tempMessage = {
        _id: 'temp-' + Date.now(), // Temporary ID
        sender: {
          _id: userId,
          username: username,
          discriminator: discriminator,
          profilePicture: profilePicture || null, // If stored
        },
        content: newMessage,
        timestamp: new Date().toISOString(),
      };

      // Add the temporary message to the messages state
      setMessages((prevMessages) => [...prevMessages, tempMessage]);

      // Clear the input field
      const messageToSend = newMessage;
      setNewMessage('');

      // Send the message to the server
      await axios.post(
        `/api/threads/${selectedThread._id}/messages`,
        { content: messageToSend },
        { headers: { 'auth-token': token } }
      );

      setIsSending(false);

      // The message will be updated via Socket.IO
    } catch (err) {
      console.error('Error sending message:', err);
      setIsSending(false);
      // Remove the temporary message
      setMessages((prevMessages) =>
        prevMessages.filter((msg) => !msg._id.startsWith('temp-'))
      );
      alert('Failed to send message. Please try again.');
    }
  };

  // Handle chat item click
  const handleChatClick = async (chat) => {
    // If the same thread is clicked again, toggle focus mode
    if (selectedThread && selectedThread._id === chat._id) {
      setFocusMode(true); // Enter focus mode
    } else {
      setSelectedThread(chat);
      setMessages([]); // Clear messages when switching threads
    }

    // Reset unread messages count
    try {
      const token = getAuthToken();
      await axios.post(
        `/api/threads/${chat._id}/reset-unread`,
        {},
        { headers: { 'auth-token': token } }
      );

      // Update threads list to reflect changes
      fetchThreads();
    } catch (err) {
      console.error('Error resetting unread messages:', err);
    }
  };

  // Exit focus mode
  const handleExitFocusMode = () => {
    setFocusMode(false);
  };

  // Handle creating a new thread
  const handleCreateThread = () => {
    setShowCreateThreadModal(true);
    setErrorMessage('');
    setThreadEmail('');
    setIsGroupChat(false);
    setGroupName('');
    setGroupParticipants('');
  };

  // Close the create thread modal
  const handleCloseModal = () => {
    setShowCreateThreadModal(false);
    setErrorMessage('');
    setThreadEmail('');
    setGroupName('');
    setGroupParticipants('');
    setIsGroupChat(false);
  };

  // Handle submitting the new thread form
  const handleSubmitThread = async (e) => {
    e.preventDefault();

    try {
      const token = getAuthToken();

      let response;

      if (isGroupChat) {
        // Validate inputs for group chat
        if (!groupName || !groupParticipants) {
          setErrorMessage('Please enter a group name and participants.');
          return;
        }

        const participantsArray = groupParticipants
          .split(',')
          .map((item) => item.trim())
          .filter((item) => item.length > 0);

        // Remove current user from participants if included
        const currentUserIdentifier = `${getUserData().username}#${getUserData().discriminator}`;
        const filteredParticipants = participantsArray.filter(
          (identifier) =>
            identifier !== currentUserIdentifier &&
            identifier !== getUserData().email
        );

        if (filteredParticipants.length === 0) {
          setErrorMessage('Please add at least one participant other than yourself.');
          return;
        }

        // Create group chat
        response = await axios.post(
          '/api/threads/create-group',
          {
            groupName: groupName.trim(),
            participants: filteredParticipants,
          },
          { headers: { 'auth-token': token } }
        );
      } else {
        // Validate input for individual chat
        if (!threadEmail) {
          setErrorMessage('Please enter an email or username.');
          return;
        }
        if (
          threadEmail === getUserData().userEmail ||
          threadEmail === `${getUserData().username}#${getUserData().discriminator}`
        ) {
          setErrorMessage('You cannot message yourself.');
          return;
        }

        // Create individual chat
        response = await axios.post(
          '/api/threads/create',
          {
            participantIdentifier: threadEmail.trim(),
          },
          { headers: { 'auth-token': token } }
        );
      }

      setThreads([response.data, ...threads]); // Add new thread to the top of the list
      setShowCreateThreadModal(false);
      setThreadEmail('');
      setGroupName('');
      setGroupParticipants('');
      setErrorMessage('');
    } catch (err) {
      console.error('Error creating thread:', err);
      if (err.response && err.response.data) {
        setErrorMessage(err.response.data);
      } else {
        setErrorMessage('An error occurred. Please try again.');
      }
    }
  };

  // Function to determine if the message sender has changed
  const isNewSender = (currentIndex) => {
    if (currentIndex === 0) return true;
    return messages[currentIndex].sender._id !== messages[currentIndex - 1].sender._id;
  };

  return (
    <div className={`dashboard ${focusMode ? 'focus-mode' : ''}`}>
      {/* Header */}
      <header className="dashboard-header">
        <div className="logo-title">
          <img src="/logo192.png" alt="Logo" className="dashboard-logo" />
          <span className="dashboard-title">Hermes</span>
        </div>
        <div className="header-buttons">
          {/* Show back button in focus mode */}
          {focusMode && (
            <button className="home-button" onClick={handleExitFocusMode}>
              Home
            </button>
          )}
          <button className="account-button" onClick={handleAccountPage}>
            Account
          </button>
          <button className="logout-button" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="dashboard-main">
        {/* Sidebar (hidden in focus mode) */}
        {!focusMode && (
          <aside className="sidebar">
            <div className="sidebar-header">
              <h2>Chats</h2>
              <button className="create-thread-button" onClick={handleCreateThread}>
                + New Chat
              </button>
            </div>
            <ul className="chat-list">
              {threads.map((thread) => {
                const { userId } = getUserData();
                const unreadCount = thread.unreadMessages?.[userId] || 0;

                let chatItemContent;

                if (!thread.isGroupChat) {
                  // Individual chat logic
                  // Get the other participant (excluding the current user)
                  const otherParticipant = thread.participants.find(
                    (p) => p._id !== userId
                  );

                  chatItemContent = (
                    <div className="chat-item-content">
                      <img
                        src={
                          otherParticipant.profilePicture
                            ? `/${otherParticipant.profilePicture.replace(/\\/g, '/')}`
                            : '/images/default-avatar.png'
                        }
                        alt="Profile"
                        className="chat-item-profile-picture"
                      />
                      <div className="chat-item-text">
                        {otherParticipant.username}#{otherParticipant.discriminator}
                      </div>
                    </div>
                  );
                } else {
                  // Group chat logic
                  // Determine the number of participants to display
                  const participantCount = Math.min(thread.participants.length, 5);

                  chatItemContent = (
                    <div className="chat-item-content">
                      <div className="group-avatar">
                        {thread.participants.slice(0, 5).map((participant, index) => (
                          <img
                            key={participant._id}
                            src={
                              participant.profilePicture
                                ? `/${participant.profilePicture.replace(/\\/g, '/')}`
                                : '/images/default-avatar.png'
                            }
                            alt="Profile"
                            className={`group-avatar-image group-avatar-image-${participantCount}-${index}`}
                          />
                        ))}
                      </div>
                      <div className="chat-item-text">{thread.groupName}</div>
                    </div>
                  );
                }

                return (
                  <li
                    key={thread._id}
                    className={`chat-item ${
                      selectedThread && selectedThread._id === thread._id ? 'selected' : ''
                    }`}
                    onClick={() => handleChatClick(thread)}
                  >
                    {chatItemContent}
                    {unreadCount > 0 && (
                      <div className="unread-badge">{unreadCount}</div>
                    )}
                  </li>
                );
              })}
            </ul>
          </aside>
        )}

        {/* Chat Area */}
        <section className="chat-area">
          {selectedThread ? (
            <>
              <div className="chat-messages">
                {messages.map((message, index) => {
                  const isSentByCurrentUser = message.sender._id === getUserData().userId;
                  const showSenderName =
                    !isSentByCurrentUser &&
                    selectedThread.isGroupChat &&
                    isNewSender(index);

                  // Format the timestamp
                  const messageTime =
                    '\u00A0' +
                    new Date(message.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    }) +
                    '\u00A0';

                  return (
                    <div
                      key={message._id}
                      className={`message-wrapper ${
                        isSentByCurrentUser ? 'sent' : 'received'
                      }`}
                    >
                      {showSenderName && (
                        <div className="sender-info">
                          {message.sender.profilePicture && (
                            <img
                              src={`/${message.sender.profilePicture.replace(/\\/g, '/')}`}
                              alt="Profile"
                              className="sender-profile-picture"
                            />
                          )}
                          <span className="sender-name">
                            {message.sender.username}#{message.sender.discriminator}
                          </span>
                        </div>
                      )}
                      <div className="message">
                        <p>{message.content}</p>
                        <span className="timestamp">{messageTime}</span>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="message-input">
                <input
                  type="text"
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault(); // Prevent newline in the input
                      handleSendMessage();
                    }
                  }}
                />
                <button
                  className="send-button"
                  onClick={handleSendMessage}
                  disabled={isSending}
                >
                  Send
                </button>
              </div>
            </>
          ) : (
            <div className="chat-area-placeholder">
              <p>Select a chat or start a new conversation.</p>
            </div>
          )}
        </section>
      </div>

      {/* Create Thread Modal */}
      {showCreateThreadModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Create New Chat</h2>
            <form onSubmit={handleSubmitThread}>
              <label>
                <input
                  type="checkbox"
                  checked={isGroupChat}
                  onChange={(e) => setIsGroupChat(e.target.checked)}
                />
                {' '}Create a Group Chat
              </label>

              {isGroupChat ? (
                <>
                  <input
                    type="text"
                    placeholder="Group Name"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    className="input-field"
                  />
                  <textarea
                    placeholder="Enter participant emails or usernames (separated by commas)"
                    value={groupParticipants}
                    onChange={(e) => setGroupParticipants(e.target.value)}
                    className="input-field"
                  />
                </>
              ) : (
                <input
                  type="text"
                  placeholder="Enter user's email or username#discriminator"
                  value={threadEmail}
                  onChange={(e) => setThreadEmail(e.target.value)}
                  className="input-field"
                />
              )}

              {errorMessage && <div className="error-message">{errorMessage}</div>}
              <div className="modal-buttons">
                <button type="submit" className="create-button">
                  Create
                </button>
                <button
                  type="button"
                  className="cancel-button"
                  onClick={handleCloseModal}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;