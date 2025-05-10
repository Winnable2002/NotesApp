import RNFS from 'react-native-fs';
import { Note } from '../types';

const USER_FILE = `${RNFS.DocumentDirectoryPath}/user.json`;

// Hàm khởi tạo người dùng mẫu nếu chưa tồn tại
export const initUser = async () => {
  const exists = await RNFS.exists(USER_FILE);
  if (!exists) {
    const sampleUser = {
      username: 'quocbinh',
      password: '123456',
    };
    await RNFS.writeFile(USER_FILE, JSON.stringify(sampleUser), 'utf8');
  }
};

// Hàm lấy thông tin người dùng từ file
export const getUser = async () => {
  try {
    const exists = await RNFS.exists(USER_FILE);
    if (exists) {
      const content = await RNFS.readFile(USER_FILE, 'utf8');
      return JSON.parse(content);
    }
    return null;
  } catch (error) {
    console.error('Failed to read user data:', error);
    return null;
  }
};

// Hàm lấy danh sách ghi chú từ file
export const getNotesFromFile = async (): Promise<Note[]> => {
  try {
    const NOTES_FILE_PATH = `${RNFS.DocumentDirectoryPath}/notes.json`;
    const exists = await RNFS.exists(NOTES_FILE_PATH);
    if (!exists) return [];

    const content = await RNFS.readFile(NOTES_FILE_PATH, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    console.error('Failed to read notes:', error);
    return [];
  }
};

// Hàm lưu danh sách ghi chú vào file
export const saveNotesToFile = async (notes: Note[]) => {
  try {
    const NOTES_FILE_PATH = `${RNFS.DocumentDirectoryPath}/notes.json`;
    await RNFS.writeFile(NOTES_FILE_PATH, JSON.stringify(notes, null, 2), 'utf8');
  } catch (error) {
    console.error('Failed to save notes:', error);
  }
}