import { makeAutoObservable } from 'mobx';
import { IMessage } from '../interfaces/IUser';
import { IChat } from '../interfaces/IChat';
import { fetchChats, fetchChatById, sendChatPrompt, createChat } from '../services/ChatService';

class ChatStore {
  chats: IMessage[] = [];
  selectedChat: IChat | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  async loadChats(userId: string) {
    try {
      if (!userId) {
        throw new Error("User ID not found in sessionStorage");
      }
      const chatsData = await fetchChats(userId);
      this.chats = chatsData.messages;
      return this.chats;
    } catch (error) {
      console.error("Failed to load chats", error);
    }
  }

  async fetchChat(chatId: string, userId: string) {
    try {
      const chatData = await fetchChatById(userId, chatId);
      this.selectedChat = chatData;
      return chatData;
    } catch (error) {
      console.error("Failed to fetch chat", error);
      throw error;
    }
  }

  async sendPrompt(userId: string, messageId: string, prompt: string) {
    try {
      const response = await sendChatPrompt(userId, messageId, prompt);
      console.log(response);
      return response;
    } catch (error) {
      console.error('Error sending prompt:', error);
      throw error;
    }
  }

  async createChat(userId: string, chatName: string) {
    try {
      const response = await createChat(userId, chatName);
      console.log(response);
      return response;
    } catch (error) {
      console.error('Error sending prompt:', error);
      throw error;
    }
  }
}

export default new ChatStore();