import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import chatStore from '../stores/ChatStore';
import { observer } from 'mobx-react-lite';
import { IChat } from '../interfaces/IChat';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { materialDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import styles from "../styles/chatRoom.module.scss";
import Sidebar from './Sidebar';

const customStyle = {
  ...materialDark,
  'pre[class*="language-"]': {
    ...materialDark['pre[class*="language-"]'],
    backgroundColor: '#000000',
  },
  'code[class*="language-"]': {
    ...materialDark['code[class*="language-"]'],
    backgroundColor: '#000000',
  },
};

const ChatRoom: React.FC = observer(() => {
  const { id } = useParams<{ id: string }>();
  const [chatMessages, setChatMessages] = useState<IChat | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const maxRows = 10;
  const rowHeight = 24;
  const limit = 10;
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  useEffect(() => {
    const fetchChatMessages = async () => {
      setIsLoading(true);
      const chat = await chatStore.fetchChat(id!, sessionStorage.getItem('user_id')!, page, limit);
      setChatMessages(chat);
      setIsLoading(false);
    };
    setIsSidebarCollapsed(true);
    fetchChatMessages();
  }, [id]);

  useEffect(() => {
    if (chatMessages && chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const handleScroll = async () => {
    if (chatContainerRef.current && chatContainerRef.current.scrollTop === 0 && !isLoading) {
      setIsLoading(true);
      const newPage = page + 1;
      const previousMessages = await chatStore.fetchChat(id!, sessionStorage.getItem('user_id')!, newPage, limit);

      if (previousMessages && previousMessages.messages.length > 0) {
        setChatMessages(prev => ({
          ...prev!,
          messages: [...previousMessages.messages, ...prev!.messages],
        }));
        setPage(newPage);
      }

      setIsLoading(false);
    }
  };

  const handleSendPrompt = async (event: React.FormEvent) => {
    event.preventDefault();

    const userId = sessionStorage.getItem('user_id')!;
    const messageId = id!;
    const userInput = textareaRef.current?.value;

    if (textareaRef.current) {
      textareaRef.current.style.height = "46px"; 
    }

    if (!userInput) return;

    textareaRef.current.value = '';

    try {
      const aiResponse = await chatStore.sendPrompt(userId, messageId, userInput);

      const newMessage = {
        prompt: userInput,
        response: aiResponse.bot,
        timestamp: new Date().toISOString(),
      };

      setChatMessages(prev => {
        if (prev) {
          return {
            ...prev,
            messages: [...prev.messages, newMessage],
          };
        }
        return prev;
      });

      if (chatContainerRef.current) {
        chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
      }

    } catch (error) {
      console.error('Error sending prompt:', error);
      alert(error);
    }
  };

  const CodeBlock = ({ node, inline, className, children, ...props }: any) => {
    const match = /language-(\w+)/.exec(className || '');
    const language = match ? match[1] : '';
  
    return !inline && match ? (
      <div>
        <div style={{ padding: "0.5rem 0", paddingLeft: '1rem', background: '#2f2f2f', color: '#d9d9d980' }}>{language}</div>
        <SyntaxHighlighter style={customStyle} language={language} PreTag="div" {...props}>
          {String(children).replace(/\n$/, '')}
        </SyntaxHighlighter>
      </div>
    ) : (
      <code {...props}>{children}</code>
    );
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendPrompt(event);
    }
  };

  const handleTextareaResize = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = 'auto';

    const scrollHeight = textarea.scrollHeight;
    const maxHeight = rowHeight * maxRows;

    textarea.style.height = `${Math.min(scrollHeight, maxHeight)}px`;
  };

  return (
    <div style={{display: "grid", gridTemplateColumns: "2fr 10fr"}}>
      <Sidebar isCollapsed={isSidebarCollapsed} />
      <div className={styles.chatRoomContainer}>
        <h1>{chatMessages?.name}</h1>
        <div 
          className={styles.chatContainer} 
          ref={chatContainerRef}
          onScroll={handleScroll}
        >
          {chatMessages?.messages.map((msg, index) => (
            <div key={index} className={styles.chat}>
              <div className={styles.prompt}> {msg.prompt} </div>
              <div className={styles.response}> 
                <ReactMarkdown 
                  components={{
                    code: CodeBlock,
                  }} 
                >
                  {msg.response}
                </ReactMarkdown>
              </div>
              <em>
                {
                  (() => {
                    const chatDate = new Date(msg.timestamp);
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
              </em>
            </div>
          ))}
        </div>
        <form onSubmit={handleSendPrompt} className={styles.formContainer}>
          <textarea
            ref={textareaRef}
            style={{ flex: 1 }}
            placeholder="Ask Sunday"
            rows={1}
            onKeyDown={handleKeyDown}
            onInput={handleTextareaResize}
          />
          <button type='submit'>
            <img src="/send.svg" alt="" />
          </button>
        </form>
      </div>
    </div>
    
  );
});

export default ChatRoom;