import React, { useEffect, useState, useRef } from 'react';
import { observer } from 'mobx-react-lite';
import chatStore from '../stores/ChatStore';
import userStore from '../stores/UserStore';
import { useNavigate } from 'react-router-dom';
import styles from "../styles/chatDashboard.module.scss";

const ChatDashboard: React.FC = observer(() => {
  const navigate = useNavigate();
  const userId = localStorage.getItem('user_id');
  const [showDropdown, setShowDropdown] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  const dropdownRef = useRef<HTMLDivElement>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5; // Customize this to the number of rows per page you want

  // Calculate total pages
  const totalPages = Math.ceil(chatStore.chats.length / rowsPerPage);

  // Event handlers for pagination
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  // Slicing chats array to get the data for the current page
  const paginatedChats = chatStore.chats
  .slice()
  .reverse()
  .slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  useEffect(() => {
    chatStore.loadChats(userId!);
    userStore.loadDetails(userId!);
    window.addEventListener('resize', () => {
      setWindowWidth(window.innerWidth);
    });
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  const handleProfileClick = () => {
    setShowDropdown(!showDropdown);
  };

  const handleContinue = async (chatId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    if (userId) {
      try {
        await chatStore.fetchChat(chatId, userId, 1, 10);
        setIsSidebarCollapsed(true);
        navigate(`/chat/${chatId}`);
      } catch (error) {
        console.error("Failed to continue to chat", error);
      }
    }
  };

  const handleDelete = async (chatId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    if (userId) {
      try {
        await chatStore.deleteChat(chatId, userId);
        setIsSidebarCollapsed(true);
      } catch (error) {
        console.error("Failed to continue to chat", error);
      } finally {
        chatStore.loadChats(userId!);
      }
    }
  };

  const handleCreate = async () => {
    try {
        const response = await chatStore.createChat(userId!, '');
        if (response.message === "Message created successfully") {
            navigate(`/chat/${response.message_id}`);
        } else {
            alert(response.message);
        }
    } catch (error: any) {
        alert(error);
    }
  };

  const handleLogout = () => {
    userStore.logout();
    navigate('/login');
  };

  return (
    <div className={styles.dashboardContainer}>
      <div className={isSidebarCollapsed ? styles.contentCollapsed : styles.content}>
        <header>
          <div className={styles.logo} onClick={() => navigate('/')}>
            <img src="/sunday_dark.svg" alt="" />
            <h3>Sunday</h3>
          </div>
          <div style={{ position: "relative" }}>
            <img
              src="https://via.placeholder.com/40"
              alt="Profile"
              style={{ borderRadius: "50%", cursor: "pointer" }}
              onClick={handleProfileClick}
            />
            {showDropdown && (
              <div className={styles.dropdown} ref={dropdownRef}>
                <div className={styles.userInfo}>
                  <img
                    src="https://via.placeholder.com/40"
                    alt="Profile"
                    style={{ borderRadius: "50%", cursor: "pointer" }}
                  />
                  <div style={{ marginLeft: "0.5rem" }}>
                    <strong style={{fontSize: "0.875rem"}}>{userStore.user?.name}</strong> <br />
                    <span style={{fontSize: "0.875rem"}}>{userStore.user?.email}</span>
                  </div>
                </div>
                <ul>
                  <li onClick={handleLogout}>
                    <svg width="65" height="74" viewBox="0 0 65 74" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" clipRule="evenodd" d="M16.25 66.117C11.418 66.117 7.5 62.199 7.5 57.367V16.25C7.5 11.418 11.418 7.5 16.25 7.5H33.309C35.3793 7.5 37.059 5.8203 37.059 3.75C37.059 1.6797 35.3793 0 33.309 0H16.25C7.2773 0 0 7.2734 0 16.25V57.367C0 66.3397 7.2773 73.617 16.25 73.617H33.309C35.3793 73.617 37.059 71.9373 37.059 69.867C37.059 67.7967 35.3793 66.117 33.309 66.117H16.25ZM43.949 53.25C45.4138 54.7148 47.7888 54.7148 49.2537 53.25L63.0427 39.461C63.7458 38.7579 64.1404 37.8048 64.1404 36.8087C64.1404 35.8126 63.7459 34.8595 63.0427 34.1564L49.2537 20.3674C47.7889 18.9026 45.4139 18.9026 43.949 20.3674C42.4842 21.8283 42.4842 24.2033 43.949 25.6682L51.3396 33.0588H24.4766C22.4063 33.0588 20.7266 34.7385 20.7266 36.8088C20.7266 38.8791 22.4063 40.5588 24.4766 40.5588H51.3396L43.949 47.9494C42.4842 49.4142 42.4842 51.7851 43.949 53.25Z" fill="#D9D9D9" />
                    </svg>
                    Log Out
                  </li>
                </ul>
              </div>
            )}
          </div>
        </header>
        <div className={styles.createBtn}>
          <div className={styles.createBtnContainer}>
            <span style={{fontSize: "3.5rem", fontWeight: 100}}>+</span>
            <button onClick={handleCreate}>Create New Chat</button>
          </div>
        </div>
        {chatStore.chats.length > 0 && (
          <div className={styles.tableContainer}>
            <table>
              <thead>
                <tr>
                  <th className={styles.firstCol}>Chat name</th>
                  <th style={{ minWidth: windowWidth < 700 ? '10rem' : 'auto' }}>Created At</th>
                  {windowWidth > 1200 && <th>Latest Prompt</th>}
                  <th className={styles.actionsCol}></th>
                </tr>
              </thead>
              <tbody>
                {paginatedChats.map((chat) => (
                  <tr 
                    key={chat._id} 
                    onClick={(event) => handleContinue(chat._id, event)} 
                    style={{ cursor: 'pointer' }}
                    className={styles.chatRow}
                  >
                    <td>{chat.message_name}</td>
                    <td style={{ textAlign: 'center' }}>
                      {(() => {
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
                      })()}
                    </td>
                    {windowWidth > 1200 && (
                      <td
                        style={{
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          maxWidth: '200px',
                        }}
                        title={chat.latest_prompt}
                      >
                        {chat.latest_prompt}
                      </td>
                    )}
                    <td className={styles.actionsCol}>
                      <button
                        className={styles.deleteBtn}
                        onClick={(event) => {
                          event.stopPropagation();
                          handleDelete(chat._id, event);
                        }}
                      >
                        <img src="/delete.svg" alt="Delete" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className={styles.paginationControls}>
              <button onClick={handlePreviousPage} disabled={currentPage === 1}>
                ◄
              </button>
              <span>
                Page {currentPage} of {totalPages}
              </span>
              <button onClick={handleNextPage} disabled={currentPage === totalPages}>
                ►
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

export default ChatDashboard;