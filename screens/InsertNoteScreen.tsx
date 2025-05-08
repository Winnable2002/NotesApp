import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  Modal,
  FlatList,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../ThemeContext';
import RNFS from 'react-native-fs'; // ✅ Thêm dòng này

export default function InsertNoteScreen() {
  const navigation = useNavigation();
  const { theme } = useTheme();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Danh sách ảnh trong thư mục assets
  const images = [
    { name: 'Apple', source: require('../assets/images/Apple.jpg') },
    { name: 'Book', source: require('../assets/images/Book.jpg') },
    { name: 'Swimming', source: require('../assets/images/Swimming.jpg') },
  ];

  const selectImage = (imageSource: any) => {
    const localImage = Image.resolveAssetSource(imageSource);
    setImageUri(localImage.uri);
    setModalVisible(false);
  };

  // ✅ Hàm ghi ghi chú vào file thật
  const saveNotesToFile = async (notes: any[]) => {
    try {
      const path = `${RNFS.DocumentDirectoryPath}/notes.json`;
      const json = JSON.stringify(notes, null, 2);
      await RNFS.writeFile(path, json, 'utf8');
      console.log('✅ File notes.json đã được lưu tại:', path);
    } catch (err) {
      console.error('❌ Lỗi ghi file notes.json:', err);
    }
  };

  const saveNote = async () => {
    if (!title.trim() || !content.trim()) {
      Alert.alert('⚠️ Vui lòng nhập tiêu đề và nội dung');
      return;
    }

    const newNote = {
      id: Date.now().toString(),
      title,
      content,
      imageUri,
      createdAt: new Date().toISOString(),
    };

    const existingNotes = await AsyncStorage.getItem('NOTES');
    const notes = existingNotes ? JSON.parse(existingNotes) : [];
    notes.push(newNote);

    await AsyncStorage.setItem('NOTES', JSON.stringify(notes));
    await saveNotesToFile(notes); // ✅ Ghi file thật sau khi lưu AsyncStorage

    Alert.alert('✅ Ghi chú đã được lưu!');
    navigation.goBack();
  };

  const themedStyles = getThemedStyles(theme);

  return (
    <View style={themedStyles.container}>
      <Text style={themedStyles.label}>Tiêu đề</Text>
      <TextInput
        style={themedStyles.input}
        value={title}
        onChangeText={setTitle}
        placeholder="Nhập tiêu đề..."
        placeholderTextColor={theme === 'dark' ? '#aaa' : '#888'}
      />

      <Text style={themedStyles.label}>Nội dung</Text>
      <TextInput
        style={[themedStyles.input, themedStyles.multilineInput]}
        value={content}
        onChangeText={setContent}
        placeholder="Nhập nội dung..."
        placeholderTextColor={theme === 'dark' ? '#aaa' : '#888'}
        multiline
        numberOfLines={6}
        textAlignVertical="top"
      />

      <TouchableOpacity style={themedStyles.imageButton} onPress={() => setModalVisible(true)}>
        <Text style={themedStyles.imageButtonText}>🖼️ Chọn ảnh từ thư mục assets</Text>
      </TouchableOpacity>

      {imageUri && (
        <Image
          source={{ uri: imageUri }}
          style={{ width: '100%', height: 200, borderRadius: 8, marginVertical: 10 }}
          resizeMode="cover"
        />
      )}

      <TouchableOpacity style={themedStyles.button} onPress={saveNote}>
        <Text style={themedStyles.buttonText}>💾 Lưu ghi chú</Text>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Chọn ảnh</Text>
            <FlatList
              data={images}
              renderItem={({ item }) => (
                <TouchableOpacity onPress={() => selectImage(item.source)} style={styles.imageOption}>
                  <Text style={styles.imageOptionText}>{item.name}</Text>
                </TouchableOpacity>
              )}
              keyExtractor={(item) => item.name}
            />
            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>Đóng</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const getThemedStyles = (theme: 'light' | 'dark') =>
  StyleSheet.create({
    container: {
      flex: 1,
      padding: 20,
      backgroundColor: theme === 'light' ? '#fff' : '#121212',
    },
    label: {
      fontSize: 16,
      fontWeight: 'bold',
      marginBottom: 8,
      color: theme === 'light' ? '#000' : '#fff',
    },
    input: {
      borderWidth: 1,
      borderColor: theme === 'light' ? '#ccc' : '#555',
      backgroundColor: theme === 'light' ? '#fff' : '#1e1e1e',
      color: theme === 'light' ? '#000' : '#fff',
      borderRadius: 8,
      padding: 12,
      marginBottom: 16,
    },
    multilineInput: {
      height: 120,
    },
    imageButton: {
      backgroundColor: '#6c63ff',
      padding: 12,
      borderRadius: 8,
      alignItems: 'center',
      marginBottom: 10,
    },
    imageButtonText: {
      color: '#fff',
      fontSize: 14,
      fontWeight: 'bold',
    },
    button: {
      backgroundColor: '#007bff',
      padding: 16,
      borderRadius: 8,
      alignItems: 'center',
    },
    buttonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: 'bold',
    },
  });

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 8,
    width: 300,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  imageOption: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  imageOptionText: {
    fontSize: 16,
  },
  closeButton: {
    marginTop: 10,
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});
