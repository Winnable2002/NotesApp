import React, { useState } from 'react';
import {
  View,
  TextInput,
  Button,
  Alert,
  Text,
  StyleSheet,
  Keyboard,
} from 'react-native';
import { Note } from '../types';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

type RootStackParamList = {
  PasswordScreen: { note: Note; index: number; goToEdit?: boolean };
  Edit: { note: Note; index: number };
  Detail: { note: Note };
};

type Props = NativeStackScreenProps<RootStackParamList, 'PasswordScreen'>;

const PasswordScreen = ({ route, navigation }: Props) => {
  const { note, index, goToEdit } = route.params;
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleUnlock = () => {
    Keyboard.dismiss();
  
    // Kiểm tra mật khẩu không rỗng
    if (!password.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập mật khẩu.');
      return;
    }
  
    setIsLoading(true);
  
    setTimeout(() => {
      // Kiểm tra mật khẩu
      if (password === note.password) {
        // Nếu goToEdit là true, chuyển đến màn hình Edit
        if (goToEdit) {
          navigation.replace('Edit', { note, index });
        } else {
          // Nếu goToEdit là false, chuyển đến màn hình Detail
          navigation.replace('Detail', { note });
        }
      } else {
        Alert.alert('Sai mật khẩu', 'Vui lòng thử lại.');
      }
  
      setIsLoading(false);
    }, 500); // delay nhỏ để UX tự nhiên
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>🔒 Nhập mật khẩu để mở ghi chú:</Text>
      <TextInput
        style={styles.input}
        placeholder="Mật khẩu"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        editable={!isLoading}
      />
      <Button title={isLoading ? 'Đang mở...' : 'Mở'} onPress={handleUnlock} disabled={isLoading} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#FFF8DC',
  },
  label: {
    fontSize: 18,
    marginBottom: 12,
    textAlign: 'center',
    color: '#333',
  },
  input: {
    height: 44,
    borderColor: '#aaa',
    borderWidth: 1,
    paddingHorizontal: 12,
    marginBottom: 20,
    borderRadius: 6,
    backgroundColor: '#fff',
  },
});

export default PasswordScreen;
