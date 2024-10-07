import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import chatStore from '../stores/ChatStore';
import { observer } from 'mobx-react-lite';
import { IChat } from '../interfaces/IChat';
import ReactMarkdown from 'react-markdown';
import styles from "../styles/chatRoom.module.scss";

const ChatRoom: React.FC = observer(() => {
  const { id } = useParams<{ id: string }>();
  const [userInput, setUserInput] = useState<string>('');
  const [chatMessages, setChatMessages] = useState<IChat | null>(null);

  useEffect(() => {
    const fetchChatMessages = async () => {
      const chat = await chatStore.fetchChat(id!, sessionStorage.getItem('user_id')!);
      console.log(chat)
      setChatMessages(chat);
    };

    fetchChatMessages();
  }, [id]);

  const handleSendPrompt = async (event: React.FormEvent) => {
    event.preventDefault();

    const userId = sessionStorage.getItem('user_id')!;
    const messageId = id!;

    try {
      const aiResponse = await chatStore.sendPrompt(userId, messageId, userInput);
      console.log("chat data => ", aiResponse)

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

      setUserInput('');
    } catch (error) {
      console.error('Error sending prompt:', error);
      alert(error)
    }
  };

  return (
    <div className={styles.chatRoomContainer}>
      <h1>{chatMessages?.name}</h1>
      <div className={styles.chatContainer}>
        {chatMessages?.messages.map((msg, index) => (
          <div key={index} className={styles.chat}>
            <div className={styles.prompt}> {msg.prompt} </div>
            <div className={styles.response}> <ReactMarkdown>{msg.response}</ReactMarkdown> </div>
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
        <input
          style={{flex: 1}}
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="Ask Sunday"
        />
        <button type='submit'>
          <img src="/send.svg" alt="" />
        </button>
      </form>
    </div>
  );
});

export default ChatRoom;