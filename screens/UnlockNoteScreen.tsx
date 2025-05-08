import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Note, RootStackParamList } from '../types';

interface UnlockNoteScreenProps {
  navigation: NativeStackNavigationProp<RootStackParamList, 'UnlockNote'>;
  route: { params: { note: Note; index: number } };
}

const UnlockNoteScreen: React.FC<UnlockNoteScreenProps> = ({ navigation, route }) => {
  const { note } = route.params;  // Lấy ghi chú từ route params
  const [password, setPassword] = useState('');  // Lưu trữ mật khẩu nhập vào

  // Hàm mở khóa ghi chú
  const handleUnlock = () => {
    if (password.trim() === note.password) {
      // Nếu đúng mật khẩu, điều hướng sang màn hình Detail và truyền noteId
      navigation.navigate('Detail', { noteId: note.id });  // Truyền noteId vào Detail
    } else {
      // Nếu sai mật khẩu, hiển thị thông báo lỗi
      Alert.alert('Sai mật khẩu', 'Mật khẩu bạn nhập không đúng. Vui lòng thử lại.');
    }
    Keyboard.dismiss();  // Tắt bàn phím sau khi nhấn mở khóa
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <Text style={styles.title}>🔓 Nhập mật khẩu để mở khóa</Text>

        <TextInput
          style={styles.input}
          placeholder="Nhập mật khẩu"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          placeholderTextColor="#aaa"
        />

        <TouchableOpacity style={styles.button} onPress={handleUnlock}>
          <Text style={styles.buttonText}>Mở khóa</Text>
        </TouchableOpacity>
      </View>
    </TouchableWithoutFeedback>
  );
};

export default UnlockNoteScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#f7f7f7',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 25,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#aaa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
    backgroundColor: '#fff',
    fontSize: 16,
    color: '#333',
  },
  button: {
    backgroundColor: '#28a745',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
