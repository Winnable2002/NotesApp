import AsyncStorage from '@react-native-async-storage/async-storage';

const USER_KEY = 'USER';

export const initUser = async () => {
  const existing = await AsyncStorage.getItem(USER_KEY);
  if (!existing) {
    const user = { username: 'binh', password: '123456' };
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
  }
};

export const getUser = async () => {
  const json = await AsyncStorage.getItem(USER_KEY);
  return json ? JSON.parse(json) : null;
};
