import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, Alert, TextInput, TouchableOpacity } from 'react-native';
import RNFS from 'react-native-fs'; // Thư viện react-native-fs
import { useTheme } from '../ThemeContext';

type Note = {
  title: string;
  content: string;
  imageUri?: string;
  createdAt: string;
  password?: string; // Có thể có trường mật khẩu để khóa ghi chú
};

type DetailNoteScreenProps = {
  route: {
    params: {
      note: Note;
      index: number;
    };
  };
};

const NOTES_FILE_PATH = RNFS.DocumentDirectoryPath + '/notes.json'; // Đường dẫn tới tệp ghi chú

export default function DetailNoteScreen({ route }: DetailNoteScreenProps) {
  const { note, index } = route.params; // Nhận note và index từ route
  const [updatedNote, setUpdatedNote] = useState<Note | null>(null); // State để lưu ghi chú đã tải
  const [password, setPassword] = useState(''); // State để lưu mật khẩu người dùng nhập
  const [isLocked, setIsLocked] = useState(false); // Kiểm tra xem ghi chú có bị khóa không
  const { theme } = useTheme(); // Dùng theme từ context
  const themedStyles = getThemedStyles(theme); // Lấy các style theo theme

  useEffect(() => {
    const fetchNote = async () => {
      try {
        const fileExists = await RNFS.exists(NOTES_FILE_PATH); // Kiểm tra xem tệp ghi chú có tồn tại không
        if (fileExists) {
          const fileContent = await RNFS.readFile(NOTES_FILE_PATH); // Đọc tệp ghi chú
          const notes = JSON.parse(fileContent); // Parse dữ liệu JSON
          const updated = notes[index]; // Tìm ghi chú theo index
          if (updated) {
            setUpdatedNote(updated); // Nếu tìm thấy, lưu vào state
            if (updated.password) {
              setIsLocked(true); // Nếu có mật khẩu, ghi chú bị khóa
            }
          } else {
            setUpdatedNote(note); // Nếu không tìm thấy, dùng ghi chú từ props
          }
        } else {
          setUpdatedNote(note); // Nếu tệp không tồn tại, dùng ghi chú từ props
        }
      } catch (error) {
        console.error('Lỗi khi đọc tệp ghi chú:', error);
        Alert.alert('Lỗi', 'Không thể tải ghi chú.');
      }
    };

    fetchNote(); // Gọi hàm để tải lại ghi chú
  }, [index, note]); // Mỗi khi `index` hoặc `note` thay đổi, chạy lại useEffect

  const handleUnlock = () => {
    if (updatedNote && updatedNote.password && password === updatedNote.password) {
      setIsLocked(false); // Nếu mật khẩu đúng, mở khóa ghi chú
    } else {
      Alert.alert('Sai mật khẩu', 'Mật khẩu bạn nhập không đúng. Vui lòng thử lại.');
    }
  };

  // Nếu chưa tải được ghi chú (state updatedNote là null), hiển thị loading
  if (!updatedNote) {
    return (
      <View style={themedStyles.container}>
        <Text style={themedStyles.title}>Đang tải...</Text>
      </View>
    );
  }

  return (
    <View style={themedStyles.container}>
      {isLocked ? (
        <View style={themedStyles.unlockContainer}>
          <Text style={themedStyles.title}>🔒 Nhập mật khẩu để mở khóa ghi chú</Text>
          <TextInput
            style={themedStyles.input}
            placeholder="Nhập mật khẩu"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            placeholderTextColor="#aaa"
          />
          <TouchableOpacity style={themedStyles.button} onPress={handleUnlock}>
            <Text style={themedStyles.buttonText}>Mở khóa</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View>
          {/* Hiển thị ảnh nếu có */}
          {updatedNote.imageUri && (
            <Image source={{ uri: updatedNote.imageUri }} style={themedStyles.image} resizeMode="cover" />
          )}

          {/* Hiển thị tiêu đề */}
          <Text style={themedStyles.title}>{updatedNote.title}</Text>

          {/* Hiển thị ngày tạo nếu có, nếu không có thì hiển thị 'Không có ngày' */}
          <Text style={themedStyles.dateText}>
            {updatedNote.createdAt ? new Date(updatedNote.createdAt).toLocaleString() : 'Không có ngày'}
          </Text>

          {/* Hiển thị nội dung */}
          <Text style={themedStyles.content}>{updatedNote.content}</Text>
        </View>
      )}
    </View>
  );
}

// Style theo theme (sáng/tối)
const getThemedStyles = (theme: 'light' | 'dark') =>
  StyleSheet.create({
    container: {
      flex: 1,
      padding: 20,
      backgroundColor: theme === 'light' ? '#EEE8AA' : '#121212',
    },
    title: {
      textAlign: 'center',
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 10,
      color: theme === 'light' ? '#000' : '#fff',
    },
    dateText: {
      fontSize: 14,
      color: '#999',
      marginBottom: 15,
      textAlign: 'center',
    },
    content: {
      fontSize: 16,
      lineHeight: 24,
      color: theme === 'light' ? '#333' : '#ccc',
    },
    image: {
      width: '85%',
      height: 300,
      borderRadius: 8,
      marginBottom: 15,
      alignSelf: 'center',
    },
    unlockContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
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
