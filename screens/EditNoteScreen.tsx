import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, Image, TouchableOpacity, Modal, SafeAreaView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../ThemeContext';

const imageMap = {
  'Apple.jpg': require('../assets/images/Apple.jpg'),
  'Book.jpg': require('../assets/images/Book.jpg'),
  'Swimming.jpg': require('../assets/images/Swimming.jpg'),
};

const NOTES_KEY = 'NOTES';

export default function EditNoteScreen({ route, navigation }: any) {
  const { note, index } = route.params;
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);
  const [imageName, setImageName] = useState<keyof typeof imageMap | null>(note.image || null);
  const [modalVisible, setModalVisible] = useState(false);
  const { theme } = useTheme();
  const themedStyles = getThemedStyles(theme);

  const handleUpdate = async () => {
    if (title.trim() === '' || content.trim() === '') {
      Alert.alert('Lỗi', 'Vui lòng nhập tiêu đề và nội dung');
      return;
    }

    const json = await AsyncStorage.getItem(NOTES_KEY);
    const notes = json ? JSON.parse(json) : [];

    notes[index] = {
      ...notes[index],
      title,
      content,
      image: imageName, // Lưu ảnh mới hoặc không lưu nếu ảnh bị xóa
      updatedAt: new Date().toLocaleString(),
    };

    await AsyncStorage.setItem(NOTES_KEY, JSON.stringify(notes));
    Alert.alert('Đã cập nhật ghi chú thành công!');

    setTimeout(() => {
      navigation.goBack();
    }, 1000);
  };

  const selectImage = (selectedName: keyof typeof imageMap) => {
    setImageName(selectedName); // Chọn ảnh mới
    setModalVisible(false); // Đóng modal
  };

  const deleteImage = () => {
    setImageName(null); // Xóa ảnh hiện tại
  };

  return (
    <View style={themedStyles.container}>
      <Text style={themedStyles.label}>Tiêu đề</Text>
      <TextInput
        placeholder="Tiêu đề"
        style={themedStyles.input}
        value={title}
        onChangeText={setTitle}
      />

      <Text style={themedStyles.label}>Nội dung</Text>
      <TextInput
        placeholder="Nội dung"
        style={[themedStyles.input, { height: 100 }]}
        multiline
        value={content}
        onChangeText={setContent}
      />

      {/* Hiển thị ảnh nếu có */}
      {imageName && imageMap[imageName] && (
        <View style={themedStyles.imageContainer}>
          <Image
            source={imageMap[imageName]}
            style={themedStyles.image}
            resizeMode="cover"
          />
          {/* Nút xóa ảnh */}
          <TouchableOpacity onPress={deleteImage} style={themedStyles.deleteButton}>
            <Text style={themedStyles.deleteButtonText}>Xóa ảnh</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Nút cập nhật */}
      <TouchableOpacity style={themedStyles.button} onPress={handleUpdate}>
        <Text style={themedStyles.buttonText}>Cập nhật</Text>
      </TouchableOpacity>

      {/* Nút mở modal chọn ảnh */}
      <TouchableOpacity onPress={() => setModalVisible(true)} style={themedStyles.button}>
        <Text style={themedStyles.buttonText}>Chọn ảnh</Text>
      </TouchableOpacity>

      {/* Modal chọn ảnh */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <SafeAreaView style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Chọn ảnh</Text>
            {Object.keys(imageMap).map((img, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => selectImage(img as keyof typeof imageMap)} // Chọn ảnh mới
                style={styles.imageOption}
              >
                <Text style={styles.imageOptionText}>{img}</Text>
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              style={styles.closeButton}
            >
              <Text style={styles.closeButtonText}>Đóng</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    </View>
  );
}

const getThemedStyles = (theme: 'light' | 'dark') =>
  StyleSheet.create({
    container: {
      flex: 1,
      padding: 20,
      backgroundColor: theme === 'light' ? '#EEE8AA' : '#121212',
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
    button: {
      padding: 16,
      backgroundColor: '#007bff',
      borderRadius: 8,
      alignItems: 'center',
      marginTop: 20,
    },
    buttonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: 'bold',
    },
    imageContainer: {
      alignItems: 'center',
      marginBottom: 16,
    },
    image: {
      width: 150,
      height: 100,
      borderRadius: 8,
    },
    deleteButton: {
      marginTop: 10,
      backgroundColor: '#FF6347', // Màu đỏ
      padding: 10,
      borderRadius: 8,
      alignItems: 'center',
    },
    deleteButtonText: {
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
