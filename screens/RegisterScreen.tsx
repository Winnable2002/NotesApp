import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import RNFS from 'react-native-fs';

export default function RegisterScreen({ navigation }: any) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleRegister = async () => {
    if (!username.trim()) {
      Alert.alert('Lỗi', 'Tên đăng nhập không được để trống');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Lỗi', 'Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Lỗi', 'Mật khẩu xác nhận không khớp');
      return;
    }

    const userFile = `${RNFS.DocumentDirectoryPath}/user.json`;
    const exists = await RNFS.exists(userFile);

    if (exists) {
      const content = await RNFS.readFile(userFile, 'utf8');
      const existingUser = JSON.parse(content);
      if (existingUser.username === username) {
        Alert.alert('Lỗi', 'Tên đăng nhập đã tồn tại');
        return;
      }
    }

    const newUser = { username, password };
    await RNFS.writeFile(userFile, JSON.stringify(newUser), 'utf8');
    Alert.alert('Đăng ký thành công', 'Bạn có thể đăng nhập ngay bây giờ!');
    navigation.replace('Login');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Đăng ký</Text>

      <TextInput
        placeholder="Tên đăng nhập"
        style={styles.input}
        value={username}
        onChangeText={setUsername}
      />
      <TextInput
        placeholder="Mật khẩu"
        secureTextEntry
        style={styles.input}
        value={password}
        onChangeText={setPassword}
      />
      <TextInput
        placeholder="Xác nhận mật khẩu"
        secureTextEntry
        style={styles.input}
        value={confirmPassword}
        onChangeText={setConfirmPassword}
      />

      <TouchableOpacity style={styles.registerButton} onPress={handleRegister}>
        <Text style={styles.registerButtonText}>Đăng ký</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={styles.backText}>← Quay lại trang đăng nhập</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#EEE8AA' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 50, textAlign: 'center' },
  input: {
    borderWidth: 1,
    borderColor: '#000',
    padding: 15,
    marginBottom: 10,
    borderRadius: 10,
    marginHorizontal: 10,
  },
  registerButton: {
    marginTop: 20,
    marginHorizontal: 10,
    backgroundColor: '#8B0000',
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: 'center',
  },
  registerButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  backText: {
    marginTop: 25,
    textAlign: 'center',
    color: '#333',
    fontSize: 16,
    textDecorationLine: 'underline',
  },
});