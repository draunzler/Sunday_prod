import axios from 'axios';
import { IUser } from '../interfaces/IUser';
import { IChat } from '../interfaces/IChat';
import { messageResponse } from '../interfaces/messageResponse';

const LOCALHOST_URL = import.meta.env.VITE_DEPLOYED_URL;

export const fetchChats = async (userId: string): Promise<IUser> => {
  const response = await axios.get(`${LOCALHOST_URL}/api/users/get/${userId}`);
  return response.data;
};

export const fetchChatById = async (userId: string, chatId: string): Promise<IChat> => {
  const response = await axios.get(`${LOCALHOST_URL}/api/messages/get`, {
    params: {
      user_id: userId,
      message_id: chatId,
    },
  });
  return response.data;
};

export const sendChatPrompt = async (userId: string, messageId: string, prompt: string) => {
  const requestBody = {
    user_id: userId,
    message_id: messageId,
    prompt: prompt,
    model: "gemini-1.5-flash"
  };

  const response = await fetch(`${LOCALHOST_URL}/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    throw new Error('Failed to send prompt: ' + response.statusText);
  }

  const data = await response.json();
  return data;
};

export const createChat = async (userId: string, chatName: string): Promise<messageResponse> => {
  const response = await axios.post(`${LOCALHOST_URL}/api/messages/create`,
    {
      user_id: userId,
      name: chatName,
    },
  );
  return response.data;
};