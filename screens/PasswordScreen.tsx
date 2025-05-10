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
  PasswordScreen: {
    note: Note;
    index: number;
    goToEdit?: boolean;
    onUnlock?: (unlockedNote: Note) => void;
  };
  Edit: { note: Note; index: number };
  Detail: { note: Note };
};

type Props = NativeStackScreenProps<RootStackParamList, 'PasswordScreen'>;

const PasswordScreen = ({ route, navigation }: Props) => {
  const { note, index, goToEdit, onUnlock } = route.params; // ✅ destructuring đúng
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleUnlock = () => {
    Keyboard.dismiss();

    if (!password.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập mật khẩu.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      if (password === note.password) {
        onUnlock?.({ ...note, locked: false }); // ✅ gọi callback nếu có

        if (goToEdit) {
          navigation.replace('Edit', { note, index });
        } else {
          navigation.replace('Detail', { note });
        }
      } else {
        Alert.alert('Sai mật khẩu', 'Vui lòng thử lại.');
      }

      setIsLoading(false);
    }, 500);
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
      <Button
        title={isLoading ? 'Đang mở...' : 'Mở'}
        onPress={handleUnlock}
        disabled={isLoading}
      />
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
