import { makeAutoObservable } from 'mobx';
import { IUser } from '../interfaces/IUser';
import { login, signup, fetchUser } from '../services/AuthService';

class UserStore {
  user: IUser | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  async login(email: string, password: string) {
    try {
      const userData = await login(email, password);
      
      if (userData && userData.user_id) {
        sessionStorage.setItem('user_id', userData.user_id);
      }
      
      this.user = userData;
      return userData;
    } catch (error) {
      console.error("Login failed", error);
      throw error;
    }
  }

  async signup(name: string, email: string, password: string) {
    try {
      const userData = await signup(name, email, password);
      
      if (userData && userData.user_id) {
        sessionStorage.setItem('user_id', userData.user_id);
      }
      
      this.user = userData;
      return userData;
    } catch (error) {
      console.error("Login failed", error);
      throw error;
    }
  }

  logout() {
    this.user = null;
    sessionStorage.removeItem('user_id');
  }

  async loadDetails(userId: string) {
    try {
      if (!userId) {
        throw new Error("User ID not found in sessionStorage");
      }
      const userData = await fetchUser(userId);
      this.user = userData;
      return this.user;
    } catch (error) {
      console.error("Failed to load chats", error);
    }
  }
}

export default new UserStore();