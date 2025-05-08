import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
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
import { RootStackParamList } from './types'; // Import đúng loại Param List
import LockNoteScreen from './screens/LockNoteScreen';
import UnlockNoteScreen from './screens/UnlockNoteScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  useEffect(() => {
    initUser(); // Khởi tạo tài khoản mẫu
  }, []);

  return (
    <ThemeProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Login">
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Detail" component={DetailNoteScreen} />
          <Stack.Screen name="Archive" component={ArchiveScreen} options={{ title: 'Ghi chú đã lưu' }} />
          <Stack.Screen name="Insert" component={InsertNoteScreen} options={{ title: 'Thêm ghi chú' }} />
          <Stack.Screen name="Edit" component={EditNoteScreen} />
          <Stack.Screen name="Settings" component={SettingsScreen} />
          <Stack.Screen name="LockNote" component={LockNoteScreen} options={{ title: 'Khóa ghi chú' }} />
          <Stack.Screen name="UnlockNote" component={UnlockNoteScreen} options={{ title: 'Mở khóa ghi chú' }} />
        </Stack.Navigator>
      </NavigationContainer>
    </ThemeProvider>
  );
}