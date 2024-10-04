import React, { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import chatStore from '../stores/ChatStore';
import userStore from '../stores/UserStore';
import { useNavigate } from 'react-router-dom';
import CreateChat from './CreateChat';
import Modal from './Modal';

const ChatDashboard: React.FC = observer(() => {
  const navigate = useNavigate();
  const userId = sessionStorage.getItem('user_id');
  const [showDropdown, setShowDropdown] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    chatStore.loadChats(userId!);
    userStore.loadDetails(userId!);
  }, []);

  const handleProfileClick = () => {
    setShowDropdown(!showDropdown);
  };

  const handleContinue = async (chatId: string) => {
    if (userId) {
      try {
        await chatStore.fetchChat(chatId, userId);
        navigate(`/chat/${chatId}`);
      } catch (error) {
        console.error("Failed to continue to chat", error);
      }
    }
  };

  const handleLogout = () => {
    userStore.logout();
    navigate('/login');
  };

  return (
    <div style={{height: "calc(100vh - 40px)" ,width: "98vw", marginLeft: "0.5rem", display: "flex", flexDirection: "column", alignItems: "center"}}>
      <header style={{ display: "flex", justifyContent: "space-between", padding: "1rem", width: "100%" }}>
        <h1>Welcome, {userStore.user?.name} </h1>
        <div style={{ position: "relative" }}>
          <img
            src="https://via.placeholder.com/40"
            alt="Profile"
            style={{ borderRadius: "50%", cursor: "pointer" }}
            onClick={handleProfileClick}
          />
          {showDropdown && (
            <div style={{
              position: "absolute",
              right: 0,
              top: "35%",
              borderRadius: "10px",
              backgroundColor: "grey",
              boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.1)",
              padding: "1rem",
              zIndex: 1
            }}>
              <strong>{userStore.user?.name}</strong> <br />
              <span>{userStore.user?.email}</span>
              <button onClick={handleLogout}>Log Out</button>
            </div>
          )}
        </div>
      </header>
      <button style={{display: "block", margin: "auto"}} onClick={() => setIsModalOpen(true)}>Create New Message</button>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <CreateChat isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      </Modal>
      <h1>Chats</h1>
      <table style={{width: "100%"}}>
        <thead>
          <tr>
            <th>Message</th>
            <th>Created At</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {chatStore.chats.map((chat) => (
            <tr key={chat._id}>
              <td>{chat.message_name}</td>
              <td style={{textAlign: "center"}}>
              {new Date(chat.created).toLocaleString('en-US', {
                year: 'numeric',
                month: 'short',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                hour12: false,
              })}
              </td>
              <td>
                <button style={{display: "block", margin: "auto"}} onClick={() => handleContinue(chat._id)}>
                  Continue
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
});

export default ChatDashboard;