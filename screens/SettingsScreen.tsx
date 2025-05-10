import React from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity, Linking, Switch } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../ThemeContext';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';  // Import kiểu

// Xác định kiểu cho navigation
type SettingsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Settings'>;

export default function SettingsScreen() {
  const { theme, toggleTheme } = useTheme();
  const navigation = useNavigation<SettingsScreenNavigationProp>();  // Áp dụng kiểu

  const handleClearNotes = () => {
    Alert.alert(
      'Xoá tất cả ghi chú',
      'Bạn có chắc chắn muốn xoá toàn bộ ghi chú?',
      [
        { text: 'Huỷ', style: 'cancel' },
        {
          text: 'Xoá',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.removeItem('NOTES');
            Alert.alert('✅ Đã xoá toàn bộ ghi chú');
          },
        },
      ]
    );
  };

  const handleGoToArchive = () => {
    navigation.navigate('Archive');  // Điều hướng đến màn hình Archive
  };

  const handleLogout = async () => {
    // Xử lý đăng xuất, ví dụ xóa thông tin người dùng trong AsyncStorage
    await AsyncStorage.removeItem('USER_TOKEN');  // Giả sử bạn lưu token đăng nhập
    navigation.navigate('Login');  // Điều hướng về màn hình đăng nhập
    Alert.alert('Đăng xuất thành công');
  };

  return (
    <View style={[styles.container, { backgroundColor: theme === 'light' ? '#EEE8AA' : '#121212' }]}>
      <TouchableOpacity
        style={[styles.item, { backgroundColor: theme === 'light' ? '#E6E6FA' : '#333' }]}
        onPress={handleClearNotes}
      >
        <Text style={[styles.itemText, { color: theme === 'light' ? '#000' : '#fff' }]}>🗑️ Xoá tất cả ghi chú</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.item, { backgroundColor: theme === 'light' ? '#E6E6FA' : '#333' }]}
        onPress={() => Linking.openURL('mailto:youremail@example.com')}
      >
        <Text style={[styles.itemText, { color: theme === 'light' ? '#000' : '#fff' }]}>📧 Gửi góp ý</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.item, { backgroundColor: theme === 'light' ? '#E6E6FA' : '#333' }]}
        onPress={handleGoToArchive}
      >
        <Text style={[styles.itemText, { color: theme === 'light' ? '#000' : '#fff' }]}>📦 Xem ghi chú đã lưu trữ</Text>
      </TouchableOpacity>

      <View style={styles.themeSwitchContainer}>
        <Text style={[styles.switchLabel, { color: theme === 'light' ? '#000' : '#fff' }]}>Chế độ Dark/Light</Text>
        <Switch
          value={theme === 'dark'}
          onValueChange={toggleTheme}
        />
      </View>

      <View style={styles.infoBox}>
        <Text style={[styles.infoText, { color: theme === 'light' ? '#000' : '#fff' }]}>Phiên bản: 1.0.0</Text>
        <Text style={[styles.infoText, { color: theme === 'light' ? '#000' : '#fff' }]}>Tác giả: 2124802010075@student.tdmu.edu.vn</Text>

        {/* Nút đăng xuất */}
      </View>
      <View style={styles.logoutContainer}><TouchableOpacity
        style={[styles.item, { backgroundColor: theme === 'light' ? '#FF6347' : '#BB2D3B' }]}
        onPress={handleLogout}
      >
        <Text style={[styles.itemTextLogout, { color: '#fff' }]}> Đăng xuất</Text>
      </TouchableOpacity></View>
      
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 20 
  },

  header: { 
    fontSize: 22, 
    fontWeight: 'bold', 
    marginBottom: 20 
  },

  item: {
    padding: 14,
    borderRadius: 8,
    marginBottom: 12,
  },

  itemText: { fontSize: 16, },

  themeSwitchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    marginTop: 15,
  },

  switchLabel: {
    fontSize: 16,
  },

  infoBox: { marginTop: 330, },
  infoText: { fontSize: 14, marginBottom: 4 , textAlign: 'center'},
  logoutContainer: { marginTop: 'auto',  marginBottom: 20,},
  itemTextLogout: { fontSize: 16, textAlign: 'center'},

});
