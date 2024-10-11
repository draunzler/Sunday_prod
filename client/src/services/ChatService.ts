import axios from 'axios';
import { IUser } from '../interfaces/IUser';
import { IChat } from '../interfaces/IChat';
import { messageResponse } from '../interfaces/messageResponse';

const LOCALHOST_URL = import.meta.env.VITE_DEPLOYED_URL;

export const fetchChats = async (userId: string): Promise<IUser> => {
  const response = await axios.get(`${LOCALHOST_URL}/api/users/get/${userId}`);
  return response.data;
};

export const fetchChatById = async (userId: string, chatId: string, page: number, limit: number): Promise<IChat> => {
  const requestBody = {
    user_id: userId,
    message_id: chatId,
    page: page,
    limit: limit
  };
  console.log("request body => ", requestBody)
  const response = await axios.post(`${LOCALHOST_URL}/api/messages/get`, requestBody);
  return response.data;
};

export const deleteChatById = async (chatId: string, userId: string,): Promise<{message: string}> => {
  const response = await axios.delete(`${LOCALHOST_URL}/api/messages/delete/${chatId}?user_id=${userId}`);
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