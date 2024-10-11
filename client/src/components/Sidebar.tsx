import React, { useState, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { useNavigate } from 'react-router-dom';
import chatStore from '../stores/ChatStore';
import styles from "../styles/sidebar.module.scss";

interface SidebarProps {
  isCollapsed: boolean;
}

const Sidebar: React.FC<SidebarProps> = observer(({ isCollapsed }) => {
  const navigate = useNavigate();
  const [showChatsDropdown, setShowChatsDropdown] = useState(false);
  const [isMobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    const userId = sessionStorage.getItem('user_id');
    chatStore.loadChats(userId!);
  }, []);

  const handleContinue = (chatId: string) => {
    navigate(`/chat/${chatId}`);
  };

  const toggleChatsDropdown = () => {
    setShowChatsDropdown((prevState) => !prevState);
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
            <button onClick={() => navigate('/')}>
              Dashboard
            </button>
          </li>

          <li className={styles.menuItem}>
            <button
              className={styles.dropdownToggle}
              onClick={toggleChatsDropdown}
            >
              Chats
              <span className={`${styles.arrow} ${showChatsDropdown ? styles.up : styles.down}`}>
                  ▶
              </span>
            </button>

            {showChatsDropdown && (
              <div className={styles.dropdown}>
                {chatStore.chats.length > 0 ? (
                  <ul className={styles.chatList}>
                    {chatStore.chats.map((chat) => (
                      <li key={chat._id} className={styles.chatItem}>
                        <button onClick={() => handleContinue(chat._id)}
                          title={chat.message_name || 'Unnamed Chat'}>
                          {chat.message_name || 'Unnamed Chat'}
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No chats available.</p>
                )}
              </div>
            )}
          </li>
        </ul>
      </div>

      {isMobileSidebarOpen && <div className={styles.overlay} onClick={toggleMobileSidebar} />}
    </>
  );
});

export default Sidebar;