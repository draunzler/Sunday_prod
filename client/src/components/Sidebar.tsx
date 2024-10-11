import React, { useState, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { useNavigate, useParams } from 'react-router-dom';
import chatStore from '../stores/ChatStore';
import styles from "../styles/sidebar.module.scss";

interface SidebarProps {
  isCollapsed: boolean;
}

const Sidebar: React.FC<SidebarProps> = observer(({ isCollapsed }) => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>(); // Get the ID from URL params
  const [isMobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    const userId = localStorage.getItem('user_id');
    chatStore.loadChats(userId!);
  }, []);

  const handleContinue = (chatId: string) => {
    navigate(`/chat/${chatId}`);
    // Close the sidebar on mobile when a chat is clicked
    if (isMobileSidebarOpen) {
      toggleMobileSidebar();
    }
  };

  const toggleMobileSidebar = () => {
    setMobileSidebarOpen((prev) => !prev);
  };

  return (
    <>
      <button className={styles.mobileMenuButton} onClick={toggleMobileSidebar}>
        ☰
      </button>

      <div className={`${styles.sidebar} ${isCollapsed ? styles.collapsed : ''} ${isMobileSidebarOpen ? styles.openMobile : ''}`}>
        <div className={styles.sidebarHeader} onClick={() => navigate('/')}>
          <img src="/sunday_dark.svg" alt="" />
          <h1>Sunday</h1>
        </div>
        <ul className={styles.menuList}>
          <li className={styles.menuItem}>
            {chatStore.chats.length > 0 ? (
              <ul className={styles.chatList}>
                {chatStore.chats.map((chat) => (
                  <li
                    key={chat._id}
                    className={`${styles.chatItem} ${id === chat._id ? styles.activeChat : ''}`}
                  >
                    <button
                      onClick={() => handleContinue(chat._id)}
                      title={chat.message_name || 'Unnamed Chat'}
                    >
                      {chat.message_name || 'Unnamed Chat'}
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No chats available.</p>
            )}
          </li>
        </ul>
      </div>

      {isMobileSidebarOpen && <div className={styles.overlay} onClick={toggleMobileSidebar} />}
    </>
  );
});

export default Sidebar;