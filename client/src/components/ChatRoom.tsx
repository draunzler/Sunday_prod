import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import chatStore from '../stores/ChatStore';
import { observer } from 'mobx-react-lite';
import { IChat } from '../interfaces/IChat';
import ReactMarkdown from 'react-markdown';

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

  const handleSendPrompt = async () => {
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
    <div style={{height: "calc(100vh - 40px)", display: "flex", flexDirection: "column", alignItems: "center"}}>
      <h1>{chatMessages?.name}</h1>
      <div style={{flex: 1, overflowY: "auto", width: "100%"}}>
        {chatMessages?.messages.map((msg, index) => (
          <div key={index} style={{width: "50rem", margin: "auto", display: "flex", flexDirection: "column", gap: "1rem"}}>
            <div style={{alignSelf: "flex-end", background: "#313131", padding: "1rem", borderRadius: "25px"}}> {msg.prompt} </div>
            <div> <ReactMarkdown>{msg.response}</ReactMarkdown> </div>
            <em>
              {msg.timestamp}
            </em>
          </div>
        ))}
      </div>
      <div style={{width: "50rem", margin: "auto", display: "flex"}}>
        <input
        style={{flex: 1}}
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="Ask Sunday"
        />
        <button onClick={handleSendPrompt}>Send</button>
      </div>
    </div>
  );
});

export default ChatRoom;