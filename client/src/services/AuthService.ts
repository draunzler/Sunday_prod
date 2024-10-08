import axios from 'axios';
import { IUser } from '../interfaces/IUser';

const LOCALHOST_URL = import.meta.env.VITE_DEPLOYED_URL;

export const login = async (email: string, password: string) => {
  const response = await axios.post(`${LOCALHOST_URL}/api/users/login`, { email: email, password: password });
  return response.data;
};
export const signup = async (name: string, email: string, password: string) => {
  const response = await axios.post(`${LOCALHOST_URL}/api/users/create`, { name: name, email: email, password: password });
  return response.data;
};
export const fetchUser = async (userId: string): Promise<IUser> => {
  const response = await axios.get(`${LOCALHOST_URL}/api/users/get/${userId}`);
  return response.data;
};