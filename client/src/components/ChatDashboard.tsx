import React, { useEffect, useState, useRef } from 'react';
import { observer } from 'mobx-react-lite';
import chatStore from '../stores/ChatStore';
import userStore from '../stores/UserStore';
import { useNavigate } from 'react-router-dom';
import CreateChat from './CreateChat';
import Modal from './Modal';
import styles from "../styles/chatDashboard.module.scss";

const ChatDashboard: React.FC = observer(() => {
  const navigate = useNavigate();
  const userId = sessionStorage.getItem('user_id');
  const [showDropdown, setShowDropdown] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Ref to store the dropdown element
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatStore.loadChats(userId!);
    userStore.loadDetails(userId!);
  }, []);

  useEffect(() => {
    // Click event listener to detect clicks outside of the dropdown
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false); // Close the dropdown if clicked outside
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    // Cleanup the event listener on component unmount
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

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
    <div className={styles.dashboardContainer}>
      <header>
        <h1>Welcome, {userStore.user?.name} </h1>
        <div style={{ position: "relative" }}>
          <img
            src="https://via.placeholder.com/40"
            alt="Profile"
            style={{ borderRadius: "50%", cursor: "pointer" }}
            onClick={handleProfileClick}
          />
          {showDropdown && (
            <div className={styles.dropdown} ref={dropdownRef}>
              <strong>{userStore.user?.name}</strong> <br />
              <span>{userStore.user?.email}</span>
              <button onClick={handleLogout}>Log Out</button>
            </div>
          )}
        </div>
      </header>
      <div className={styles.createBtn}>
        <button onClick={() => setIsModalOpen(true)}>Create New Chat</button>
      </div>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <CreateChat isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      </Modal>
      <table>
        <thead>
          <tr>
            <th className={styles.firstCol}>Chat name</th>
            <th>Created At</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {chatStore.chats.map((chat) => (
            <tr key={chat._id}>
              <td>{chat.message_name}</td>
              <td style={{ textAlign: "center" }}>
                {
                  (() => {
                    const chatDate = new Date(chat.created);
                    chatDate.setTime(chatDate.getTime() - chatDate.getTimezoneOffset() * 60 * 1000);
                    return chatDate.toLocaleString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: false,
                    });
                  })()
                }
              </td>
              <td>
                <button style={{ display: "block", margin: "auto" }} onClick={() => handleContinue(chat._id)}>
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