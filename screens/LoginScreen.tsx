import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { getUser } from '../utils/storage';

export default function LoginScreen({ navigation }: any) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    const user = await getUser();
    if (user && username === user.username && password === user.password) {
      navigation.replace('Home');
    } else {
      Alert.alert('Đăng nhập thất bại', 'Sai tên đăng nhập hoặc mật khẩu');
    }
  };

  return (
    <View style={styles.container}>
      <Image source={require('../assets/images/Note.png')} style={styles.logo} resizeMode="contain" />
      {/* <Text style={styles.title}>Đăng nhập</Text> */}
      <TextInput
        placeholder="Tên đăng nhập"
        style={styles.input}
        value={username}
        onChangeText={setUsername}
      />
      <TextInput
        placeholder="Mật khẩu"      
        style={styles.input}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
        <Text style={styles.loginButtonText}>Đăng nhập</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.registerButton} onPress={() => navigation.navigate('Register')}>
        <Text style={styles.registerButtonText}>Đăng ký</Text>
      </TouchableOpacity>
      
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#EEE8AA' },
  // title: { fontSize: 24, fontWeight: 'bold', marginBottom: 30, textAlign: 'center'},
  input: { borderWidth: 1, borderColor: '#000', padding: 15, marginBottom: 10, borderRadius: 10, marginHorizontal:10}, 

  logo: {
    width: '25%',
    height: '25%',
    alignSelf: 'center',
  },

  loginButton: {
    marginTop: 20,
    marginHorizontal: 10,
    backgroundColor: '#556B2F',
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: 'center',
  },

  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  registerButton:{
    marginTop: 20,
    marginHorizontal: 10,
    backgroundColor: '#556B2F',
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: 'center',
  },

  registerButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  
});