import React, { useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from './screens/LoginScreen';
import HomeScreen from './screens/HomeScreen';
import { initUser } from './utils/storage';
import InsertNoteScreen from './screens/InsertNoteScreen'; 
import EditNoteScreen from './screens/EditNoteScreen';
import DetailNoteScreen from './screens/DetailNoteScreen';
import SettingsScreen from './screens/SettingsScreen';
import { ThemeProvider } from './ThemeContext';
import ArchiveScreen from './screens/ArchiveScreen';
import { RootStackParamList } from './types'; 
import LockNoteScreen from './screens/LockNoteScreen';
import { NavigationContainer } from '@react-navigation/native';
import PasswordScreen from './screens/PasswordScreen';
import RegisterScreen from './screens/RegisterScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  useEffect(() => {
    const initializeUser = async () => {
      await initUser(); // Khởi tạo tài khoản mẫu
    };

    initializeUser();
  }, []);  // Chỉ chạy một lần khi component được mount

  return (
    <ThemeProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Login">
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }}/>
          <Stack.Screen name="Register" component={RegisterScreen} options={{ headerShown: false }}/>
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Detail" component={DetailNoteScreen} options={{ title: 'Chi tiết' }}/>
          <Stack.Screen name="Archive" component={ArchiveScreen} options={{ title: 'Ghi chú đã lưu',headerShown: false }} />
          <Stack.Screen name="Insert" component={InsertNoteScreen} options={{ title: 'Thêm ghi chú' }} />
          <Stack.Screen name="Edit" component={EditNoteScreen} />
          <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: 'Cài đặt' }} />
          <Stack.Screen name="LockNote" component={LockNoteScreen} options={{ title: 'Khóa ghi chú' }} />
          <Stack.Screen name="PasswordScreen" component={PasswordScreen} options={{ title: 'Nhập mật khẩu', headerShown: false }}/>
        </Stack.Navigator>
      </NavigationContainer>
    </ThemeProvider>
  );
}
